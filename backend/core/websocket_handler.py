"""
WebSocket handler for Voice Agent
Manages bidirectional communication and orchestrates STT → LLM → TTS pipeline
"""
import json
import logging
import asyncio
from typing import Optional
from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect
from core.models import (
    AudioChunk, TranscriptPartial, TranscriptCommitted,
    AudioResponse, StatusMessage, ErrorMessage, InterruptSignal
)
from services.elevenlabs_stt import ElevenLabsSTT
from services.llm_engine import LLMEngine
from services.elevenlabs_tts import ElevenLabsTTS

logger = logging.getLogger(__name__)

class WebSocketHandler:
    """Handles WebSocket connection and message routing"""
    
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.is_connected = False
        self.is_processing = False
        self.conversation_history = []
        
        # Initialize services
        self.stt = ElevenLabsSTT()
        self.llm = LLMEngine()
        self.tts = ElevenLabsTTS()
        
        # Audio buffer for accumulating chunks
        self.audio_buffer = []
        self.is_speaking = False
        
        # Setup STT callbacks
        self.stt.set_callbacks(
            on_partial=self.handle_partial_transcript,
            on_committed=self.handle_committed_transcript,
            on_error=self.handle_stt_error
        )
        
    async def connect(self):
        """Accept WebSocket connection"""
        await self.websocket.accept()
        self.is_connected = True
        
        # Connect STT service
        await self.stt.connect()
        
        # Send connected status
        await self.send_status("connected", "WebSocket connection established")
        
    async def disconnect(self):
        """Close WebSocket connection"""
        if not self.is_connected:
            return
            
        self.is_connected = False
        
        try:
            # Disconnect STT service
            await self.stt.disconnect()
        except Exception as e:
            logger.debug(f"Error disconnecting STT: {e}")
        
        try:
            await self.websocket.close()
        except Exception as e:
            # Ignore errors if already closed
            if "after sending 'websocket.close'" not in str(e):
                logger.debug(f"Error closing WebSocket: {e}")
    
    async def send_message(self, message: dict):
        """Send message to frontend"""
        if not self.is_connected:
            return
        try:
            await self.websocket.send_json(message)
        except Exception as e:
            if "after sending 'websocket.close'" not in str(e):
                logger.error(f"Error sending message: {e}")
    
    async def send_status(self, state: str, message: str = None):
        """Send status update"""
        if not self.is_connected:
            return
        status = StatusMessage(state=state, message=message)
        try:
            await self.send_message(status.dict())
        except Exception as e:
            logger.debug(f"Error sending status: {e}")
    
    async def send_error(self, code: str, message: str):
        """Send error message"""
        if not self.is_connected:
            return
        error = ErrorMessage(code=code, message=message)
        try:
            await self.send_message(error.dict())
        except Exception as e:
            logger.debug(f"Error sending error message: {e}")
    
    async def send_transcript_partial(self, text: str):
        """Send partial transcript"""
        transcript = TranscriptPartial(text=text)
        logger.info(f"Sending partial transcript: {text}")
        await self.send_message(transcript.dict())
    
    async def send_transcript_committed(self, text: str):
        """Send committed transcript"""
        transcript = TranscriptCommitted(text=text)
        logger.info(f"Sending committed transcript: {text}")
        await self.send_message(transcript.dict())
        
        # Add to conversation history
        self.conversation_history.append({"role": "user", "content": text})
    
    async def send_audio(self, audio_data: str, format: str = 'pcm', sample_rate: int = 24000):
        """Send audio response"""
        audio = AudioResponse(data=audio_data, format=format, sample_rate=sample_rate)
        await self.send_message(audio.dict())
    
    async def handle_audio_chunk(self, data: dict):
        """
        Handle incoming audio chunk from frontend
        Just pass to STT for now (no LLM/TTS)
        """
        try:
            audio_chunk = AudioChunk(**data)
            logger.debug(f"✅ Audio chunk validated: {len(audio_chunk.data)} chars")
            
            # Update status
            if not self.is_processing:
                self.is_processing = True
                await self.send_status("listening", "Listening to audio")
            
            # Process audio chunk through STT (just buffer it)
            await self.stt.process_audio_chunk(audio_chunk.data)
            
        except Exception as e:
            logger.error(f"❌ Error handling audio chunk: {e}", exc_info=True)
            await self.send_error("AUDIO_PROCESSING_ERROR", str(e))
    
    async def handle_partial_transcript(self, text: str):
        """Handle partial transcript from STT"""
        try:
            await self.send_transcript_partial(text)
        except Exception as e:
            logger.error(f"Error handling partial transcript: {e}")
    
    async def handle_committed_transcript(self, text: str):
        """
        Handle committed transcript from STT
        FOR NOW: Just send to frontend, NO LLM/TTS
        """
        try:
            # Send committed transcript to frontend
            await self.send_transcript_committed(text)
            
            logger.info(f"✅ Transcript sent to frontend: {text}")
            
            # Reset state
            self.is_processing = False
            await self.send_status("idle", "Ready")
            
            # TODO: Uncomment when ready to test LLM/TTS
            # # Generate AI response
            # await self.send_status("thinking", "Generating response")
            # response_text = await self.llm.generate_response(text, self.conversation_history)
            # 
            # # Synthesize speech
            # await self.send_status("speaking", "Generating audio")
            # audio_data = await self.tts.synthesize_speech_base64(response_text)
            # await self.send_audio(audio_data, format='mp3', sample_rate=22050)
            
        except Exception as e:
            logger.error(f"Error handling committed transcript: {e}")
            await self.send_error("PIPELINE_ERROR", str(e))
            self.is_processing = False
    
    async def handle_stt_error(self, error: str):
        """Handle STT service error"""
        logger.error(f"STT error: {error}")
        await self.send_error("STT_ERROR", error)
        self.is_processing = False
    
    async def handle_speech_end(self, data: dict):
        """
        Handle speech_end signal from frontend
        Finalize transcription
        """
        try:
            logger.info("🛑 Speech end signal received, finalizing transcript...")
            
            # Finalize transcript
            transcript = await self.stt.finalize_transcript()
            
            if not transcript:
                logger.warning("⚠️ No transcript generated")
                self.is_processing = False
                await self.send_status("idle", "No speech detected")
            
        except Exception as e:
            logger.error(f"Error handling speech end: {e}")
            await self.send_error("SPEECH_END_ERROR", str(e))
            self.is_processing = False
    
    async def handle_config(self, data: dict):
        """Handle configuration message from frontend"""
        try:
            logger.info(f"Received config: {data}")
            # Configuration is already loaded from environment
            # This is just for logging/debugging
        except Exception as e:
            logger.error(f"Error handling config: {e}")
    
    async def handle_messages(self):
        """Main message handling loop"""
        try:
            while self.is_connected:
                # Receive message from frontend
                message = await self.websocket.receive_text()
                logger.info(f"📨 Raw message received: {message[:200]}...")  # Log first 200 chars
                
                data = json.loads(message)
                logger.info(f"📦 Parsed message type: {data.get('type')}")
                
                # Route message based on type
                message_type = data.get('type')
                
                if message_type == 'audio':
                    await self.handle_audio_chunk(data)
                elif message_type == 'speech_end':
                    await self.handle_speech_end(data)
                elif message_type == 'interrupt':
                    # Keep for future use
                    logger.info("Interrupt signal received (ignored for now)")
                elif message_type == 'config':
                    await self.handle_config(data)
                else:
                    logger.warning(f"Unknown message type: {message_type}")
                    
        except WebSocketDisconnect:
            # Normal disconnection, no need to log as error
            logger.info("Client disconnected normally")
        except Exception as e:
            # Only log unexpected errors
            if "after sending 'websocket.close'" not in str(e):
                logger.error(f"Error in message handling loop: {e}")
            try:
                await self.send_error("WEBSOCKET_ERROR", str(e))
            except:
                pass  # Connection might already be closed

"""
ElevenLabs Speech-to-Text service - Real-time WebSocket implementation
Uses ElevenLabs realtime STT API for streaming transcription
"""
import base64
import asyncio
import logging
from typing import Optional, Callable
from elevenlabs import ElevenLabs, RealtimeEvents
from elevenlabs.realtime.scribe import RealtimeAudioOptions, AudioFormat
from core.config import get_settings

logger = logging.getLogger(__name__)

class ElevenLabsSTT:
    """Real-time STT using ElevenLabs WebSocket API"""
    
    def __init__(self):
        settings = get_settings()
        self.client = ElevenLabs(api_key=settings.elevenlabs.api_key)
        self.model_id = settings.elevenlabs.model_id
        self.language = settings.elevenlabs.language
        self.is_connected = False
        self.connection = None
        
        # Callbacks
        self.on_partial_transcript: Optional[Callable] = None
        self.on_committed_transcript: Optional[Callable] = None
        self.on_error: Optional[Callable] = None
        
        logger.info(f"✅ ElevenLabsSTT initialized (model: {self.model_id}, lang: {self.language})")
    
    async def connect(self):
        """Connect to ElevenLabs realtime STT WebSocket"""
        try:
            if self.is_connected and self.connection:
                logger.info("Already connected to STT")
                return
            
            logger.info(f"🔌 Connecting to ElevenLabs STT (model: {self.model_id})...")
            
            # Create audio options for input streaming
            options = RealtimeAudioOptions(
                model_id=self.model_id,
                audio_format=AudioFormat.PCM_16000,  # 16kHz PCM
                sample_rate=16000,
                include_timestamps=False
            )
            
            # Connect to realtime STT
            self.connection = await self.client.speech_to_text.realtime.connect(options)
            
            # Register event handlers
            self.connection.on(RealtimeEvents.SESSION_STARTED, self._on_session_started)
            self.connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, self._on_partial_transcript_sync)
            self.connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, self._on_committed_transcript_sync)
            self.connection.on(RealtimeEvents.ERROR, self._on_error_sync)
            self.connection.on(RealtimeEvents.CLOSE, self._on_close)
            
            self.is_connected = True
            logger.info("✅ STT WebSocket connected")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to STT: {e}")
            if self.on_error:
                await self.on_error(str(e))
            raise
    
    async def disconnect(self):
        """Disconnect from ElevenLabs STT"""
        try:
            if self.connection:
                await self.connection.close()
                self.connection = None
            self.is_connected = False
            logger.info("STT disconnected")
        except Exception as e:
            logger.error(f"Error disconnecting STT: {e}")
    
    # Event handlers
    def _on_session_started(self, data):
        """Called when STT session starts"""
        logger.info(f"📡 STT session started: {type(data)} - {data}")
    
    def _on_partial_transcript_sync(self, data):
        """Synchronous wrapper for partial transcript handler"""
        logger.debug(f"📝 Partial transcript data type: {type(data)}, value: {data}")
        asyncio.create_task(self._on_partial_transcript(data))
    
    async def _on_partial_transcript(self, data):
        """Called when partial transcript is received"""
        try:
            # Handle different data types
            if isinstance(data, dict):
                text = data.get('text', '')
            elif hasattr(data, 'text'):
                text = data.text
            elif isinstance(data, bytes):
                # Decode bytes if needed
                text = data.decode('utf-8') if data else ''
            else:
                text = str(data)
            
            if text and self.on_partial_transcript:
                logger.debug(f"📝 Partial: {text}")
                await self.on_partial_transcript(text)
        except Exception as e:
            logger.error(f"Error in partial transcript handler: {e}", exc_info=True)
    
    def _on_committed_transcript_sync(self, data):
        """Synchronous wrapper for committed transcript handler"""
        logger.info(f"✅ Committed transcript data type: {type(data)}, value: {data}")
        asyncio.create_task(self._on_committed_transcript(data))
    
    async def _on_committed_transcript(self, data):
        """Called when committed transcript is received"""
        try:
            # Handle different data types
            if isinstance(data, dict):
                text = data.get('text', '')
            elif hasattr(data, 'text'):
                text = data.text
            elif isinstance(data, bytes):
                # Decode bytes if needed
                text = data.decode('utf-8') if data else ''
            else:
                text = str(data)
            
            if text and self.on_committed_transcript:
                logger.info(f"✅ Committed: {text}")
                await self.on_committed_transcript(text)
        except Exception as e:
            logger.error(f"Error in committed transcript handler: {e}", exc_info=True)
    
    async def _on_error(self, error):
        """Called when error occurs"""
        logger.error(f"❌ STT error: {error}")
        if self.on_error:
            await self.on_error(str(error))
    
    def _on_error_sync(self, error):
        """Synchronous wrapper for error handler"""
        logger.error(f"❌ STT error: {error}")
        if self.on_error:
            # Create a task to run the async callback
            asyncio.create_task(self.on_error(str(error)))
    
    def _on_close(self):
        """Called when connection closes"""
        logger.info("STT connection closed")
        self.is_connected = False
    
    async def process_audio_chunk(self, audio_data: str):
        """
        Send audio chunk to ElevenLabs realtime STT
        
        Args:
            audio_data: Base64 encoded PCM audio (16kHz, mono, 16-bit)
        """
        try:
            if not self.is_connected or not self.connection:
                await self.connect()
            
            # The connection.send() expects a dict with audio_base_64 key
            # audio_data is already base64 encoded from frontend
            audio_message = {
                "audio_base_64": audio_data
            }
            
            # Send audio to ElevenLabs WebSocket
            result = self.connection.send(audio_message)
            # If result is awaitable, await it
            if hasattr(result, '__await__'):
                await result
            
        except Exception as e:
            logger.error(f"❌ Error sending audio: {e}", exc_info=True)
            if self.on_error:
                await self.on_error(str(e))
    
    async def finalize_transcript(self) -> Optional[str]:
        """
        Signal end of speech to ElevenLabs by calling commit()
        The committed transcript will come through the event handler
        """
        try:
            if not self.is_connected or not self.connection:
                logger.warning("⚠️ Not connected to STT")
                return None
            
            logger.info("🛑 Calling commit() to finalize transcript")
            # Call commit to finalize the transcript
            result = self.connection.commit()
            if hasattr(result, '__await__'):
                await result
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error finalizing transcript: {e}", exc_info=True)
            if self.on_error:
                await self.on_error(str(e))
            return None
    
    def set_callbacks(
        self,
        on_partial: Optional[Callable] = None,
        on_committed: Optional[Callable] = None,
        on_error: Optional[Callable] = None
    ):
        """Set callback functions"""
        if on_partial:
            self.on_partial_transcript = on_partial
        if on_committed:
            self.on_committed_transcript = on_committed
        if on_error:
            self.on_error = on_error

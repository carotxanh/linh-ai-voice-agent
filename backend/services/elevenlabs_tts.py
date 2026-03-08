"""
ElevenLabs Text-to-Speech Service
Handles audio synthesis using ElevenLabs TTS API
"""
import logging
import base64
from typing import Optional, AsyncGenerator
from elevenlabs import ElevenLabs, VoiceSettings
from core.config import get_settings

logger = logging.getLogger(__name__)

class ElevenLabsTTS:
    """ElevenLabs Text-to-Speech service"""
    
    def __init__(self):
        settings = get_settings()
        self.client = ElevenLabs(api_key=settings.elevenlabs.api_key)
        self.voice_id = settings.elevenlabs.voice_id
        self.language = settings.elevenlabs.language
        
        # Voice settings optimized for Vietnamese
        self.voice_settings = VoiceSettings(
            stability=0.5,
            similarity_boost=0.75,
            style=0.0,
            use_speaker_boost=True,
            speed=1.0,
        )
        
        logger.info(f"ElevenLabsTTS initialized with voice: {self.voice_id}")
    
    async def synthesize_speech(self, text: str) -> bytes:
        """
        Synthesize speech from text (non-streaming)
        
        Args:
            text: Text to convert to speech
        
        Returns:
            Audio data as bytes
        """
        try:
            logger.info(f"Synthesizing speech: {text[:50]}...")
            
            # Generate audio using ElevenLabs API
            response = self.client.text_to_speech.convert(
                voice_id=self.voice_id,
                output_format="mp3_22050_32",  # MP3 format, 22050 Hz, 32 kbps
                text=text,
                model_id="eleven_multilingual_v2",  # Supports Vietnamese
                voice_settings=self.voice_settings,
            )
            
            # Collect all audio chunks
            audio_data = b""
            for chunk in response:
                if chunk:
                    audio_data += chunk
            
            logger.info(f"Generated audio: {len(audio_data)} bytes")
            return audio_data
            
        except Exception as e:
            logger.error(f"Error synthesizing speech: {e}")
            raise
    
    async def synthesize_speech_base64(self, text: str) -> str:
        """
        Synthesize speech and return as base64 encoded string
        
        Args:
            text: Text to convert to speech
        
        Returns:
            Base64 encoded audio data
        """
        try:
            audio_data = await self.synthesize_speech(text)
            return base64.b64encode(audio_data).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error synthesizing speech to base64: {e}")
            raise
    
    async def synthesize_speech_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        """
        Synthesize speech from text with streaming
        
        Args:
            text: Text to convert to speech
        
        Yields:
            Audio data chunks as bytes
        """
        try:
            logger.info(f"Streaming speech synthesis: {text[:50]}...")
            
            # Use streaming API
            response = self.client.text_to_speech.stream(
                voice_id=self.voice_id,
                output_format="mp3_22050_32",
                text=text,
                model_id="eleven_multilingual_v2",
                voice_settings=self.voice_settings,
            )
            
            # Stream audio chunks
            for chunk in response:
                if chunk:
                    yield chunk
            
            logger.info("Streaming synthesis complete")
            
        except Exception as e:
            logger.error(f"Error in streaming synthesis: {e}")
            raise
    
    async def synthesize_speech_stream_base64(
        self,
        text: str
    ) -> AsyncGenerator[str, None]:
        """
        Synthesize speech with streaming and return base64 encoded chunks
        
        Args:
            text: Text to convert to speech
        
        Yields:
            Base64 encoded audio data chunks
        """
        try:
            async for chunk in self.synthesize_speech_stream(text):
                yield base64.b64encode(chunk).decode('utf-8')
                
        except Exception as e:
            logger.error(f"Error in streaming synthesis to base64: {e}")
            raise
    
    def update_voice_settings(
        self,
        stability: Optional[float] = None,
        similarity_boost: Optional[float] = None,
        style: Optional[float] = None,
        speed: Optional[float] = None,
    ):
        """
        Update voice settings
        
        Args:
            stability: Voice stability (0.0 - 1.0)
            similarity_boost: Voice similarity boost (0.0 - 1.0)
            style: Voice style (0.0 - 1.0)
            speed: Speech speed (0.25 - 4.0)
        """
        if stability is not None:
            self.voice_settings.stability = stability
        if similarity_boost is not None:
            self.voice_settings.similarity_boost = similarity_boost
        if style is not None:
            self.voice_settings.style = style
        if speed is not None:
            self.voice_settings.speed = speed
        
        logger.info(f"Voice settings updated: {self.voice_settings}")

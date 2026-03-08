"""
Data models for Voice Agent backend
"""
from typing import Literal, Optional, Union, List
from pydantic import BaseModel, field_validator
import base64

class AudioChunk(BaseModel):
    """Audio chunk from frontend"""
    type: Literal['audio'] = 'audio'
    data: Union[str, List[int]]  # base64 encoded PCM or array of PCM samples
    timestamp: Optional[float] = None
    sample_rate: int = 16000
    sampleRate: Optional[int] = None  # Alternative field name from frontend
    format: str = 'pcm16'
    
    @field_validator('data')
    @classmethod
    def convert_data_to_base64(cls, v):
        """Convert array data to base64 string if needed"""
        if isinstance(v, list):
            # Convert list of integers to bytes
            # Handle both signed and unsigned integers
            byte_array = bytearray()
            for num in v:
                # Convert to signed 16-bit integer
                if num < 0:
                    num = num + 65536
                # Add as little-endian 16-bit integer
                byte_array.append(num & 0xFF)
                byte_array.append((num >> 8) & 0xFF)
            # Encode as base64
            return base64.b64encode(bytes(byte_array)).decode('utf-8')
        return v
    
    def model_post_init(self, __context):
        """Set sample_rate from sampleRate if provided"""
        if self.sampleRate is not None:
            self.sample_rate = self.sampleRate

class TranscriptPartial(BaseModel):
    """Partial transcript message"""
    type: Literal['transcript_partial'] = 'transcript_partial'
    text: str
    timestamp: Optional[float] = None

class TranscriptCommitted(BaseModel):
    """Committed transcript message"""
    type: Literal['transcript_committed'] = 'transcript_committed'
    text: str
    timestamp: Optional[float] = None
    is_final: bool = True

class AudioResponse(BaseModel):
    """Audio response from TTS"""
    type: Literal['audio'] = 'audio'
    data: str  # base64 encoded audio
    format: Literal['pcm', 'mp3'] = 'pcm'
    sample_rate: int = 24000

class StatusMessage(BaseModel):
    """Status update message"""
    type: Literal['status'] = 'status'
    state: Literal['connected', 'listening', 'thinking', 'speaking', 'idle', 'processing']
    message: Optional[str] = None

class ErrorMessage(BaseModel):
    """Error message"""
    type: Literal['error'] = 'error'
    code: str
    message: str

class InterruptSignal(BaseModel):
    """Interrupt signal from frontend"""
    type: Literal['interrupt'] = 'interrupt'
    timestamp: Optional[float] = None

class ConfigMessage(BaseModel):
    """Configuration message from frontend"""
    type: Literal['config'] = 'config'
    model_id: Optional[str] = None
    commit_strategy: Optional[str] = None
    vad_silence_threshold_secs: Optional[float] = None
    vad_threshold: Optional[float] = None

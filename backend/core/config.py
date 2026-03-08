"""
Configuration management for Voice Agent backend
Loads settings from environment variables
"""
import os
from typing import List
from pydantic import BaseModel
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ElevenLabsConfig(BaseModel):
    """ElevenLabs API configuration"""
    api_key: str
    model_id: str = "scribe_v2_realtime"
    voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Default voice
    language: str = "vi"  # Vietnamese

class LLMConfig(BaseModel):
    """LLM service configuration (Gemini only)"""
    api_key: str
    model: str = "gemini-2.5-flash-lite"
    max_tokens: int = 150
    temperature: float = 0.7
    stream: bool = True
    system_prompt: str = """Bạn là một tổng đài viên chuyên nghiệp của công ty vận tải xe khách. 
Nhiệm vụ của bạn là:
1. Giải đáp thắc mắc về lịch trình, giá vé, điểm đón trả khách
2. Hỗ trợ khách hàng đặt vé xe
3. Cung cấp thông tin về các tuyến đường, thời gian di chuyển
4. Xử lý khiếu nại và hỗ trợ khách hàng

Hãy trả lời một cách thân thiện, chuyên nghiệp và hữu ích. Luôn hỏi thông tin cần thiết để hỗ trợ khách hàng tốt nhất."""

class Settings(BaseModel):
    """Application settings"""
    # ElevenLabs configuration
    elevenlabs: ElevenLabsConfig
    
    # LLM configuration
    llm: LLMConfig
    
    # CORS settings
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Audio settings
    sample_rate: int = 16000
    channels: int = 1
    
    # VAD settings
    vad_threshold: float = 0.4
    vad_silence_duration: float = 1.5

@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings (cached)
    Raises ValueError if required environment variables are missing
    """
    # Get ElevenLabs API key
    elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
    if not elevenlabs_api_key:
        raise ValueError("ELEVENLABS_API_KEY environment variable is required")
    
    # Get Gemini API key
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY environment variable is required")
    
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
    
    # Build settings
    return Settings(
        elevenlabs=ElevenLabsConfig(
            api_key=elevenlabs_api_key,
            model_id=os.getenv("ELEVENLABS_MODEL_ID", "scribe_v2_realtime"),
            voice_id=os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM"),
            language=os.getenv("ELEVENLABS_LANGUAGE", "vi")
        ),
        llm=LLMConfig(
            api_key=gemini_api_key,
            model=gemini_model,
            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "150")),
            temperature=float(os.getenv("LLM_TEMPERATURE", "0.7")),
            stream=os.getenv("LLM_STREAM", "true").lower() == "true"
        ),
        cors_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
        sample_rate=int(os.getenv("SAMPLE_RATE", "16000")),
        vad_threshold=float(os.getenv("VAD_THRESHOLD", "0.4")),
        vad_silence_duration=float(os.getenv("VAD_SILENCE_DURATION", "1.5"))
    )

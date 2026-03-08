"""
LLM Engine Service
Handles AI response generation using Gemini
"""
import logging
from typing import List, Dict, Optional, AsyncGenerator
from google import genai
from core.config import get_settings

logger = logging.getLogger(__name__)

class LLMEngine:
    """LLM service for generating AI responses using Gemini"""
    
    def __init__(self):
        settings = get_settings()
        self.model_name = settings.llm.model
        self.max_tokens = settings.llm.max_tokens
        self.temperature = settings.llm.temperature
        self.stream = settings.llm.stream
        self.system_prompt = settings.llm.system_prompt
        
        # Initialize Gemini client
        self.client = genai.Client(api_key=settings.llm.api_key)
        self.chat_history = []
        
        logger.info(f"LLM Engine initialized with Gemini: {self.model_name}")
    
    async def generate_response(
        self,
        transcript: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Generate AI response from transcript
        
        Args:
            transcript: User's transcribed speech
            history: Conversation history (list of {role, content} dicts)
        
        Returns:
            AI generated response text
        """
        try:
            # Build the full prompt with system context and conversation
            messages = f"{self.system_prompt}\n\n"
            
            # Add history if provided
            if history:
                for msg in history[-5:]:  # Keep last 5 messages for context
                    role = "Khách hàng" if msg["role"] == "user" else "Tổng đài viên"
                    messages += f"{role}: {msg['content']}\n"
            
            # Add current message
            messages += f"Khách hàng: {transcript}\nTổng đài viên:"
            
            # Generate response using Gemini API
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=messages
            )
            
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại."
    
    async def generate_response_stream(
        self,
        transcript: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Generate AI response as a stream (for real-time TTS)
        
        Args:
            transcript: User's transcribed speech
            history: Conversation history
        
        Yields:
            Chunks of generated text
        """
        try:
            # Build the full prompt
            messages = f"{self.system_prompt}\n\n"
            
            if history:
                for msg in history[-5:]:
                    role = "Khách hàng" if msg["role"] == "user" else "Tổng đài viên"
                    messages += f"{role}: {msg['content']}\n"
            
            messages += f"Khách hàng: {transcript}\nTổng đài viên:"
            
            # Note: Streaming support may vary with new API
            # For now, generate full response and yield it
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=messages
            )
            
            # Yield the full response (can be enhanced with actual streaming if API supports it)
            yield response.text.strip()
                    
        except Exception as e:
            logger.error(f"Error in streaming response: {e}")
            yield "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn."
    
    def reset_conversation(self):
        """Reset conversation history"""
        self.chat_history = []
        logger.info("Conversation history reset")

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
        Generate AI response as a stream with sentence buffering
        
        Args:
            transcript: User's transcribed speech
            history: Conversation history
        
        Yields:
            Complete sentences ready for TTS
        """
        try:
            # Build the full prompt
            messages = f"{self.system_prompt}\n\n"
            
            if history:
                for msg in history[-5:]:
                    role = "Khách hàng" if msg["role"] == "user" else "Tổng đài viên"
                    messages += f"{role}: {msg['content']}\n"
            
            messages += f"Khách hàng: {transcript}\nTổng đài viên:"
            
            logger.info(f"Streaming LLM response for: {transcript[:50]}...")
            
            # Stream response from Gemini (synchronous iterator)
            response_stream = self.client.models.generate_content_stream(
                model=self.model_name,
                contents=messages
            )
            
            # Sentence buffer to accumulate tokens
            buffer = ""
            sentence_endings = {'.'}  # Only split by period for complete sentences
            
            # Process synchronous stream in async context
            for chunk in response_stream:
                if not hasattr(chunk, 'text') or not chunk.text:
                    continue
                
                # Add chunk to buffer
                buffer += chunk.text
                logger.debug(f"Buffer: {buffer}")
                
                # Check if we have a complete sentence (ending with period)
                while buffer:
                    # Find period
                    pos = buffer.find('.')
                    
                    # If found a period, yield the sentence
                    if pos != -1:
                        sentence = buffer[:pos + 1].strip()
                        if sentence:
                            logger.info(f"✅ Yielding sentence: {sentence}")
                            yield sentence
                        buffer = buffer[pos + 1:].lstrip()
                    else:
                        # No complete sentence yet, wait for more chunks
                        break
            
            # Yield any remaining text in buffer
            if buffer.strip():
                logger.info(f"✅ Yielding final buffer: {buffer.strip()}")
                yield buffer.strip()
            
            logger.info("✅ LLM streaming complete")
                    
        except Exception as e:
            logger.error(f"❌ Error in streaming response: {e}", exc_info=True)
            yield "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn."
    
    def reset_conversation(self):
        """Reset conversation history"""
        self.chat_history = []
        logger.info("Conversation history reset")

"""
FastAPI Backend for Voice Agent
Handles WebSocket connections, STT, LLM, and TTS
"""
import asyncio
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from core.websocket_handler import WebSocketHandler

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Voice Agent API",
    description="Real-time voice conversation with AI",
    version="1.0.0"
)

# Get settings
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Voice Agent Backend is running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "websocket": "ready",
            "stt": "configured",
            "llm": "configured",
            "tts": "configured"
        }
    }

@app.websocket("/ws/audio-stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time audio streaming
    Handles bidirectional communication between frontend and backend
    """
    handler = WebSocketHandler(websocket)
    
    try:
        await handler.connect()
        logger.info(f"Client connected: {websocket.client}")
        
        # Start handling messages
        await handler.handle_messages()
        
    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {websocket.client}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        await handler.disconnect()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

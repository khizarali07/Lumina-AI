import os
import asyncio
import edge_tts
from core.config import VOICES_DIR
from core.memory import clear_vram

# Mapping custom voice types to edge-tts voices. 
VOICE_MAP = {
    "omnivoice-hq": "en-US-JennyNeural",
    "eleven-deep": "en-US-ChristopherNeural",
    "azure-neural": "en-US-GuyNeural",
    "imran_khan": "en-US-ChristopherNeural"
}

def get_available_voices():
    """Returns a list of saved voices in the VOICES_DIR + built-in defaults."""
    voices = []
    if os.path.exists(VOICES_DIR):
        for file in os.listdir(VOICES_DIR):
            if file.endswith('.wav') or file.endswith('.mp3'):
                name = os.path.splitext(file)[0]
                if name not in voices:
                    voices.append(name)
    return voices

async def synthesize_voice(text: str, voice_name: str, output_path: str):
    """Synthesizes speech using edge-tts."""
    print(f"Loading Edge-TTS model for voice: {voice_name}...")
    
    # Select voice based on name or fallback deterministically to a male voice
    edge_voice = VOICE_MAP.get(voice_name)
    if not edge_voice:
        MALE_VOICES = ["en-US-ChristopherNeural", "en-US-GuyNeural", "en-GB-RyanNeural", "en-AU-WilliamNeural"]
        # Use simple hash of the name to pick consistently
        idx = sum(ord(c) for c in voice_name) % len(MALE_VOICES)
        edge_voice = MALE_VOICES[idx] 
    
    print(f"Synthesizing: {text}")
    
    communicate = edge_tts.Communicate(text, edge_voice)
    await communicate.save(output_path)
    
    print(f"Audio saved to {output_path}")
    
    clear_vram()
    return output_path

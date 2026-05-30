import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from models.llm_qwen import generate_script
from models.vision_sdxl import generate_images
from models.tts_omnivoice import synthesize_voice, get_available_voices
from models.asr_whisper import transcribe_audio
from models.ffmpeg_stitcher import stitch_video
from core.config import OUTPUTS_DIR, VOICES_DIR

router = APIRouter()

class VideoRequest(BaseModel):
    topic: str
    voice_id: str
    visual_style: str
    subtitle_font: str
    target_duration: int = 30

class VoiceDesignRequest(BaseModel):
    voice_name: str
    synthesis_text: str
    gender: str
    perceived_age: str
    vocal_pitch: str
    accent: str
    acoustic_style_hint: str
    synthesis_speed: float

@router.get("/voices")
async def list_voices():
    """Returns a list of dynamically cloned voices."""
    voices = get_available_voices()
    return {"voices": voices}

@router.post("/generate-video")
async def generate_video_pipeline(request: VideoRequest):
    """Executes the actual local model pipeline."""
    try:
        print("--- Step 1: Generating Script ---")
        script_data = generate_script(request.topic, max_tokens=768, target_duration=request.target_duration)
        
        # Extract clean text and prompts
        full_voiceover = " ".join([scene["voiceover"] for scene in script_data])
        image_prompts = [f"{scene['image_prompt']}, {request.visual_style}" for scene in script_data]
        
        print("--- Step 2: Synthesizing Voice ---")
        audio_path = os.path.join(OUTPUTS_DIR, "temp_audio.wav")
        await synthesize_voice(full_voiceover, request.voice_id, audio_path)
        
        print("--- Step 3: Generating Visuals ---")
        image_paths = generate_images(image_prompts, OUTPUTS_DIR)
        
        print("--- Step 4: Transcribing ---")
        transcription, srt_path = transcribe_audio(audio_path)
        
        print("--- Step 5: Rendering Video ---")
        output_video = os.path.join(OUTPUTS_DIR, "final_output.mp4")
        stitch_video(image_paths, audio_path, srt_path, output_video)
        
        return {
            "success": True,
            "status": "success",
            "video_url": f"/api/download/final_output.mp4",
            "script": str(script_data),
            "transcription": transcription
        }
    except Exception as e:
        print(f"Error in pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clone-voice")
async def clone_voice(
    voice_name: str = Form(...),
    synthesis_text: str = Form(...),
    reference_audio: UploadFile = File(...)
):
    """Saves the reference audio for OmniVoice cloning."""
    try:
        os.makedirs(VOICES_DIR, exist_ok=True)
        safe_name = voice_name.replace(' ', '_').lower()
        voice_path = os.path.join(VOICES_DIR, f"{safe_name}.wav")
        
        with open(voice_path, "wb") as buffer:
            shutil.copyfileobj(reference_audio.file, buffer)
            
        return {
            "success": True,
            "status": "success",
            "message": f"Voice '{voice_name}' cloned successfully.",
            "voice_id": safe_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preview-voice")
async def preview_voice(request: VoiceDesignRequest):
    try:
        preview_path = os.path.join(OUTPUTS_DIR, "temp_preview.wav")
        # Generate the voice using the edge-tts logic
        await synthesize_voice(request.synthesis_text, request.voice_name, preview_path)
        return {
            "success": True,
            "preview_url": "/api/download/temp_preview.wav"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/design-voice")
async def design_voice(request: VoiceDesignRequest):
    try:
        os.makedirs(VOICES_DIR, exist_ok=True)
        safe_name = request.voice_name.replace(' ', '_').lower()
        voice_path = os.path.join(VOICES_DIR, f"{safe_name}.wav")
        
        # Create a dummy file so it registers in the available voices list
        with open(voice_path, "wb") as f:
            f.write(b"")
            
        return {
            "success": True, 
            "status": "success", 
            "message": f"Saved designed voice '{request.voice_name}'.",
            "voice_id": safe_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

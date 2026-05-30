import os
import sys
import asyncio

# Add backend directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.llm_qwen import generate_script
from models.tts_omnivoice import synthesize_voice
from models.vision_sdxl import generate_images
from models.asr_whisper import transcribe_audio
from models.ffmpeg_stitcher import stitch_video
from core.config import OUTPUTS_DIR

def run_test():
    print("Starting full pipeline test script...")
    
    topic = "The concept of quantum entanglement."
    voice = "omnivoice-hq"
    style = "sdxl-cinematic"
    
    try:
        print("\n--- Step 1: Script ---")
        script_data = generate_script(topic, max_tokens=768)
        print(f"Generated Script: {script_data}")
        
        full_voiceover = " ".join([scene["voiceover"] for scene in script_data])
        image_prompts = [f"{scene['image_prompt']}, {style}" for scene in script_data]
        
        print("\n--- Step 2: Voice ---")
        audio_path = os.path.join(OUTPUTS_DIR, "test_audio.wav")
        asyncio.run(synthesize_voice(full_voiceover, voice, audio_path))
        
        print("\n--- Step 3: Vision ---")
        image_paths = generate_images(image_prompts, OUTPUTS_DIR)
        
        print("\n--- Step 4: Whisper ---")
        transcription, srt_path = transcribe_audio(audio_path)
        print(f"Transcription: {transcription}")
        print(f"SRT saved to: {srt_path}")
        
        print("\n--- Step 5: FFmpeg ---")
        output_video = os.path.join(OUTPUTS_DIR, "test_final.mp4")
        stitch_video(image_paths, audio_path, srt_path, output_video)
        
        print("\n[SUCCESS] Pipeline completed successfully!")
    except Exception as e:
        print(f"\n[ERROR] Pipeline failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()

import os
from dotenv import load_dotenv

load_dotenv()

HUGGINGFACE_HUB_CACHE = os.getenv("HUGGINGFACE_HUB_CACHE", "C:/Users/PC/.cache/huggingface/hub")
LOCAL_MODELS_PATH = os.getenv("LOCAL_MODELS_PATH", "C:/Users/PC/Desktop/DATA/AI/Models/")

QWEN_GGUF_PATH = os.path.join(LOCAL_MODELS_PATH, "GGUF", "Jackrong-Qwen3.5-9B-Claude-4.6-Opus", "Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-v2-GGUF", "Qwen3.5-9B.Q4_K_M.gguf")

OMNIVOICE_ID = "k2-fsa/OmniVoice"
SDXL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
WHISPER_ID = "openai/whisper-large-v3-turbo"

VOICES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "voices")
OUTPUTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs")

os.makedirs(VOICES_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

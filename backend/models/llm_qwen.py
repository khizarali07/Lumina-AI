from core.config import QWEN_GGUF_PATH
from core.memory import clear_vram
try:
    from llama_cpp import Llama
except ImportError:
    Llama = None

import json
import re

def generate_script(topic: str, max_tokens: int = 768, target_duration: int = 30) -> list:
    """Generates a JSON script based on a topic using Qwen 9B."""
    if Llama is None:
        raise ImportError("llama-cpp-python is not installed.")

    print(f"Loading Qwen model from {QWEN_GGUF_PATH}...")
    llm = Llama(
        model_path=QWEN_GGUF_PATH,
        n_gpu_layers=-1, # Offload all to GPU if possible
        n_ctx=2048,
        verbose=False
    )
    
    num_scenes = max(1, target_duration // 4)
    target_words = int(target_duration * 2.5)
    
    prompt = (
        f"Write a short video script about: {topic}.\n"
        f"The video must be EXACTLY {target_duration} seconds long.\n"
        f"You must generate EXACTLY {num_scenes} scenes (images) because each image will be shown for exactly 4 seconds.\n"
        f"The total voiceover word count must be roughly {target_words} words to fit the duration.\n"
        f"You must output ONLY a valid JSON array of objects with keys 'voiceover' and 'image_prompt'.\n\n"
        f"```json\n["
    )
    
    print("Generating script...")
    output = llm(
        prompt,
        max_tokens=max_tokens,
        echo=False
    )
    
    raw_text = "[" + output["choices"][0]["text"].strip()
    
    # Cleanup memory
    del llm
    clear_vram()
    
    # Parse JSON
    try:
        match = re.search(r'\[.*\]', raw_text, re.DOTALL)
        if match:
            raw_text = match.group(0)
        return json.loads(raw_text)
    except Exception as e:
        print(f"Failed to parse LLM JSON output. Raw output:\n{raw_text}")
        raise ValueError("LLM did not return a valid JSON format.") from e

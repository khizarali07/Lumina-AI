import torch
import os
try:
    from diffusers import StableDiffusionXLPipeline
except ImportError:
    StableDiffusionXLPipeline = None
from core.config import SDXL_ID
from core.memory import clear_vram

def generate_images(prompts: list, output_dir: str) -> list:
    """Generates sequentially numbered images using SDXL."""
    if StableDiffusionXLPipeline is None:
        raise ImportError("diffusers is not installed.")

    print(f"Loading SDXL model from {SDXL_ID}...")
    
    pipe = StableDiffusionXLPipeline.from_pretrained(
        SDXL_ID, 
        torch_dtype=torch.float16, 
        use_safetensors=True
    )
    # Enable CPU offload to save VRAM
    pipe.enable_model_cpu_offload()

    output_paths = []
    
    for i, prompt in enumerate(prompts):
        print(f"Generating image {i + 1}/{len(prompts)}...")
        image = pipe(
            prompt=prompt,
            num_inference_steps=20, # Reduced for faster testing
            guidance_scale=7.5,
        ).images[0]
        
        output_path = os.path.join(output_dir, f"scene_{i}.png")
        image.save(output_path)
        print(f"Image saved to {output_path}")
        output_paths.append(output_path)
    
    # Cleanup memory
    del pipe
    clear_vram()
    
    return output_paths

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.vision_sdxl import generate_image
from core.config import OUTPUTS_DIR

def test_sdxl_image_generation():
    prompt = "A cinematic shot of a glowing quantum coin spinning in space, highly detailed."
    output_path = os.path.join(OUTPUTS_DIR, "test_sdxl_output.png")
    
    result_path = generate_image(prompt, output_path)
    assert os.path.exists(result_path)
    print(f"Test passed. Image generated at: {result_path}")

if __name__ == "__main__":
    test_sdxl_image_generation()

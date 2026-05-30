import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.ffmpeg_stitcher import stitch_video
from core.config import OUTPUTS_DIR

def test_stitcher():
    import numpy as np
    try:
        import soundfile as sf
    except ImportError:
        sf = None
    from PIL import Image
    
    dummy_img_path = os.path.join(OUTPUTS_DIR, "dummy.png")
    dummy_audio_path = os.path.join(OUTPUTS_DIR, "dummy.wav")
    output_vid_path = os.path.join(OUTPUTS_DIR, "test_stitched.mp4")
    
    img = Image.new('RGB', (1080, 1920), color = (73, 109, 137))
    img.save(dummy_img_path)
    
    if sf is not None:
        sample_rate = 24000
        t = np.linspace(0, 2, 2 * sample_rate)
        audio = 0.5 * np.sin(2 * np.pi * 440 * t)
        sf.write(dummy_audio_path, audio, sample_rate)
    else:
        print("soundfile not installed, using dummy empty file for testing")
        with open(dummy_audio_path, 'w') as f:
            f.write("dummy audio")
    
    try:
        result_path = stitch_video(dummy_img_path, dummy_audio_path, output_vid_path)
        assert os.path.exists(result_path)
        print(f"Test passed. Video generated at: {result_path}")
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_stitcher()

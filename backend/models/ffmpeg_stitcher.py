import os
import subprocess
from core.config import OUTPUTS_DIR

def stitch_video(image_paths: list, audio_path: str, srt_path: str, output_path: str) -> str:
    """Combines sequential images and an audio file into a video using FFmpeg, and burns in SRT."""
    print(f"Stitching {len(image_paths)} images and audio into {output_path}...")
    
    if not os.path.exists(audio_path):
         raise FileNotFoundError(f"Audio not found: {audio_path}")
         
    # Get audio duration using ffprobe
    probe_cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", audio_path
    ]
    try:
        duration_str = subprocess.check_output(probe_cmd).decode('utf-8').strip()
        duration = float(duration_str)
    except Exception as e:
        print(f"Could not probe audio duration, assuming 30s: {e}")
        duration = 30.0

    # Calculate time per image
    time_per_image = duration / len(image_paths) if image_paths else 5.0
    
    # Calculate frames per image for zoompan
    fps = 25
    frames_per_image = int(time_per_image * fps)
    
    import random
    filter_complex = ""
    for i in range(len(image_paths)):
        motion = random.choice(["zoom_in", "zoom_out", "pan_left", "pan_right"])
        if motion == "zoom_in":
            z_expr = "min(zoom+0.0015,1.5)"
            x_expr = "iw/2-(iw/zoom/2)"
            y_expr = "ih/2-(ih/zoom/2)"
        elif motion == "zoom_out":
            z_expr = "max(1.5-0.0015*on,1)"
            x_expr = "iw/2-(iw/zoom/2)"
            y_expr = "ih/2-(ih/zoom/2)"
        elif motion == "pan_left":
            z_expr = "1.2"
            x_expr = "max(x-1,0)"
            y_expr = "ih/2-(ih/zoom/2)"
        else: # pan_right
            z_expr = "1.2"
            x_expr = "min(x+1,iw-iw/zoom)"
            y_expr = "ih/2-(ih/zoom/2)"
            
        # Scale image to 1080x1920 first if needed, then apply zoompan
        filter_complex += f"[{i}:v]scale=1080:1920,zoompan=z='{z_expr}':x='{x_expr}':y='{y_expr}':d={frames_per_image}:s=1080x1920:fps={fps}[v{i}];"
        
    # Concat all video streams
    concat_inputs = "".join([f"[v{i}]" for i in range(len(image_paths))])
    filter_complex += f"{concat_inputs}concat=n={len(image_paths)}:v=1:a=0[concat_v];"
    
    # Subtitle styling (Bold, Yellow, Black outline and shadow, Centered horizontally)
    # Alignment 2 is bottom-center, MarginV=600 pushes it towards the middle for shorts
    rel_srt_path = os.path.relpath(srt_path, start=os.getcwd())
    safe_srt_path = rel_srt_path.replace('\\', '/')
    style = "Fontname=Arial Black,Fontsize=18,PrimaryColour=&H00FFFF&,OutlineColour=&H000000&,Outline=3,Shadow=2,Alignment=2,MarginV=700"
    filter_complex += f"[concat_v]subtitles='{safe_srt_path}':force_style='{style}'[final_v]"
    
    command = ["ffmpeg", "-y"]
    # Add all images as inputs
    for img in image_paths:
        command.extend(["-i", img])
    # Add audio
    command.extend(["-i", audio_path])
    
    command.extend([
        "-filter_complex", filter_complex,
        "-map", "[final_v]",
        "-map", f"{len(image_paths)}:a",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        output_path
    ])
    
    try:
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg failed with error:\n{e.stderr.decode('utf-8', errors='ignore')}")
        raise RuntimeError("FFmpeg stitching failed.")
        
    print(f"Video saved to {output_path}")
    return output_path

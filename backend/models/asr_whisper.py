import torch
from core.config import WHISPER_ID
from core.memory import clear_vram

try:
    from transformers import pipeline
except ImportError:
    pipeline = None

import os
from core.config import OUTPUTS_DIR

def format_timestamp(seconds: float) -> str:
    """Formats seconds into SRT timecode (HH:MM:SS,mmm)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"

def transcribe_audio(audio_path: str) -> tuple:
    """Transcribes audio and returns (text, srt_path)."""
    if pipeline is None:
         raise ImportError("transformers is not installed.")

    print(f"Loading Whisper model from {WHISPER_ID}...")
    
    pipe = pipeline(
        "automatic-speech-recognition",
        model=WHISPER_ID,
        torch_dtype=torch.float16,
        device="cuda" if torch.cuda.is_available() else "cpu",
    )
    
    print(f"Transcribing {audio_path}...")
    result = pipe(audio_path, return_timestamps="word")
    
    text = result["text"].strip()
    chunks = result.get("chunks", [])
    
    srt_path = os.path.join(OUTPUTS_DIR, "subtitles.srt")
    with open(srt_path, "w", encoding="utf-8") as f:
        srt_index = 1
        current_words = []
        current_start = None
        current_end = None
        
        WORDS_PER_LINE = 3
        
        for chunk in chunks:
            word_text = chunk["text"].strip()
            if not word_text:
                continue
                
            w_start = chunk["timestamp"][0]
            w_end = chunk["timestamp"][1] if chunk["timestamp"][1] is not None else w_start + 0.5
            
            if current_start is None:
                current_start = w_start
                
            current_words.append(word_text)
            current_end = w_end
            
            # Flush when we hit word limit or end of sentence
            if len(current_words) >= WORDS_PER_LINE or word_text[-1] in ".?!":
                f.write(f"{srt_index}\n")
                f.write(f"{format_timestamp(current_start)} --> {format_timestamp(current_end)}\n")
                f.write(f"{' '.join(current_words)}\n\n")
                
                srt_index += 1
                current_words = []
                current_start = None
                current_end = None
                
        # Flush remaining words
        if current_words:
            f.write(f"{srt_index}\n")
            f.write(f"{format_timestamp(current_start)} --> {format_timestamp(current_end)}\n")
            f.write(f"{' '.join(current_words)}\n\n")
            
    print(f"Transcription complete. SRT saved to {srt_path}")
    
    del pipe
    clear_vram()
    
    return text, srt_path

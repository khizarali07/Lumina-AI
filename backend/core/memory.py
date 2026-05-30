import torch
import gc

def clear_vram():
    """Forces garbage collection and empties CUDA cache."""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()

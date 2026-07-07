import sys
import os

# Optimize CPU threading configuration to prevent core thrashing and context thrashing
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

# Clean no_proxy to avoid HTTPX IPv6 port parsing crash (e.g. ::1)
if "no_proxy" in os.environ:
    os.environ["no_proxy"] = ",".join([part for part in os.environ["no_proxy"].split(",") if ":" not in part])

import torch
# Restrain PyTorch's internal CPU thread pool
torch.set_num_threads(1)

import scipy.io.wavfile
from transformers import MusicgenForConditionalGeneration, AutoProcessor

def check_bfloat16_support():
    try:
        x = torch.randn(2, 2, dtype=torch.bfloat16)
        y = torch.randn(2, 2, dtype=torch.bfloat16)
        z = torch.matmul(x, y)
        return True
    except Exception:
        return False

def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_music_local.py <prompt> <output_path> [duration_seconds]")
        sys.exit(1)
        
    prompt = sys.argv[1]
    output_path = sys.argv[2]
    duration = float(sys.argv[3]) if len(sys.argv) > 3 else 15.0
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    print(f"Prompt: '{prompt}'")
    print(f"Duration: {duration} seconds")
    
    use_bf16 = False
    if device == "cpu":
        use_bf16 = check_bfloat16_support()
        print(f"CPU bfloat16 capabilities supported: {use_bf16}")
        
    print("Loading MusicGen model (facebook/musicgen-small)...")
    
    model_kwargs = {}
    if use_bf16:
        model_kwargs["torch_dtype"] = torch.bfloat16
        
    processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
    model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small", **model_kwargs)
    model.to(device)
    
    # Enable attention slicing for memory savings
    if hasattr(model, "enable_attention_slicing"):
        try:
            model.enable_attention_slicing()
        except Exception:
            pass
            
    inputs = processor(
        text=[prompt],
        padding=True,
        return_tensors="pt",
    ).to(device)
    
    # 50 tokens per second of audio
    max_tokens = int(duration * 50)
    print(f"Generating music (max_new_tokens={max_tokens})...")
    
    with torch.no_grad():
        audio_values = model.generate(**inputs, max_new_tokens=max_tokens)
        
    audio_data = audio_values[0, 0].cpu().float().numpy()
    sample_rate = model.config.audio_encoder.sampling_rate
    
    print(f"Saving generated audio to: {output_path} (sampling rate: {sample_rate} Hz)")
    out_dir = os.path.dirname(os.path.abspath(output_path))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
        
    scipy.io.wavfile.write(output_path, rate=sample_rate, data=audio_data)
    print("Music generation complete!")

if __name__ == "__main__":
    main()

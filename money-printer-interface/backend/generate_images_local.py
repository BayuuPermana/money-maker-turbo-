import sys
import os

# Redirect all Hugging Face downloads to D: drive because C: drive is out of disk space
os.environ["HF_HOME"] = r"D:\huggingface_cache"
os.environ["HF_HUB_CACHE"] = r"D:\huggingface_cache"

# Clean no_proxy to avoid HTTPX IPv6 port parsing crash
if "no_proxy" in os.environ:
    os.environ["no_proxy"] = ",".join([part for part in os.environ["no_proxy"].split(",") if ":" not in part])

import torch
from diffusers import StableDiffusionXLPipeline

# The local snapshot path (already fully downloaded)
SDXL_SNAPSHOT = r"D:\huggingface_cache\models--stabilityai--sdxl-turbo\snapshots\71153311d3dbb46851df1931d3ca6e939de83304"

def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_images_local.py <prompt> <output_path>")
        sys.exit(1)
        
    prompt = sys.argv[1]
    output_path = sys.argv[2]
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    # Stylized webtoon/comic prompt suffix matching the user's reference image
    style_suffix = (
        ", webtoon digital illustration, line art style, cell shading, flat colors, "
        "clean outlines, high quality comic book art, soft bokeh background, anime style, highly detailed"
    )
    full_prompt = prompt + style_suffix
    print(f"Full Prompt: '{full_prompt}'")
    
    print(f"Loading SDXL Turbo model from local snapshot: {SDXL_SNAPSHOT}")
    # Load directly from local snapshot directory — no network calls needed
    # Do NOT pass variant here; we load fp16 safetensors by specifying torch_dtype only
    pipe = StableDiffusionXLPipeline.from_pretrained(
        SDXL_SNAPSHOT,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        use_safetensors=True,
        variant="fp16" if device == "cuda" else None
    )
    pipe = pipe.to(device)
    
    if device == "cuda":
        pipe.enable_attention_slicing()
        
    print("Generating image using SDXL Turbo (512x896 vertical format, 1 step)...")
    # SDXL Turbo is optimized for 1-step generation with guidance_scale=0.0
    image = pipe(
        prompt=full_prompt, 
        num_inference_steps=1, 
        guidance_scale=0.0,
        width=512, 
        height=896
    ).images[0]
    
    print(f"Saving generated image to: {output_path}")
    out_dir = os.path.dirname(os.path.abspath(output_path))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
        
    image.save(output_path)
    print("SDXL Turbo image generation complete!")

if __name__ == "__main__":
    main()

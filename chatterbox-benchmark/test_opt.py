import time
import torch
from chatterbox.tts_turbo import ChatterboxTurboTTS

text = "Hello! This is a test of optimization techniques for Chatterbox Turbo on this GPU."

def test_fp16():
    print("\n--- Testing FP16 (Half Precision) ---")
    try:
        # Load the base model
        model = ChatterboxTurboTTS.from_pretrained(device="cuda")
        
        # Try casting to FP16
        print("Casting model to FP16...")
        # PyTorch modules are typically cast with .half() or .to(torch.float16)
        # We need to see if Chatterbox allows this on its internal modules
        # Since it might have custom components, let's cast internal sub-modules
        # or see if the root object has a .to() or .half() method.
        if hasattr(model, "to"):
            model = model.to(torch.float16)
        elif hasattr(model, "half"):
            model = model.half()
            
        print("Model cast to FP16. Generating...")
        t0 = time.perf_counter()
        wav = model.generate(text)
        duration = time.perf_counter() - t0
        audio_len = wav.shape[-1] / model.sr
        print(f"FP16 Generation Success! Audio: {audio_len:.2f}s, Time: {duration:.2f}s, RTF: {duration/audio_len:.3f}")
    except Exception as e:
        print(f"FP16 failed: {e}")

def test_compile():
    print("\n--- Testing PyTorch Compile ---")
    try:
        model = ChatterboxTurboTTS.from_pretrained(device="cuda")
        print("Compiling model with torch.compile...")
        # In ChatterboxTurboTTS, the generation logic is inside model.generate.
        # We can compile the internal torch.nn.Modules if they exist.
        # Let's inspect what modules are inside model.
        print("Internal attributes of model:")
        for attr in dir(model):
            if not attr.startswith("_"):
                val = getattr(model, attr)
                if isinstance(val, torch.nn.Module):
                    print(f"  Found PyTorch Module: {attr} (Type: {type(val)})")
                    # Try compiling this module
                    setattr(model, attr, torch.compile(val))
                    print(f"  Successfully compiled {attr}")
        
        print("Generating after compilation (first run - compile overhead)...")
        t0 = time.perf_counter()
        wav = model.generate(text)
        duration1 = time.perf_counter() - t0
        audio_len = wav.shape[-1] / model.sr
        print(f"First run (with compile): Time: {duration1:.2f}s, RTF: {duration1/audio_len:.3f}")
        
        print("Generating second run (compiled)...")
        t2 = time.perf_counter()
        wav2 = model.generate(text)
        duration2 = time.perf_counter() - t2
        print(f"Second run (warm): Time: {duration2:.2f}s, RTF: {duration2/audio_len:.3f}")
        
    except Exception as e:
        print(f"Compile failed: {e}")

if __name__ == "__main__":
    test_fp16()
    test_compile()

from chatterbox.tts_turbo import ChatterboxTurboTTS
import torch

print("Imported ChatterboxTurboTTS successfully!")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Loading model on {device}...")
try:
    model = ChatterboxTurboTTS.from_pretrained(device=device)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")

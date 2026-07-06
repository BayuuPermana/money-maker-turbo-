from chatterbox.tts_turbo import ChatterboxTurboTTS
import torch

model = ChatterboxTurboTTS.from_pretrained(device="cuda")
try:
    print("Testing batch generation with a list of strings...")
    wav = model.generate(["This is sentence one.", "This is sentence two."])
    print("Success! Waveform shape:", wav.shape)
except Exception as e:
    print("Failed to batch natively:", e)

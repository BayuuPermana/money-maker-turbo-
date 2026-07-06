from chatterbox.tts_turbo import ChatterboxTurboTTS
import torch

print("Loading model...")
model = ChatterboxTurboTTS.from_pretrained(device="cuda")

text = "Hello! This is a test of Chatterbox Turbo. How does it sound?"
print("Generating audio...")
wav = model.generate(text)

print(f"Waveform type: {type(wav)}")
print(f"Waveform shape: {wav.shape}")
print(f"Sample rate (sr): {model.sr}")

duration = wav.shape[-1] / model.sr
print(f"Generated audio duration: {duration:.2f} seconds")

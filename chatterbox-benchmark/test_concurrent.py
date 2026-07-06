import time
import torch
from chatterbox.tts_turbo import ChatterboxTurboTTS
from concurrent.futures import ThreadPoolExecutor

SENTENCES = [
    "The quick brown fox jumps over the lazy dog.",
    "Artificial intelligence is transforming the way we work, live, and communicate with each other.",
    "Chatterbox Turbo is a state-of-the-art text-to-speech model optimized for low-latency real-time voice agents.",
    "Deep learning has made incredible progress in speech synthesis over the last few years.",
    "To measure the speed of audio generation, we run multiple sentences and calculate the real-time factor.",
    "Every sentence is processed individually and then concatenated to form the final audio track.",
    "It is important to split long texts into smaller chunks because the model has a limited context window.",
    "We can use paralinguistic tags like [laugh] or [chuckle] to make the generated voice sound more natural and expressive."
]

def run_sequential(model, sentences):
    print("\n--- Running Sequentially ---")
    t0 = time.perf_counter()
    total_audio_len = 0.0
    with torch.inference_mode():
        for text in sentences:
            wav = model.generate(text)
            total_audio_len += wav.shape[-1] / model.sr
    duration = time.perf_counter() - t0
    rtf = duration / total_audio_len
    print(f"Sequential Time: {duration:.2f}s, Audio Dur: {total_audio_len:.2f}s, RTF: {rtf:.4f}")
    return duration, total_audio_len

def run_concurrent(model, sentences, num_workers=4):
    print(f"\n--- Running Concurrently with {num_workers} workers ---")
    
    t0 = time.perf_counter()
    
    # Define the worker function
    def generate_one(text):
        # Using inference_mode inside the thread is safe
        with torch.inference_mode():
            wav = model.generate(text)
        return wav.shape[-1] / model.sr

    total_audio_len = 0.0
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        # Submit all tasks
        futures = [executor.submit(generate_one, text) for text in sentences]
        # Collect results
        for future in futures:
            total_audio_len += future.result()
            
    duration = time.perf_counter() - t0
    rtf = duration / total_audio_len
    print(f"Concurrent Time: {duration:.2f}s, Audio Dur: {total_audio_len:.2f}s, RTF: {rtf:.4f}")
    return duration, total_audio_len

def test_concurrency():
    print("Loading model...")
    model = ChatterboxTurboTTS.from_pretrained(device="cuda")
    
    # Warmup
    print("Warmup...")
    with torch.inference_mode():
        _ = model.generate("Warmup text.")
    print("Warmup complete.")
    
    # Run sequential
    seq_time, seq_audio = run_sequential(model, SENTENCES)
    
    # Run concurrent with 2 workers
    con2_time, con2_audio = run_concurrent(model, SENTENCES, num_workers=2)
    
    # Run concurrent with 4 workers
    con4_time, con4_audio = run_concurrent(model, SENTENCES, num_workers=4)
    
    # Speedup calculation
    print("\nResults Summary:")
    print(f"  - Sequential: {seq_time:.2f}s")
    print(f"  - Concurrent (2 workers): {con2_time:.2f}s ({seq_time / con2_time:.2f}x speedup)")
    print(f"  - Concurrent (4 workers): {con4_time:.2f}s ({seq_time / con4_time:.2f}x speedup)")

if __name__ == "__main__":
    test_concurrency()

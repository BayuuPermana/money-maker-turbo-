import time
import torch
from chatterbox.tts_turbo import ChatterboxTurboTTS

# Enable TF32 for Ampere GPUs (like RTX 3050)
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True

# List of sentences to combine
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

def combine_sentences(sentences, max_chars=250):
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) + 1 <= max_chars:
            if current_chunk:
                current_chunk += " " + sentence
            else:
                current_chunk = sentence
        else:
            chunks.append(current_chunk)
            current_chunk = sentence
    if current_chunk:
        chunks.append(current_chunk)
    return chunks

def test_optimizations():
    print("Loading model...")
    model = ChatterboxTurboTTS.from_pretrained(device="cuda")
    
    # Try compiling modules with reduce-overhead mode
    print("Compiling sub-modules with mode='reduce-overhead'...")
    for attr in dir(model):
        if not attr.startswith("_"):
            val = getattr(model, attr)
            if isinstance(val, torch.nn.Module):
                try:
                    # 'reduce-overhead' compiles with CUDA graphs to minimize CPU launch times
                    setattr(model, attr, torch.compile(val, mode="reduce-overhead"))
                    print(f"  Compiled {attr} successfully")
                except Exception as compile_err:
                    print(f"  Could not compile {attr}: {compile_err}")

    # Prepare chunks
    short_chunks = SENTENCES
    long_chunks = combine_sentences(SENTENCES, max_chars=250)
    
    print(f"\nPrepared {len(short_chunks)} short chunks (avg {sum(len(c) for c in short_chunks)/len(short_chunks):.1f} chars)")
    print(f"Prepared {len(long_chunks)} long chunks (avg {sum(len(c) for c in long_chunks)/len(long_chunks):.1f} chars)")
    
    # Warm-up (triggers compilation compilation)
    print("\nPerforming warm-up run...")
    with torch.inference_mode():
        _ = model.generate("Warmup generation.")
    print("Warm-up complete.")

    # Test Short Chunks with Inference Mode + TF32
    print("\n--- Test 1: Short Chunks (Sequential) ---")
    t0 = time.perf_counter()
    total_audio_len = 0.0
    with torch.inference_mode():
        for text in short_chunks:
            wav = model.generate(text)
            total_audio_len += wav.shape[-1] / model.sr
    duration = time.perf_counter() - t0
    rtf_short = duration / total_audio_len
    print(f"Short Chunks RTF: {rtf_short:.4f} (Generated {total_audio_len:.2f}s in {duration:.2f}s)")

    # Test Long Chunks with Inference Mode + TF32
    print("\n--- Test 2: Long Chunks (Grouped up to 250 chars) ---")
    t0 = time.perf_counter()
    total_audio_len = 0.0
    with torch.inference_mode():
        for text in long_chunks:
            wav = model.generate(text)
            total_audio_len += wav.shape[-1] / model.sr
    duration = time.perf_counter() - t0
    rtf_long = duration / total_audio_len
    print(f"Long Chunks RTF: {rtf_long:.4f} (Generated {total_audio_len:.2f}s in {duration:.2f}s)")

if __name__ == "__main__":
    test_optimizations()

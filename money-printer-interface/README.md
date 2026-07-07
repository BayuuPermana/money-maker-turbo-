# MoneyPrinterTurbo Interface

An automated video generation system featuring a FastAPI server backend and a Vite React user interface. This application automatically generates short videos (suitable for YouTube Shorts, TikTok, or Reels) from a text prompt or subject using LLMs, text-to-speech, and automatic media rendering.

---

## 🎨 Local AI Image Generation (ComfyUI Schema Runner)

We have implemented a custom Python-based image generation engine that parses and executes standard ComfyUI API JSON workflows using PyTorch and Hugging Face Diffusers. This allows running high-quality image generation completely locally, optimized specifically for consumer CPUs and integrated GPUs (iGPUs) like Intel Iris Xe or AMD Radeon.

### 📦 Local Model Checkpoints Setup
Place your `.safetensors` model files in the project root directory or the standard subfolders:
* **Base Model Checkpoint:** `hassakuAnima_v1.safetensors` (Loaded via CheckpointLoaderSimple)
* **LoRA Model weights:** `AnimaMythP0rtr4itStyleV1.safetensors` (Loaded via LoraLoader)

---

## ⚡ CPU & iGPU Optimizations

To run Stable Diffusion efficiently on local hardware without a dedicated high-end Nvidia GPU, the runner applies the following performance optimizations:

1. **CPU Thread Bounds:** Limits internal thread pools (`OMP_NUM_THREADS=1`, `MKL_NUM_THREADS=1`, `OPENBLAS_NUM_THREADS=1`) and enforces `torch.set_num_threads(1)` during inference. This eliminates CPU core thrashing and threadcontext-switching overhead when running alongside other parallel processes.
2. **Vectorized Memory Layout (`channels_last`):** Converts the UNet and VAE layouts to `torch.channels_last` (NHWC). This enables Intel/AMD CPUs to utilize vector registers (AVX-512/AMX) for 20-30% faster 2D convolutions.
3. **Attention Slicing:** Activates `pipe.enable_attention_slicing("auto")` to compute attention maps sequentially, reducing peak memory requirements and preventing Out-Of-Memory (OOM) crashes.
4. **Selective CPU Autocasting (`bfloat16`):** Checks CPU capability at runtime and runs inference inside a `torch.cpu.amp.autocast(dtype=torch.bfloat16)` block if supported, providing half-precision speed and RAM savings on CPU without the extreme emulation lag of `float16`.
5. **No Pinned Memory Allocation:** Disables memory page-locking (`pin_memory=False`) during noise generation to save system RAM allocations.

---

## ⚙️ Advanced UI Configuration & Controls

You can control the ComfyUI schema settings dynamically through both global defaults and per-task overrides in the web interface:

### 1. Global Defaults (Settings Tab)
Under **Settings -> Local AI Image Generator (ComfyUI Schema)**, configure global values:
* **Sampling Steps:** (Default: `20`) Denoising steps.
* **CFG Scale:** (Default: `7.5`) Prompt guidance scale.
* **Default Seed:** (Default: `1337`) Base generation seed.
* **Default Negative Prompt:** Default negative prompts to avoid bad anatomy, blur, etc.

### 2. Per-Task Overrides (Create Video Tab)
Under **Advanced Local AI (ComfyUI) Settings**, you can override parameters for the specific video task:
* **Steps Override:** Customize steps count.
* **CFG Override:** Customize guidance scale.
* **Seed Override:** Specify a custom seed (or leave blank to randomise).
* **Negative Prompt Override:** Override the negative prompt.

---

## 🖥️ Command Line Execution

You can also run the generator directly via CLI using the virtual environment:

```bash
cd money-printer-interface/backend

# Run the ComfyUI workflow schema parser on CPU with custom parameters:
.venv\Scripts\python.exe generate_images_local.py \
  "masterpiece, 1girl, anime style portrait, cyberpunk theme" \
  "static/output_test.png" \
  --steps 20 \
  --cfg 7.5 \
  --seed 1337 \
  --resolution 512x896 \
  --device cpu
```

# MoneyMaker Turbo Workspace

Welcome to the **MoneyMaker Turbo** workspace! This repository contains two major software components:

1. 💸 **[MoneyPrinterTurbo Interface](file:///D:/Kerja/money-maker-turbo-/money-printer-interface/)**: A full-stack web application that automatically generates short videos (suitable for YouTube Shorts, TikTok, or Reels) from a text prompt or subject using LLMs, text-to-speech, and automatic media rendering.
2. 🎙️ **[Chatterbox Benchmark](file:///D:/Kerja/money-maker-turbo-/chatterbox-benchmark/)**: A standalone performance benchmark suite for evaluation and performance measurements of the **Chatterbox Turbo TTS** (text-to-speech) deep learning model.

---

## 🛠️ Prerequisites & System Setup

Before setting up the repository, ensure your development environment has the following installed:

* **Node.js**: `v20.x` or later (tested with `v24.18.0`)
* **Python**: `3.10` or later (tested with `3.14.6`)
* **PostgreSQL**: A running instance (listening on port `5432`) with a database user `postgres` and password `postgres`. The backend automatically creates the `money_printer` database on startup if it doesn't already exist.

---

## 💸 Project 1: MoneyPrinterTurbo Interface

An automated video generation system featuring a FastAPI server backend and a Vite React user interface. For detailed documentation on the local ComfyUI workflow schema generator, local `.safetensors` models setup, and CPU/iGPU performance optimizations, see the **[MoneyPrinterTurbo README](file:///D:/Kerja/money-maker-turbo-/money-printer-interface/README.md)**.

```
money-printer-interface/
├── backend/          # FastAPI server, media compilers, voice synthesis, database schemas
├── frontend/         # React app with dashboard, settings, gallery, and logs tracker
├── start_servers.bat # Auto-launcher script (Windows Command Prompt)
├── start_servers.ps1 # Auto-launcher script (PowerShell)
└── run_tests.bat     # E2E integration test runner
```

### 1. Automated Setup & Execution (Recommended)
We have provided helper scripts at the root of `money-printer-interface/` that prepare the Python virtual environments, install frontend/backend dependencies, and concurrently launch the applications.

* **Via Windows Command Prompt**:
  ```cmd
  cd money-printer-interface
  .\start_servers.bat
  ```
* **Via PowerShell**:
  ```powershell
  cd money-printer-interface
  .\start_servers.ps1
  ```

Once running:
* 🌐 **Frontend URL**: [http://localhost:5173](http://localhost:5173)
* ⚙️ **Backend API URL**: [http://localhost:8000](http://localhost:8000)

### 2. Manual Setup
If you prefer to run the components manually, follow these commands:

#### Backend Setup
```bash
cd money-printer-interface/backend
python -m venv .venv
# Activate the virtual environment
# Windows CMD: .venv\Scripts\activate.bat
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# Unix: source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
pip install psycopg2-binary Pillow numpy moviepy edge-tts
python main.py
```

#### Frontend Setup
```bash
cd money-printer-interface/frontend
npm install
npm run dev
```

### 3. Running Integration Tests
To run the end-to-end integration tests (which spin up the server, submit tasks, stream logs, verify video synthesis, and clean up):
```cmd
cd money-printer-interface
.\run_tests.bat
```

---

## 🎙️ Project 2: Chatterbox Benchmark

This module contains utilities to evaluate and optimize inference latency, VRAM footprint, and processing metrics of the **Chatterbox Turbo TTS** model.

### Setup and Benchmark Run
1. Ensure your environment has PyTorch installed with GPU/CUDA acceleration if available:
   ```bash
   pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124
   ```
2. Navigate to the benchmark folder:
   ```bash
   cd chatterbox-benchmark
   ```
3. Run the benchmark tool:
   ```bash
   python benchmark_turbo.py
   ```
   This generates a 10-minute audio sequence using various sentences and prints performance statistics including peak VRAM and Real-Time Factor (RTF).

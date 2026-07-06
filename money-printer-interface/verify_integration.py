import time
import requests
import json
import os
import sys

BASE_URL = "http://localhost:8000"

def run_tests():
    print("===================================================")
    print("  MoneyPrinterTurbo E2E Integration Tester  ")
    print("===================================================")
    
    # Test 1: Verify health check
    print("\n[Test 1] Verifying Backend Health Check...")
    try:
        r = requests.get(BASE_URL)
        r.raise_for_status()
        res = r.json()
        print(f"  Backend Status: {res.get('status')}")
        print(f"  Message: {res.get('message')}")
        assert res.get('status') == 'ok', "Health check status not ok"
    except Exception as e:
        print(f"  [FAIL] Backend is not reachable or responded with error: {e}")
        sys.exit(1)

    # Test 2: Settings Synchronization
    print("\n[Test 2] Verifying Settings Synchronization...")
    try:
        # Get current config
        r = requests.get(f"{BASE_URL}/api/v1/config")
        r.raise_for_status()
        current_config = r.json()
        print(f"  Current LLM Provider: {current_config.get('llm_provider')}")
        
        # Update config
        test_val = f"gemini-test-{int(time.time())}"
        updated_payload = current_config.copy()
        updated_payload["gemini_api_key"] = test_val
        updated_payload["llm_provider"] = "gemini"
        
        r_post = requests.post(f"{BASE_URL}/api/v1/config", json=updated_payload)
        r_post.raise_for_status()
        
        # Verify update persisted
        r_get = requests.get(f"{BASE_URL}/api/v1/config")
        r_get.raise_for_status()
        verified_config = r_get.json()
        
        assert verified_config.get("gemini_api_key") == test_val, "Failed to persist gemini_api_key update"
        assert verified_config.get("llm_provider") == "gemini", "Failed to persist llm_provider update"
        print("  [SUCCESS] Settings synchronized and verified successfully.")
    except Exception as e:
        print(f"  [FAIL] Settings verification failed: {e}")
        sys.exit(1)

    # Test 3: Task Submission
    print("\n[Test 3] Verifying Task Submission...")
    task_payload = {
        "video_subject": "Exploring the Secrets of Python Integration Tests",
        "video_aspect_ratio": "9:16",
        "voice_name": "en-US-GuyNeural",
        "language": "en",
        "paragraph_number": 2
    }
    
    try:
        r_task = requests.post(f"{BASE_URL}/api/v1/videos", json=task_payload)
        r_task.raise_for_status()
        task_data = r_task.json()
        task_id = task_data.get("task_id")
        print(f"  [SUCCESS] Task submitted. Task ID: {task_id}")
        assert task_id is not None, "Task ID was not returned by API"
    except Exception as e:
        print(f"  [FAIL] Task submission failed: {e}")
        sys.exit(1)

    # Test 4: Status Logs Streaming & Progress Polling
    print("\n[Test 4] Verifying Status Logs Streaming & Progress Polling...")
    completed = False
    max_polls = 30
    poll_count = 0
    previous_progress = -1
    previous_logs_len = 0
    
    try:
        while not completed and poll_count < max_polls:
            time.sleep(2)
            poll_count += 1
            
            r_status = requests.get(f"{BASE_URL}/api/v1/tasks/{task_id}")
            r_status.raise_for_status()
            status_data = r_status.json()
            
            progress = status_data.get("progress")
            status = status_data.get("status")
            step = status_data.get("step")
            logs = status_data.get("logs", [])
            
            print(f"  Poll #{poll_count}: Progress={progress}%, Status={status}, Step={step}, Logs={len(logs)}")
            
            if progress > previous_progress:
                print(f"    -> Progress advanced: {previous_progress}% to {progress}%")
                previous_progress = progress
                
            if len(logs) > previous_logs_len:
                new_logs = logs[previous_logs_len:]
                for log in new_logs:
                    print(f"    [STREAMED LOG] {log}")
                previous_logs_len = len(logs)
                
            if status.lower() == "completed" or progress >= 100:
                completed = True
                print("  [SUCCESS] Task reached completed state!")
                
        assert completed, "Task failed to complete within expected time window."
    except Exception as e:
        print(f"  [FAIL] Status polling and log streaming failed: {e}")
        sys.exit(1)

    # Test 5: Video Library and Playback Verification
    print("\n[Test 5] Verifying Video Library Playback operations...")
    try:
        # Check library list
        r_lib = requests.get(f"{BASE_URL}/api/v1/videos")
        r_lib.raise_for_status()
        videos_list = r_lib.json()
        
        # Verify task video exists in the library
        found_video = None
        for v in videos_list:
            if v.get("id") == task_id:
                found_video = v
                break
                
        assert found_video is not None, f"Generated video with ID {task_id} not found in library gallery"
        print(f"  Found video in gallery: Title='{found_video.get('title')}'")
        
        # Download and verify size
        download_url = found_video.get("download_url")
        full_url = f"{BASE_URL}{download_url}" if download_url.startswith("/") else download_url
        print(f"  Verifying media download from: {full_url}")
        
        r_dl = requests.get(full_url, stream=True)
        r_dl.raise_for_status()
        
        # Read small chunk to verify it is served
        chunk = next(r_dl.iter_content(chunk_size=1024))
        print(f"  [SUCCESS] Media retrieved. Sample chunk size: {len(chunk)} bytes")
        assert len(chunk) > 0, "Downloaded media file chunk is empty"
        print("  [SUCCESS] Video library playback and asset retrieval verified.")
    except Exception as e:
        print(f"  [FAIL] Video library and playback verification failed: {e}")
        sys.exit(1)
        
    # Test 6: Script Generation Verification
    print("\n[Test 6] Verifying Script Generation Endpoint...")
    script_payload = {
        "subject": "5 Amazing Facts about Space Exploration",
        "language": "en",
        "paragraphs": 3
    }
    try:
        r_script = requests.post(f"{BASE_URL}/api/v1/script/generate", json=script_payload)
        r_script.raise_for_status()
        script_data = r_script.json()
        script_text = script_data.get("script")
        print(f"  [SUCCESS] Script generated: {script_text[:100]}...")
        assert script_text is not None, "Script content is null"
        # Since paragraphs=3, check if it has multiple paragraphs
        paras = [p for p in script_text.split("\n\n") if p.strip()]
        assert len(paras) == 3, f"Expected 3 paragraphs, got {len(paras)}"
        print("  [SUCCESS] Script generation endpoint verified.")
    except Exception as e:
        print(f"  [FAIL] Script generation verification failed: {e}")
        sys.exit(1)

    print("\n===================================================")
    print("  ALL E2E INTEGRATION TESTS PASSED SUCCESSFULLY! ")
    print("===================================================")

if __name__ == "__main__":
    run_tests()

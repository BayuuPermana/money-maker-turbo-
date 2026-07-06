import sys
import os
import math
import random
from moviepy import ImageClip

def apply_motion(image_path, output_path, duration=5.0):
    if not os.path.exists(image_path):
        print(f"Error: Input image {image_path} does not exist.")
        sys.exit(1)
        
    print(f"Loading image: {image_path}")
    print(f"Duration: {duration} seconds")
    
    # Target resolution for vertical video (9:16)
    target_w, target_h = 512, 896
    
    # Load base static image clip
    clip = ImageClip(image_path).with_duration(duration).without_mask()
    # Hash of the image path to select a deterministic preset
    import hashlib
    h_val = int(hashlib.md5(image_path.encode('utf-8')).hexdigest(), 16)
    preset_idx = h_val % 6
    print(f"Selected motion preset {preset_idx} for {os.path.basename(image_path)}")
    
    # Combine Ken Burns zoom and handheld shake inside a single frame filter
    # We resize the clip to 1.3x to provide a safe margin for zooming, panning, and shaking
    base_scale = 1.3
    scaled_clip = clip.resized(base_scale)
    
    # Set random seed to ensure deterministic shake generation across frames if needed
    random.seed(42)
    
    # Generate pre-calculated noise offsets to avoid random flickering on sub-frames
    fps = 24
    total_frames = int(duration * fps)
    noise_x = [random.uniform(-1.0, 1.0) for _ in range(total_frames + 10)]
    noise_y = [random.uniform(-1.0, 1.0) for _ in range(total_frames + 10)]
    
    def transform_frame(get_frame, t):
        frame = get_frame(t)
        h, w, c = frame.shape
        
        # Determine base crop boundaries (zoom_factor, x_base, y_base) based on preset
        if preset_idx == 0:
            # 0: Zoom In + Pan Left to Right
            zoom_factor = 1.0 + 0.15 * (t / duration)
            crop_w = int(target_w / zoom_factor)
            crop_h = int(target_h / zoom_factor)
            x_base = (w - crop_w) * (t / duration)
            y_base = (h - crop_h) / 2.0
        elif preset_idx == 1:
            # 1: Zoom Out + Pan Right to Left
            zoom_factor = 1.15 - 0.15 * (t / duration)
            crop_w = int(target_w / zoom_factor)
            crop_h = int(target_h / zoom_factor)
            x_base = (w - crop_w) * (1.0 - t / duration)
            y_base = (h - crop_h) / 2.0
        elif preset_idx == 2:
            # 2: Tilt Up to Down (slightly zoomed)
            zoom_factor = 1.12
            crop_w = int(target_w / zoom_factor)
            crop_h = int(target_h / zoom_factor)
            x_base = (w - crop_w) / 2.0
            y_base = (h - crop_h) * (t / duration)
        elif preset_idx == 3:
            # 3: Tilt Down to Up (slightly zoomed)
            zoom_factor = 1.12
            crop_w = int(target_w / zoom_factor)
            crop_h = int(target_h / zoom_factor)
            x_base = (w - crop_w) / 2.0
            y_base = (h - crop_h) * (1.0 - t / duration)
        elif preset_idx == 4:
            # 4: Centered Zoom In
            zoom_factor = 1.0 + 0.15 * (t / duration)
            crop_w = int(target_w / zoom_factor)
            crop_h = int(target_h / zoom_factor)
            x_base = (w - crop_w) / 2.0
            y_base = (h - crop_h) / 2.0
        else:
            # 5: Centered Zoom Out
            zoom_factor = 1.15 - 0.15 * (t / duration)
            crop_w = int(target_w / zoom_factor)
            crop_h = int(target_h / zoom_factor)
            x_base = (w - crop_w) / 2.0
            y_base = (h - crop_h) / 2.0
        
        # Handheld camera shake breathing & jitter (using sine waves + pre-computed noise)
        frame_idx = int(t * fps)
        jitter_x = noise_x[min(frame_idx, len(noise_x)-1)]
        jitter_y = noise_y[min(frame_idx, len(noise_y)-1)]
        
        # Soft breathing/sway (frequency 0.5Hz, 3x slower, and 4x smaller amplitude)
        breathe_x = 0.8 * math.sin(0.6 * 2.0 * math.pi * t) + 0.15 * jitter_x
        breathe_y = 0.6 * math.cos(0.5 * 2.0 * math.pi * t) + 0.15 * jitter_y
        
        x1 = int(max(0, min(w - crop_w, x_base + breathe_x)))
        y1 = int(max(0, min(h - crop_h, y_base + breathe_y)))
        
        cropped = frame[y1:y1+crop_h, x1:x1+crop_w]
        
        # Resize cropped frame back to output resolution (512x896) using PIL
        from PIL import Image
        import numpy as np
        img_cropped = Image.fromarray(cropped)
        img_resized = img_cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
        return np.array(img_resized)

    print("Applying pan, zoom, and handheld camera shake...")
    animated = scaled_clip.transform(transform_frame)
    
    print(f"Writing animated video clip to: {output_path}")
    animated.write_videofile(
        output_path, 
        fps=fps, 
        codec="libx264", 
        audio=False, 
        preset="ultrafast", 
        logger=None
    )
    print("Camera motion render complete!")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python apply_camera_motion.py <image_path> <output_path> [duration]")
        sys.exit(1)
    img = sys.argv[1]
    out = sys.argv[2]
    dur = float(sys.argv[3]) if len(sys.argv) > 3 else 5.0
    apply_motion(img, out, dur)

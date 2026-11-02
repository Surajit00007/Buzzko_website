import cv2
import imageio
import os
from PIL import Image

def convert_webm_to_mp4(webm_path, mp4_path, fps=25.0):
    print(f"Converting {webm_path} -> {mp4_path}...")
    cap = cv2.VideoCapture(webm_path)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(mp4_path, fourcc, fps, (w, h))
    
    frames_written = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)
        frames_written += 1
        
    cap.release()
    out.release()
    print(f"Finished {mp4_path}: {frames_written} frames ({os.path.getsize(mp4_path)} bytes)")

def create_animated_gif(webm_path, gif_path, target_width=640, fps=12):
    print(f"Creating animated GIF {webm_path} -> {gif_path}...")
    cap = cv2.VideoCapture(webm_path)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    target_height = int(h * (target_width / w))
    
    # Extract frames, downsample to target FPS (~12 fps from ~26 fps)
    step = 2 # every 2nd frame
    frames = []
    idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % step == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            resized = cv2.resize(rgb, (target_width, target_height), interpolation=cv2.INTER_AREA)
            # Use PIL with adaptive palette quantization for crisp small GIF
            pil_img = Image.fromarray(resized).convert('P', palette=Image.Palette.ADAPTIVE, colors=128)
            frames.append(pil_img)
        idx += 1
    cap.release()
    
    if frames:
        frames[0].save(
            gif_path,
            save_all=True,
            append_images=frames[1:],
            duration=int(1000 / fps),
            loop=0,
            optimize=True
        )
        print(f"Finished {gif_path}: {len(frames)} frames ({os.path.getsize(gif_path)} bytes)")

if __name__ == '__main__':
    # 1. Convert demo video
    convert_webm_to_mp4('public/buzzko-website-demo.webm', 'public/buzzko-website-demo.mp4')
    convert_webm_to_mp4('public/buzzko-website-demo.webm', 'Assets/buzzko-website-demo.mp4')
    
    # 2. Convert reel video
    convert_webm_to_mp4('public/buzzko-feature-reel.webm', 'public/buzzko-feature-reel.mp4')
    convert_webm_to_mp4('public/buzzko-feature-reel.webm', 'Assets/buzzko-feature-reel.mp4')
    
    # 3. Create animated GIF for README autoplay
    create_animated_gif('public/buzzko-website-demo.webm', 'public/buzzko-website-demo.gif', target_width=720, fps=12)


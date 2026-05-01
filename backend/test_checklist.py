import requests
import os
import json
import subprocess

BASE_URL = "http://localhost:8000"

print("Starting end-to-end checklist test...")


# 1. Create dummy files using local ffmpeg
print("Creating dummy media files...")
subprocess.run(["./ffmpeg", "-f", "lavfi", "-i", "testsrc=duration=3:size=640x360:rate=30", "-vcodec", "libx264", "test_video.mp4", "-y"], capture_output=True)


# 2. Upload Audio
print("\n[Checklist] 1. Upload Audio Endpoint (/upload-song)")
with open("test_audio.mp3", "rb") as f:
    res = requests.post(f"{BASE_URL}/upload-song", files={"file": f})
assert res.status_code == 200, f"Failed: {res.text}"
print("✅ Success: Audio uploaded.")
audio_filename = res.json()["filename"]

# 3. Upload Video
print("\n[Checklist] 2. Upload Video Endpoint (/upload-video)")
with open("test_video.mp4", "rb") as f:
    res = requests.post(f"{BASE_URL}/upload-video", files={"file": f})
assert res.status_code == 200, f"Failed: {res.text}"
print("✅ Success: Video uploaded.")
video_filename = res.json()["filename"]

# 4. Sync Lyrics
print("\n[Checklist] 3. Sync Lyrics Endpoint (/sync-lyrics)")
with open("test_audio.mp3", "rb") as f:
    req_data = {
        "lyrics": ["Test lyric one", "Test lyric two"],
        "font": "Arial",
        "font_size": 48,
        "font_color": "#FFFFFF",
        "position": "bottom"
    }
    res = requests.post(f"{BASE_URL}/sync-lyrics", data={"request": json.dumps(req_data)}, files={"audio_file": f})
assert res.status_code == 200, f"Failed: {res.text}"
print("✅ Success: Lyrics synchronized.")
timestamps = res.json()["timestamps"]
print("   Timestamps generated:", timestamps)

# 5. Create Video
print("\n[Checklist] 4. Create Video Endpoint (/create-video)")
create_req = {
    "background_video": video_filename,
    "audio": audio_filename,
    "timestamps": timestamps,
    "font": "Arial",
    "font_size": 48,
    "font_color": "#FFFFFF",
    "position": "bottom"
}
res = requests.post(f"{BASE_URL}/create-video", json=create_req)
assert res.status_code == 200, f"Failed: {res.text}"
print("✅ Success: Final video generated and returned.")
with open("output_test.mp4", "wb") as f:
    f.write(res.content)
print(f"   Saved to output_test.mp4 (size: {os.path.getsize('output_test.mp4')} bytes)")

print("\n🎉 All checklist items working as intended!")

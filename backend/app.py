import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List

from sync import transcribe_audio, align_lyrics
from video import compose_video


from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(title="Lyric Video Creator", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SyncRequest(BaseModel):
    lyrics: List[str]
    font: str = "Arial"
    font_size: int = 48
    font_color: str = "#FFFFFF"
    position: str = "bottom"

class SyncResponse(BaseModel):
    timestamps: List[dict]

class VideoRequest(BaseModel):
    background_video: str  # filename of previously uploaded video
    audio: str            # filename of uploaded audio
    timestamps: List[dict]
    font: str = "Arial"
    font_size: int = 48
    font_color: str = "#FFFFFF"
    position: str = "bottom"

@app.post("/upload-song")
async def upload_song(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.mp3'):
        raise HTTPException(status_code=400, detail="Only MP3 files are accepted.")
    dest_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(dest_path, "wb") as out_file:
        content = await file.read()
        out_file.write(content)
    return {"filename": file.filename}

@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.mp4'):
        raise HTTPException(status_code=400, detail="Only MP4 video files are accepted.")
    dest_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(dest_path, "wb") as out_file:
        content = await file.read()
        out_file.write(content)
    return {"filename": file.filename}


UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/sync-lyrics")
async def sync_lyrics(audio_file: UploadFile = File(...), request: str = File(...)):
    # request is a JSON string
    req_data = json.loads(request)
    lyrics = req_data.get("lyrics", [])
    
    # Save temporary audio file
    audio_path = os.path.join(UPLOAD_DIR, audio_file.filename)
    with open(audio_path, "wb") as f:
        f.write(await audio_file.read())
    # Transcribe audio
    transcript = transcribe_audio(audio_path)
    # Align provided lyrics with transcript
    aligned = align_lyrics(transcript, lyrics)
    return {"timestamps": aligned}


@app.post("/create-video")
async def create_video(req: VideoRequest):
    audio_path = os.path.join(UPLOAD_DIR, req.audio)
    video_path = os.path.join(UPLOAD_DIR, req.background_video)
    if not os.path.isfile(audio_path) or not os.path.isfile(video_path):
        raise HTTPException(status_code=404, detail="Audio or video file not found.")
    output_path = os.path.join(UPLOAD_DIR, f"output_{req.audio.rsplit('.',1)[0]}.mp4")
    compose_video(
        background_path=video_path,
        audio_path=audio_path,
        lyrics_timestamps=req.timestamps,
        style={
            "font": req.font,
            "font_size": req.font_size,
            "font_color": req.font_color,
            "position": req.position,
        },
        output_path=output_path,
    )
    return FileResponse(output_path, media_type="video/mp4", filename=os.path.basename(output_path))

@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "ok"})

import os
import json
import numpy as np
from dtaidistance import dtw
from openai import OpenAI
from mutagen.mp3 import MP3
from mutagen.id3 import ID3
from mutagen.wave import WAVE
from mutagen.flac import FLAC

# Initialize OpenAI client (requires OPENAI_API_KEY env var)
client = OpenAI()

def get_audio_duration(audio_path: str) -> float:
    """Get duration of audio file using mutagen (lightweight)."""
    ext = os.path.splitext(audio_path)[1].lower()
    try:
        if ext == '.mp3':
            audio = MP3(audio_path)
        elif ext == '.wav':
            audio = WAVE(audio_path)
        elif ext == '.flac':
            audio = FLAC(audio_path)
        else:
            # Fallback for other formats
            from mutagen import File
            audio = File(audio_path)
        return audio.info.length
    except Exception:
        return 0.0

def transcribe_audio(audio_path: str) -> list:
    """Transcribe the given audio file using OpenAI Whisper API.
    Returns a list of dicts with 'word', 'start', 'end' timestamps.
    """
    with open(audio_path, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
            timestamp_granularities=["word"]
        )
    
    words = []
    # The API returns a 'words' list in 'verbose_json' format when using timestamp_granularities
    if hasattr(response, 'words'):
        for word_info in response.words:
            words.append({
                "word": word_info.get('word', '').strip(),
                "start": word_info.get('start', 0.0),
                "end": word_info.get('end', 0.0)
            })
    elif 'words' in response: # If it's a dict
         for word_info in response['words']:
            words.append({
                "word": word_info.get('word', '').strip(),
                "start": word_info.get('start', 0.0),
                "end": word_info.get('end', 0.0)
            })
            
    return words


def align_lyrics(transcript_words: list, user_lyrics: list) -> list:
    """Align user-provided lyric lines with Whisper transcript using DTW.
    Returns a list of dicts: {"text": line, "start": float, "end": float}
    """
    if not transcript_words or not user_lyrics:
        return []

    # Prepare sequences: flatten transcript words into a string list
    transcript_seq = [w['word'].lower() for w in transcript_words]
    # Prepare user lyrics lines split into words
    lyric_lines = [line.strip() for line in user_lyrics if line.strip()]
    lyric_seq = []
    line_bounds = []  # (start_idx, end_idx) in word indices for each line
    idx = 0
    for line in lyric_lines:
        words = line.lower().split()
        start = idx
        lyric_seq.extend(words)
        idx += len(words)
        end = idx - 1
        line_bounds.append((start, end))

    if not transcript_seq or not lyric_seq:
        return []

    # Compute binary distance matrix: 0 if words match, 1 otherwise
    # We use a simple cost matrix for dtaidistance or manual DTW
    # dtaidistance.dtw.distance_matrix requires numerical sequences
    
    # Map words to unique integers for DTW
    vocab = {w: i for i, w in enumerate(set(transcript_seq + lyric_seq))}
    s1 = np.array([vocab[w] for w in transcript_seq], dtype=np.double)
    s2 = np.array([vocab[w] for w in lyric_seq], dtype=np.double)

    # dtaidistance.dtw.warping_path gives the optimal path
    path = dtw.warping_path(s1, s2)
    
    # Build mapping from lyric word index to transcript word indices
    lyric_to_transcript = {j: [] for j in range(len(lyric_seq))}
    for i, j in path:
        lyric_to_transcript[j].append(i)

    aligned = []
    for line_idx, (start, end) in enumerate(line_bounds):
        transcript_indices = []
        for w_idx in range(start, end + 1):
            transcript_indices.extend(lyric_to_transcript.get(w_idx, []))
        
        if not transcript_indices:
            if aligned:
                start_time = aligned[-1]["end"]
                end_time = start_time + 2.0
            else:
                start_time = 0.0
                end_time = 2.0
        else:
            start_time = transcript_words[min(transcript_indices)]['start']
            end_time = transcript_words[max(transcript_indices)]['end']
            
        aligned.append({
            "text": lyric_lines[line_idx],
            "start": round(start_time, 3),
            "end": round(end_time, 3)
        })
    return aligned

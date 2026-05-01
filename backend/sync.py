import os
import json
import whisper
import numpy as np
from dtaidistance import dtw


_model = None

def get_model():
    global _model
    if _model is None:
        _model = whisper.load_model("base")
    return _model

def transcribe_audio(audio_path: str) -> list:
    """Transcribe the given audio file using OpenAI Whisper.
    Returns a list of dicts with 'word', 'start', 'end' timestamps.
    """
    model = get_model()
    # Run transcription with word-level timestamps
    result = model.transcribe(audio_path, word_timestamps=True)
    words = []
    for segment in result.get('segments', []):
        for word_info in segment.get('words', []):
            words.append({
                "word": word_info.get('word').strip(),
                "start": word_info.get('start'),
                "end": word_info.get('end')
            })
    return words


def align_lyrics(transcript_words: list, user_lyrics: list) -> list:
    """Align user-provided lyric lines with Whisper transcript using DTW.
    Returns a list of dicts: {"text": line, "start": float, "end": float}
    """
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
    # Compute DTW distance matrix

    import librosa
    if not transcript_seq or not lyric_seq:
        raise ValueError("Empty transcript or lyric sequence.")
    
    # Compute binary distance matrix: 0 if words match, 1 otherwise
    C = np.zeros((len(transcript_seq), len(lyric_seq)))
    for i, t_w in enumerate(transcript_seq):
        for j, l_w in enumerate(lyric_seq):
            C[i, j] = 0.0 if t_w == l_w else 1.0

    # Compute DTW alignment
    D, wp = librosa.sequence.dtw(C=C)
    
    # Build mapping from lyric line index to transcript word indices via path
    # wp returns path in reverse order: [transcript_idx, lyric_idx]
    paths = [(i, j) for i, j in wp[::-1]]
    lyric_to_transcript = {j: [] for _, j in paths}

    for i, j in paths:
        lyric_to_transcript[j].append(i)
    # Now for each lyric line, gather corresponding transcript word indices
    aligned = []
    lyric_word_index = 0
    for line_idx, (start, end) in enumerate(line_bounds):
        # Gather transcript indices for all words in this line
        transcript_indices = []
        for w_idx in range(start, end + 1):
            transcript_indices.extend(lyric_to_transcript.get(w_idx, []))
        if not transcript_indices:
            # fallback: estimate based on previous line end
            if aligned:
                prev_end = aligned[-1]["end"]
                start_time = prev_end + 0.5
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

import ffmpeg
import os
import tempfile

def format_timestamp(seconds):
    """Convert seconds to ASS timestamp format (H:MM:SS.cs)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    centiseconds = int(round((seconds % 1) * 100))
    if centiseconds == 100:
        secs += 1
        centiseconds = 0
    return f"{hours}:{minutes:02d}:{secs:02d}.{centiseconds:02d}"

def hex_to_ass_color(hex_color):
    """Convert #RRGGBB to ASS color format (&HBBGGRR&)"""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 6:
        r, g, b = hex_color[0:2], hex_color[2:4], hex_color[4:6]
        return f"&H00{b}{g}{r}&"
    return "&H00FFFFFF&"

def compose_video(background_path, audio_path, lyrics_timestamps, style, output_path):
    """Compose video with background, audio, and overlaid lyrics using ASS subtitles."""
    font = style.get("font", "Arial")
    font_size = style.get("font_size", 48)
    font_color = hex_to_ass_color(style.get("font_color", "#FFFFFF"))
    position = style.get("position", "bottom")

    # Map position to ASS alignment
    alignment_map = {
        "top": 8,
        "center": 5,
        "bottom": 2
    }
    alignment = alignment_map.get(position.lower(), 2)

    # Create ASS file content
    ass_header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font},{font_size},{font_color},&H000000FF&,&H00000000&,&H00000000&,0,0,0,0,100,100,0,0,1,2,2,{alignment},10,10,50,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    

    events = []
    for line in lyrics_timestamps:
        start = format_timestamp(line['start'])
        end = format_timestamp(line['end'])
        text = line['text'].replace('\n', '\\N')
        # Add fade in/out (300ms)
        events.append(f"Dialogue: 0,{start},{end},Default,,0,0,0,,{{\\fad(300,300)}}{text}")


    ass_content = ass_header + "\n".join(events)

    # Write ASS to a temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.ass', delete=False) as temp_ass:
        temp_ass.write(ass_content)
        temp_ass_path = temp_ass.name

    try:
        # Build FFmpeg command
        video_input = ffmpeg.input(background_path)
        audio_input = ffmpeg.input(audio_path)
        
        # Add subtitles filter
        # Note: filenames in subtitles filter need special escaping on Windows, but here we are on Mac.
        # We also need to handle the output path.
        
        stream = ffmpeg.output(
            video_input.filter('subtitles', temp_ass_path),
            audio_input,
            output_path,
            vcodec='libx264',
            acodec='aac',
            strict='experimental',
            shortest=None
        ).overwrite_output()


        # Try to use 'ffmpeg' from the system path
        stream.run(capture_stdout=True, capture_stderr=True, cmd='ffmpeg')

    except ffmpeg.Error as e:
        stderr = e.stderr.decode() if e.stderr else "No stderr captured"
        print(f"FFmpeg error: {stderr}")
        raise RuntimeError(f"FFmpeg failed: {stderr}")
    except FileNotFoundError:
        raise RuntimeError("ffmpeg binary not found. Please ensure ffmpeg is installed and available in the system path.")
    except Exception as e:
        print(f"Unexpected error in compose_video: {str(e)}")
        raise e
    finally:
        if os.path.exists(temp_ass_path):
            os.remove(temp_ass_path)

    return output_path

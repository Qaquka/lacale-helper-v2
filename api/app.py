import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

ALLOWED_EXTENSIONS = {'.mkv', '.mp4', '.avi'}
MAX_UPLOAD_MB = int(os.getenv('MAX_UPLOAD_MB', '4096'))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

app = FastAPI(title='LaCale MediaInfo API', version='1.0.0')


def _to_nfo_lines(media_json: Dict[str, Any]) -> List[str]:
    media = media_json.get('media', {})
    tracks = media.get('track', [])
    lines: List[str] = ['General']

    for track in tracks:
        track_type = str(track.get('@type', '')).lower()
        if track_type == 'general':
            lines.extend(
                [
                    f"Complete name                            : {track.get('CompleteName', '')}",
                    f"Format                                   : {track.get('Format', '')}",
                    f"File size                                : {track.get('FileSize_String', track.get('FileSize', ''))}",
                    f"Duration                                 : {track.get('Duration_String3', track.get('Duration_String', track.get('Duration', '')))}",
                ]
            )
        elif track_type == 'video':
            lines.extend(
                [
                    '',
                    'Video',
                    f"Format                                   : {track.get('Format', '')}",
                    f"Format profile                           : {track.get('Format_Profile', '')}",
                    f"Width                                    : {track.get('Width_String', track.get('Width', ''))}",
                    f"Height                                   : {track.get('Height_String', track.get('Height', ''))}",
                    f"Bit rate                                 : {track.get('BitRate_String', track.get('BitRate', ''))}",
                    f"Frame rate                               : {track.get('FrameRate_String', track.get('FrameRate', ''))}",
                ]
            )
        elif track_type == 'audio':
            lines.extend(
                [
                    '',
                    'Audio',
                    f"Format                                   : {track.get('Format', '')}",
                    f"Language                                 : {track.get('Language_String3', track.get('Language', ''))}",
                    f"Bit rate                                 : {track.get('BitRate_String', track.get('BitRate', ''))}",
                    f"Channels                                 : {track.get('Channel_s_', track.get('Channel(s)', ''))}",
                ]
            )

    return [line for line in lines if line is not None]


def run_mediainfo_json(file_path: str) -> Dict[str, Any]:
    completed = subprocess.run(
        ['mediainfo', '--Output=JSON', file_path],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed.stdout)


@app.get('/api/health')
def health() -> Dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/analyze')
async def analyze(file: UploadFile = File(...)) -> JSONResponse:
    filename = file.filename or ''
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f'Extension non autorisée: {ext or "(none)"}')

    temp_path: str | None = None
    total = 0

    try:
        with tempfile.NamedTemporaryFile(prefix='lacale-', suffix=ext, dir='/tmp', delete=False) as tmp:
            temp_path = tmp.name
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f'Fichier trop volumineux (> {MAX_UPLOAD_MB} MB)',
                    )
                tmp.write(chunk)

        media_json = run_mediainfo_json(temp_path)
        nfo_text = '\n'.join(_to_nfo_lines(media_json)).strip() + '\n'

        return JSONResponse(
            {
                'filename': filename,
                'size_bytes': total,
                'media_info_json': media_json,
                'nfo_text': nfo_text,
            }
        )
    except HTTPException:
        raise
    except subprocess.CalledProcessError as exc:
        raise HTTPException(status_code=500, detail=f'mediainfo a échoué: {exc.stderr.strip()}') from exc
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail='Sortie mediainfo JSON invalide') from exc
    finally:
        await file.close()
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

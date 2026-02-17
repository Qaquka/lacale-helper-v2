from fastapi.testclient import TestClient

import app as api_app


def test_health_ok():
    client = TestClient(api_app.app)
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_analyze_rejects_extension():
    client = TestClient(api_app.app)
    response = client.post(
        '/api/analyze',
        files={'file': ('sample.txt', b'hello', 'text/plain')},
    )
    assert response.status_code == 400
    assert 'Extension non autorisée' in response.json()['detail']


def test_analyze_ok(monkeypatch):
    def fake_run(_file_path: str):
        return {
            'media': {
                'track': [
                    {'@type': 'General', 'Format': 'Matroska', 'FileSize': '1234'},
                    {'@type': 'Video', 'Format': 'AVC', 'Width': '1920', 'Height': '1080'},
                ]
            }
        }

    monkeypatch.setattr(api_app, 'run_mediainfo_json', fake_run)

    client = TestClient(api_app.app)
    response = client.post(
        '/api/analyze',
        files={'file': ('movie.mkv', b'123456', 'video/x-matroska')},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload['filename'] == 'movie.mkv'
    assert payload['size_bytes'] == 6
    assert 'media_info_json' in payload
    assert 'nfo_text' in payload
    assert 'General' in payload['nfo_text']

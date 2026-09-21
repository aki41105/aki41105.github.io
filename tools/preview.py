#!/usr/bin/env python3
"""公開URLを維持したままローカル表示する。実行: python3 tools/preview.py"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import io
import re

ROOT = Path(__file__).resolve().parent.parent


def published_files():
    """移動したソースの先頭から、公開URLと本文を取り出す。"""
    files = {}
    for folder in ('pages', 'css', 'js'):
        for source in (ROOT / folder).rglob('*'):
            if not source.is_file():
                continue
            content = source.read_bytes()
            match = re.match(rb'---\nlayout: null\npermalink: (/[^\n]+)\n---\n', content)
            if match:
                url = match[1].decode()
                if url in files:
                    raise ValueError(f'公開URLが重複しています: {url}')
                files[url] = (source, content[match.end():])
    return files


class Preview(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        url = unquote(urlsplit(self.path).path)
        if any(part.startswith(('.', '_')) for part in Path(url).parts):
            self.send_error(404)
            return None
        if url in published_files():
            source, body = published_files()[url]
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(str(source)))
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            return io.BytesIO(body)
        return super().send_head()


if __name__ == '__main__':
    print('http://127.0.0.1:8000/ を開いてください。終了: Ctrl+C')
    ThreadingHTTPServer(('127.0.0.1', 8000), Preview).serve_forever()

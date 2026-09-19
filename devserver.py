#!/usr/bin/env python3
"""Static file server for local dev — identical to `python3 -m http.server`
except every response carries Cache-Control: no-store, so edited files are
never served stale from the browser's HTTP cache (which bit us repeatedly:
even hard-reloads and brand-new tabs kept getting cached JS modules)."""

import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5678
    HTTPServer(('', port), NoCacheHandler).serve_forever()

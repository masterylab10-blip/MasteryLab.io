import http.server
import socketserver
import os

PORT = 8081

class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Remove query strings/fragments
        path = self.path.split('?')[0].split('#')[0]
        
        # If it's a directory, let standard handler deal with it (checks index.html)
        if path.endswith('/'):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
            
        # If file exists, serve it
        if os.path.exists(os.getcwd() + path):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
            
        # If file doesn't exist, try appending .html
        if os.path.exists(os.getcwd() + path + '.html'):
            self.path = path + '.html'
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
            
        # Otherwise let standard handler return 404
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

Handler = CleanUrlHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

$port = 8081
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Listening on http://localhost:$port/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        
        # Replace forward slashes with system separators and prevent directory traversal
        $safePath = $path -replace '/', '\'
        if ($safePath.StartsWith('\')) { $safePath = $safePath.Substring(1) }
        
        $fullPath = Join-Path (Get-Location) $safePath
        
        # Clean URL handling (e.g. /login -> /login.html)
        if (-not (Test-Path $fullPath) -and (Test-Path "$fullPath.html")) {
            $fullPath = "$fullPath.html"
            $path = "$path.html"
        }
        
        if (Test-Path $fullPath -PathType Leaf) {
            $fileInfo = Get-Item $fullPath
            
            if ($path -match '\.html$') { $response.ContentType = "text/html; charset=utf-8" }
            elseif ($path -match '\.css$') { $response.ContentType = "text/css; charset=utf-8" }
            elseif ($path -match '\.js$') { $response.ContentType = "application/javascript; charset=utf-8" }
            elseif ($path -match '\.png$') { $response.ContentType = "image/png" }
            elseif ($path -match '\.jpg$|\.jpeg$') { $response.ContentType = "image/jpeg" }
            elseif ($path -match '\.svg$') { $response.ContentType = "image/svg+xml" }
            elseif ($path -match '\.mp4$') { $response.ContentType = "video/mp4" }
            
            try {
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $response.StatusCode = 500
            } finally {
                $response.OutputStream.Close()
            }
        } else {
            $response.StatusCode = 404
            $response.Close()
        }
    }
} finally {
    $listener.Stop()
}

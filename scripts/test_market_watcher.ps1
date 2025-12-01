$response = Invoke-WebRequest -Uri "http://localhost:8001/analyze/daily" -Method POST -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "✅ Market Watcher API is working."
    Write-Host $response.Content
}
else {
    Write-Host "❌ Market Watcher API failed with status $($response.StatusCode)"
    Write-Host $response.Content
}

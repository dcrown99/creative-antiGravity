# Test Market Analysis API

$ErrorActionPreference = "Stop"

Write-Host "Testing Market Analysis API..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/analyze/daily" -Method Post -ErrorAction Stop
    
    Write-Host "Response received!" -ForegroundColor Green
    # Write-Host ($response | ConvertTo-Json -Depth 5)

    if ($null -eq $response.sources) {
        Write-Error "Response is missing 'sources' field."
    }

    if ($response.sources.Count -eq 0) {
        Write-Warning "Sources list is empty. This might be valid if no news was found, but check logs."
    }
    else {
        Write-Host "Sources found: $($response.sources.Count)" -ForegroundColor Green
        foreach ($source in $response.sources) {
            Write-Host " - Title: $($source.title)"
            Write-Host "   Link:  $($source.link)"
            
            if ([string]::IsNullOrWhiteSpace($source.title) -or [string]::IsNullOrWhiteSpace($source.link)) {
                Write-Error "Source item is missing title or link."
            }
        }
    }

    Write-Host "Verification Passed!" -ForegroundColor Green

}
catch {
    Write-Error "API Request Failed: $_"
}

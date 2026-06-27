# ──────────────────────────────────────────────────────────────────
# downloadCarImages.ps1
# Downloads real car images for the RentEase car rental system.
# Sources: Wikimedia Commons (CC-licensed, free to use)
# Run from: d:\car_rental_system\backend\
# ──────────────────────────────────────────────────────────────────

$outputDir = "..\frontend\public\images\cars"

if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
    Write-Host "Created directory: $outputDir" -ForegroundColor Green
}

# Verified direct Wikimedia Commons URLs (found via browser search June 2026)
$carImages = [ordered]@{
    "toyota-fortuner.jpg"    = "https://upload.wikimedia.org/wikipedia/commons/1/14/2021_Toyota_Fortuner_SRZ_2.7_4x2_%28Indonesia%29_front_view_01.jpg"
    "hyundai-creta.jpg"      = "https://upload.wikimedia.org/wikipedia/commons/b/be/HYUNDAI_CRETA_%2C_iX25_%28SU2%29_China_%281%29.jpg"
    "kia-seltos.jpg"         = "https://upload.wikimedia.org/wikipedia/commons/0/06/Kia_Seltos_IMG_9152.jpg"
    "mahindra-xuv700.jpg"    = "https://upload.wikimedia.org/wikipedia/commons/b/ba/2021_Mahindra_XUV700_2.2_AX7_%28India%29_front_view.png"
    "jeep-compass.jpg"       = "https://upload.wikimedia.org/wikipedia/commons/9/9c/Jeep_Compass_%28MP%29_PHEV_Facelift_1X7A0140.jpg"
    "skoda-kushaq.jpg"       = "https://upload.wikimedia.org/wikipedia/commons/e/e7/Skoda_Kushaq_Front.jpg"
    "mg-hector.jpg"          = "https://upload.wikimedia.org/wikipedia/commons/c/c4/MG_Hector_Diesel_%28India%29_front_view.png"
    "honda-city.jpg"         = "https://upload.wikimedia.org/wikipedia/commons/d/dd/Honda_City_2020.jpg"
    "maruti-swift.jpg"       = "https://upload.wikimedia.org/wikipedia/commons/4/43/Maruti_Suzuki_Swift_4456.JPG"
    "volkswagen-virtus.jpg"  = "https://upload.wikimedia.org/wikipedia/commons/e/ef/2023_Volkswagen_Virtus_Topline_front_20230520.jpg"
    "honda-amaze.jpg"        = "https://upload.wikimedia.org/wikipedia/commons/c/cd/Honda_Amaze_front_view.jpg"
    "bmw-x1.jpg"             = "https://upload.wikimedia.org/wikipedia/commons/4/4c/2018_BMW_X1_sDrive18i_xLine_1.5_Front.jpg"
    "mercedes-c-class.jpg"   = "https://upload.wikimedia.org/wikipedia/commons/a/a6/Mercedes-Benz_C-Class_All-Terrain_IMG_0290.jpg"
    "toyota-camry.jpg"       = "https://upload.wikimedia.org/wikipedia/commons/6/6f/2018_GAC-Toyota_Camry_%28front%29.jpg"
    "audi-a6.jpg"            = "https://upload.wikimedia.org/wikipedia/commons/e/eb/Audi_A6_C9_IAA_2025_DSC_1920.jpg"
    "volvo-xc90.jpg"         = "https://upload.wikimedia.org/wikipedia/commons/6/68/2025_Volvo_XC90_II_autoMOBIL_T%C3%BCbingen_2025_DSC_2767.jpg"
    "tesla-model3.jpg"       = "https://upload.wikimedia.org/wikipedia/commons/8/86/Tesla_Model_3_%282023%29_IMG_9488_%28cropped%29.jpg"
    "tata-nexon-ev.jpg"      = "https://upload.wikimedia.org/wikipedia/commons/e/ea/2020_Tata_Nexon_EV_%28India%29_front_view.png"
    "hyundai-ioniq5.jpg"     = "https://upload.wikimedia.org/wikipedia/commons/c/c1/Hyundai_Ioniq_5_IAA_2021_1X7A0189.jpg"
    "kia-ev6.jpg"            = "https://upload.wikimedia.org/wikipedia/commons/1/1b/Kia_EV6_GT_IMG_8180.jpg"
    "placeholder-car.jpg"    = "https://upload.wikimedia.org/wikipedia/commons/8/86/Tesla_Model_3_%282023%29_IMG_9488_%28cropped%29.jpg"
}

$successCount = 0
$failCount    = 0

# Wikimedia requires a descriptive User-Agent
$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Referer"    = "https://commons.wikimedia.org/"
    "Accept"     = "image/webp,image/apng,image/*,*/*;q=0.8"
}

foreach ($entry in $carImages.GetEnumerator()) {
    $filename = $entry.Key
    $url      = $entry.Value
    $destPath = Join-Path $outputDir $filename

    Write-Host "[$filename]" -ForegroundColor Cyan -NoNewline
    Write-Host " Downloading..." -NoNewline

    try {
        # Add a short delay between requests to avoid rate-limiting
        Start-Sleep -Milliseconds 800

        $webClient = New-Object System.Net.WebClient
        foreach ($h in $headers.GetEnumerator()) {
            $webClient.Headers.Add($h.Key, $h.Value)
        }
        $webClient.DownloadFile($url, (Resolve-Path $outputDir).Path + "\" + $filename)

        if (Test-Path $destPath) {
            $sizeMB = [math]::Round((Get-Item $destPath).Length / 1KB, 1)
            Write-Host " OK (${sizeMB} KB)" -ForegroundColor Green
            $successCount++
        } else {
            throw "File not created"
        }
    }
    catch {
        Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Download Summary" -ForegroundColor Cyan
Write-Host "  Success : $successCount" -ForegroundColor Green
Write-Host "  Failed  : $failCount" -ForegroundColor $(if ($failCount -gt 0) { 'Red' } else { 'Green' })
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Images saved to: $((Resolve-Path $outputDir).Path)" -ForegroundColor White

# List what was downloaded
Write-Host ""
Write-Host "Downloaded files:" -ForegroundColor Yellow
Get-ChildItem $outputDir | ForEach-Object {
    Write-Host "  $($_.Name)  ($([math]::Round($_.Length/1KB,1)) KB)" -ForegroundColor Gray
}

$outputDir = "..\frontend\public\images\cars"

if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

$carImages = [ordered]@{
    "kia-seltos.jpg"       = "https://upload.wikimedia.org/wikipedia/commons/0/06/Kia_Seltos_IMG_9152.jpg"
    "skoda-kushaq.jpg"     = "https://upload.wikimedia.org/wikipedia/commons/e/e7/Skoda_Kushaq_Front.jpg"
    "mg-hector.jpg"        = "https://upload.wikimedia.org/wikipedia/commons/c/c4/MG_Hector_Diesel_%28India%29_front_view.png"
    "honda-city.jpg"       = "https://upload.wikimedia.org/wikipedia/commons/d/dd/Honda_City_2020.jpg"
    "maruti-swift.jpg"     = "https://upload.wikimedia.org/wikipedia/commons/4/43/Maruti_Suzuki_Swift_4456.JPG"
    "honda-amaze.jpg"      = "https://upload.wikimedia.org/wikipedia/commons/c/cd/Honda_Amaze_front_view.jpg"
    "bmw-x1.jpg"           = "https://upload.wikimedia.org/wikipedia/commons/4/4c/2018_BMW_X1_sDrive18i_xLine_1.5_Front.jpg"
    "mercedes-c-class.jpg" = "https://upload.wikimedia.org/wikipedia/commons/a/a6/Mercedes-Benz_C-Class_All-Terrain_IMG_0290.jpg"
    "toyota-camry.jpg"     = "https://upload.wikimedia.org/wikipedia/commons/6/6f/2018_GAC-Toyota_Camry_%28front%29.jpg"
    "audi-a6.jpg"          = "https://upload.wikimedia.org/wikipedia/commons/e/eb/Audi_A6_C9_IAA_2025_DSC_1920.jpg"
    "volvo-xc90.jpg"       = "https://upload.wikimedia.org/wikipedia/commons/6/68/2025_Volvo_XC90_II_autoMOBIL_T%C3%BCbingen_2025_DSC_2767.jpg"
    "tesla-model3.jpg"     = "https://upload.wikimedia.org/wikipedia/commons/8/86/Tesla_Model_3_%282023%29_IMG_9488_%28cropped%29.jpg"
    "tata-nexon-ev.jpg"    = "https://upload.wikimedia.org/wikipedia/commons/e/ea/2020_Tata_Nexon_EV_%28India%29_front_view.png"
    "hyundai-ioniq5.jpg"   = "https://upload.wikimedia.org/wikipedia/commons/c/c1/Hyundai_Ioniq_5_IAA_2021_1X7A0189.jpg"
    "kia-ev6.jpg"          = "https://upload.wikimedia.org/wikipedia/commons/1/1b/Kia_EV6_GT_IMG_8180.jpg"
    "placeholder-car.jpg"  = "https://upload.wikimedia.org/wikipedia/commons/8/86/Tesla_Model_3_%282023%29_IMG_9488_%28cropped%29.jpg"
}

$ua = "Mozilla/5.0 Windows NT 10.0"
$ok = 0
$fail = 0

$absDir = (Resolve-Path $outputDir).Path

foreach ($entry in $carImages.GetEnumerator()) {
    $fn   = $entry.Key
    $url  = $entry.Value
    $dest = Join-Path $absDir $fn

    if (Test-Path $dest) {
        $kb = [math]::Round((Get-Item $dest).Length / 1KB, 0)
        Write-Host "SKIP $fn ($kb KB)" -ForegroundColor DarkGray
        $ok++
        continue
    }

    Write-Host "GET  $fn ..." -NoNewline
    Start-Sleep -Seconds 6

    try {
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", $ua)
        $wc.Headers.Add("Referer", "https://commons.wikimedia.org/")
        $wc.DownloadFile($url, $dest)

        if ((Test-Path $dest) -and (Get-Item $dest).Length -gt 5000) {
            $kb = [math]::Round((Get-Item $dest).Length / 1KB, 0)
            Write-Host " OK ${kb}KB" -ForegroundColor Green
            $ok++
        } else {
            Write-Host " FAILED (tiny/empty file)" -ForegroundColor Red
            if (Test-Path $dest) { Remove-Item $dest -Force }
            $fail++
        }
    } catch {
        $msg = $_.Exception.Message
        Write-Host " FAILED: $msg" -ForegroundColor Red
        if (Test-Path $dest) { Remove-Item $dest -Force }
        $fail++
    }
}

Write-Host ""
Write-Host "Done! OK=$ok  FAIL=$fail" -ForegroundColor Cyan
Write-Host "Files in $absDir :"
Get-ChildItem $absDir | ForEach-Object {
    $kb = [math]::Round($_.Length / 1KB, 0)
    Write-Host "  $($_.Name) ($kb KB)"
}

$assets = "c:\Users\Maithil\tsrow\assets"
$files = @("work1.gif", "work2.gif", "work3.gif", "work4.gif", "work5.gif")

foreach ($file in $files) {
    $inputPath = Join-Path $assets $file
    $outputPath = Join-Path $assets ($file.Replace(".gif", ".webm"))
    
    if (Test-Path $inputPath) {
        Write-Host "Converting $file to WebM..."
        ffmpeg -i $inputPath -c:v libvpx-vp9 -b:v 0 -crf 30 -an $outputPath -y
    } else {
        Write-Host "Warning: $file not found."
    }
}

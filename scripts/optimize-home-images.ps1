Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'frontend\public'

function Save-OptimizedJpeg {
  param(
    [string]$Source,
    [string]$Destination,
    [int]$MaxWidth,
    [long]$Quality
  )

  $sourcePath = Join-Path $public $Source
  $destinationPath = Join-Path $public $Destination
  $directory = Split-Path -Parent $destinationPath
  New-Item -ItemType Directory -Force -Path $directory | Out-Null

  $original = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $width = [Math]::Min($original.Width, $MaxWidth)
    $height = [Math]::Round($original.Height * $width / $original.Width)
    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($original, 0, 0, $width, $height)
      } finally {
        $graphics.Dispose()
      }

      $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
      $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
      try {
        $bitmap.Save($destinationPath, $encoder, $parameters)
      } finally {
        $parameters.Dispose()
      }
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $original.Dispose()
  }
}

$heroImages = @(
  @{ Name = 'campus'; Source = 'Creatives\5.png' },
  @{ Name = 'laptop'; Source = 'Creatives\4.png' },
  @{ Name = 'trekking'; Source = 'Creatives\3.png' },
  @{ Name = 'luggage'; Source = 'Creatives\1.png' },
  @{ Name = 'junior'; Source = 'Creatives\2.png' }
)

foreach ($image in $heroImages) {
  Save-OptimizedJpeg -Source $image.Source -Destination "optimized\hero\$($image.Name)-desktop.jpg" -MaxWidth 1600 -Quality 84
  Save-OptimizedJpeg -Source $image.Source -Destination "optimized\hero\$($image.Name)-mobile.jpg" -MaxWidth 768 -Quality 78
}

$editorialImages = @(
  @{ Name = 'new-arrival'; Source = 'Category\New Arrival.jpg' },
  @{ Name = 'backpack'; Source = 'New Arrival\Artboard 3 copy 3@2x.png' }
)

foreach ($image in $editorialImages) {
  Save-OptimizedJpeg -Source $image.Source -Destination "optimized\editorial\$($image.Name)-desktop.jpg" -MaxWidth 1100 -Quality 82
  Save-OptimizedJpeg -Source $image.Source -Destination "optimized\editorial\$($image.Name)-mobile.jpg" -MaxWidth 640 -Quality 76
}

$tabImages = @(
  @{ Name = 'college'; Source = 'New Arrival\Artboard 1@2x.png' },
  @{ Name = 'laptop'; Source = 'New Arrival\Artboard 3 copy 5@2x.png' },
  @{ Name = 'trekking'; Source = 'New Arrival\Artboard 3 copy 7@2x.png' },
  @{ Name = 'duffle'; Source = 'New Arrival\Artboard 3 copy 6@2x.png' }
)

foreach ($image in $tabImages) {
  Save-OptimizedJpeg -Source $image.Source -Destination "optimized\backpack-tabs\$($image.Name).jpg" -MaxWidth 640 -Quality 80
}

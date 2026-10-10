$ErrorActionPreference = 'Stop'
$assetRoot = Join-Path $PSScriptRoot '../public/reference'
New-Item -ItemType Directory -Force -Path $assetRoot | Out-Null
$fonts = @{
  'aeonik.woff2' = 'AeonikPro-VF-DJagqNti.woff2'
  'aeonik-mono.woff2' = 'AeonikMono-Regular-BJhjWe-O.woff2'
  'megazoid.woff2' = 'Megazoid-Regular-DP6yeqDh.woff2'
}
foreach ($font in $fonts.GetEnumerator()) {
  Invoke-WebRequest -UseBasicParsing -Uri "https://okaydev.co/dist/assets/$($font.Value)" -OutFile (Join-Path $assetRoot $font.Key)
  Write-Output "Downloaded $($font.Key)"
}
$page = (Invoke-WebRequest -UseBasicParsing -Uri 'https://okaydev.co/').Content
$seen = @{}
foreach ($tag in [regex]::Matches($page, '<img[^>]*>')) {
  $source = [regex]::Match($tag.Value, 'src="([^"]+)"').Groups[1].Value
  $source = [System.Net.WebUtility]::HtmlDecode($source)
  if ($source -notmatch '/home/((?:project-\d+|avatar-[a-z]+|work-\d+)\.webp)') { continue }
  $name = $Matches[1]
  if ($seen.ContainsKey($name)) { continue }
  $seen[$name] = $true
  Invoke-WebRequest -UseBasicParsing -Uri $source -OutFile (Join-Path $assetRoot $name)
  Write-Output "Downloaded $name"
}

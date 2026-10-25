param([string]$DshApp = "$env:LOCALAPPDATA\Programs\DSH NEXT")
$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'scripts\install.ps1'
if (Test-Path -LiteralPath $script) {
  & $script -DshApp $DshApp
} else {
  throw "未找到 scripts\install.ps1 安装脚本。"
}

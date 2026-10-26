param([string]$DshApp = "$env:LOCALAPPDATA\Programs\DSH NEXT")
$ErrorActionPreference = 'Stop'
$salonProject = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$salonExecutable = Join-Path $DshApp 'DSH NEXT.exe'
$salonPluginCli = Join-Path $DshApp 'resources\app.asar\lib\plugin-cli.js'
if (!(Test-Path -LiteralPath $salonExecutable)) { throw 'DSH NEXT was not found. Set -DshApp to its installation directory.' }
if (!(Test-Path -LiteralPath (Join-Path $salonProject 'lib\client.js'))) { throw 'Run npm install and npm run build first.' }
$salonOldElectron = $env:ELECTRON_RUN_AS_NODE
$salonOldHome = $env:DSH_HOME
try {
  $env:ELECTRON_RUN_AS_NODE = '1'
  if (!$env:DSH_HOME) { $env:DSH_HOME = Join-Path $env:USERPROFILE '.dsh' }
  $salonArguments = '"' + $salonPluginCli + '" desktop add "link:' + ($salonProject -replace '\\','/') + '"'
  $salonLogs = Join-Path $env:TEMP 'dsh-salon-install'
  New-Item -ItemType Directory -Path $salonLogs -Force | Out-Null
  $salonProcess = Start-Process -FilePath $salonExecutable -ArgumentList $salonArguments -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput (Join-Path $salonLogs 'stdout.log') -RedirectStandardError (Join-Path $salonLogs 'stderr.log')
  $salonRepaired = @{}
  for ($salonAttempt = 0; $salonProcess.ExitCode -ne 0 -and $salonAttempt -lt 12; $salonAttempt++) {
    $salonOutput = (Get-Content -LiteralPath (Join-Path $salonLogs 'stdout.log') -Raw) + (Get-Content -LiteralPath (Join-Path $salonLogs 'stderr.log') -Raw)
    if ($salonOutput -notmatch 'ERR_PNPM_FETCH_404' -or $salonOutput -notmatch '(?m)^\s*(?<package>(?:@[-a-zA-Z0-9_]+/)?[-a-zA-Z0-9_.]+) is not in the npm registry') { break }
    $salonLegacyName = $Matches['package']
    $salonProfilePackage = Get-Content -LiteralPath (Join-Path $env:DSH_HOME 'profiles\desktop\package.json') -Raw | ConvertFrom-Json
    if (!$salonProfilePackage.dependencies.PSObject.Properties[$salonLegacyName] -or $salonRepaired.ContainsKey($salonLegacyName)) { break }
    $salonInstalledSearch = Join-Path $env:DSH_HOME "profiles\desktop\node_modules\$salonLegacyName"
    if (Test-Path -LiteralPath $salonInstalledSearch) {
      # Preserve an unpublished local dependency rather than asking pnpm to
      # fetch a nonexistent package. Existing code and credentials stay intact.
      $salonPreservedParent = Join-Path $env:DSH_HOME 'plugins\salon-preserved'
      $salonPreservedSearch = Join-Path $salonPreservedParent $salonLegacyName
      New-Item -ItemType Directory -Path $salonPreservedParent -Force | Out-Null
      if (!(Test-Path -LiteralPath $salonPreservedSearch)) { Copy-Item -LiteralPath $salonInstalledSearch -Destination $salonPreservedSearch -Recurse }
      if (!(Test-Path -LiteralPath (Join-Path $salonPreservedSearch 'package.json'))) { throw 'Preserving the existing local search plugin failed.' }
      $salonArguments += ' "' + $salonLegacyName + '@link:' + ($salonPreservedSearch -replace '\\','/') + '"'
      $salonRepaired[$salonLegacyName] = $true
      Write-Host "Preserved existing unpublished local dependency: $salonLegacyName"
      $salonProcess = Start-Process -FilePath $salonExecutable -ArgumentList $salonArguments -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput (Join-Path $salonLogs 'stdout.log') -RedirectStandardError (Join-Path $salonLogs 'stderr.log')
    } else { break }
  }
  if ($salonProcess.ExitCode -ne 0) { throw "DSH plugin installation failed with exit code $($salonProcess.ExitCode). Logs: $salonLogs" }
  Write-Host 'dsh-salon installed through the official DSH plugin manager. Reopen DSH to load the salon.'
} finally {
  $env:ELECTRON_RUN_AS_NODE = $salonOldElectron
  $env:DSH_HOME = $salonOldHome
}

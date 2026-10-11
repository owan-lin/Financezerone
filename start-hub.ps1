$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$hubUrl = 'http://127.0.0.1:4180'
function Test-Hub {
  try {
    $status = Invoke-RestMethod -Uri "$hubUrl/api/status" -TimeoutSec 4
    return $status.name -eq 'Owan Workspace'
  } catch { return $false }
}
if (Test-Hub) { Start-Process $hubUrl; exit 0 }
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $nodeCommand) { throw 'Node.js was not found. Please install Node.js or add it to PATH.' }
$logDirectory = Join-Path $workspaceRoot 'output\hub'
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
$process = Start-Process -FilePath $nodeCommand.Source -ArgumentList 'hub/server.cjs' -WorkingDirectory $workspaceRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'hub.log') -RedirectStandardError (Join-Path $logDirectory 'hub-error.log') -PassThru
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Milliseconds 250
  if (Test-Hub) { Start-Process $hubUrl; exit 0 }
  if ($process.HasExited) { break }
}
throw "Workspace failed to start. See $logDirectory\hub-error.log (port 4180 may be occupied)."

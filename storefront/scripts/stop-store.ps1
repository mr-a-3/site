$ErrorActionPreference = 'Stop'
$storeRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$toolingNode = [IO.Path]::GetFullPath((Join-Path $storeRoot '..\tooling\node.exe'))
$stopFile = Join-Path $storeRoot '.store-stopped'

# Persist the stop request before touching processes, so automatic startup cannot restart them.
[IO.File]::WriteAllText($stopFile, [DateTime]::UtcNow.ToString('o'))
function Get-StoreListeners {
    $lines = & "$env:SystemRoot\System32\netstat.exe" -ano -p tcp
    if ($LASTEXITCODE -ne 0) { throw 'Unable to check the store connections.' }
    foreach ($line in $lines) {
        $parts = $line.Trim() -split '\s+'
        if ($parts.Count -ge 5 -and $parts[0] -eq 'TCP' -and $parts[3] -eq 'LISTENING') {
            if (($parts[1] -split ':')[-1] -in '5173','5174','5175') { [int]$parts[-1] }
        }
    }
}
$processes = @(Get-CimInstance Win32_Process)
$byId = @{}
foreach ($item in $processes) { $byId[[int]$item.ProcessId] = $item }
$knownScript = 'scripts[/\\](auto-store|start-store|build-and-start|phone-preview|run-framework)\.mjs'
$roots = [Collections.Generic.HashSet[int]]::new()
foreach ($listenerId in @(Get-StoreListeners)) {
    $item = $byId[$listenerId]
    if ($item -and $item.Name -eq 'node.exe' -and $item.CommandLine -match $knownScript -and $item.ExecutablePath -eq $toolingNode) {
        [void]$roots.Add($listenerId)
        $parent = $byId[[int]$item.ParentProcessId]
        if ($parent -and $parent.Name -eq 'node.exe' -and $parent.ExecutablePath -eq $toolingNode -and $parent.CommandLine -match $knownScript) { [void]$roots.Add([int]$parent.ProcessId) }
    }
}
foreach ($item in $processes) {
    # Catch this store's supervisor even while it is starting, before its port is bound.
    if ($item.Name -eq 'node.exe' -and $item.CommandLine -match $knownScript -and $item.CommandLine.IndexOf($storeRoot, [StringComparison]::OrdinalIgnoreCase) -ge 0) { [void]$roots.Add([int]$item.ProcessId) }
}
$targets = [Collections.Generic.HashSet[int]]::new($roots)
do {
    $added = $false
    foreach ($item in $processes) {
        if ($targets.Contains([int]$item.ParentProcessId) -and $item.Name -in 'node.exe','workerd.exe') { if ($targets.Add([int]$item.ProcessId)) { $added = $true } }
    }
} while ($added)
# Stop supervisors first; children are restricted to the verified store process tree.
foreach ($targetId in @($roots | Sort-Object { if ($byId[$_].CommandLine -match 'auto-store\.mjs') { 0 } elseif ($byId[$_].CommandLine -match 'start-store\.mjs') { 1 } else { 2 } }) + @($targets | Where-Object { -not $roots.Contains($_) })) {
    $original = $byId[$targetId]
    $current = Get-CimInstance Win32_Process -Filter "ProcessId=$targetId" -ErrorAction SilentlyContinue
    if ($current -and $current.CreationDate -eq $original.CreationDate) { Stop-Process -Id $targetId -Force -ErrorAction SilentlyContinue }
}
foreach ($targetId in $targets) { Wait-Process -Id $targetId -Timeout 5 -ErrorAction SilentlyContinue }
foreach ($listenerId in @(Get-StoreListeners)) { if ($targets.Contains($listenerId)) { throw 'A store process is still running. Run Stop Store again.' } }
Write-Host 'Store stopped. The computer and phone previews are off.'
Write-Host 'Automatic startup will stay off until you run Start Store.'


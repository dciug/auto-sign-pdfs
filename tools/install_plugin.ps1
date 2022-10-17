# Plugin installer

# Copy crucial .js to the Adobe Acrobat install folder
$ACROBAT_INSTALL_DIR = "C:\Program Files (x86)\Adobe\Acrobat DC\Acrobat\Javascripts"
Copy-Item (Resolve-Path -Path "./sdkAddSignature.js") -Destination $ACROBAT_INSTALL_DIR

# Register executable in the Windows Registry.
$REG_BASE_PATH = "HKCU:\Software\Classes\directory\background\shell\"
$COMMAND_NAME = "Sign all PDFs in this directory"
$COMMAND_REG_PATH = -join($REG_BASE_PATH, $COMMAND_NAME)
$EXEC_PATH = Resolve-Path -Path "./SignPDF.exe"
Write-Output $COMMAND_NAME
Write-Output $COMMAND_REG_PATH
Write-Output $EXEC_PATH
New-Item -Path $REG_BASE_PATH -Name $COMMAND_NAME
New-Item -Path $COMMAND_REG_PATH -Name "command" -Value $EXEC_PATH
# Set the context menu icon
New-ItemProperty -Path $COMMAND_REG_PATH -Name "Icon" -PropertyType "String" -Value $EXEC_PATH
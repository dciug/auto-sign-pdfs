$PACKAGE_FOLDER = "../auto_sign_portable"
$PACKAGE_ZIP = "../auto_sign_portable.zip"
Remove-Item -Recurse $PACKAGE_FOLDER
Remove-Item $PACKAGE_ZIP
New-Item -ItemType "directory" -PATH $PACKAGE_FOLDER
Copy-Item "..\FillFormCS\bin\Debug\*" -Destination $PACKAGE_FOLDER
Copy-Item ".\sdkAddSignature.js" -Destination $PACKAGE_FOLDER

ps2exe -requireAdmin .\install_plugin.ps1
Copy-Item install_plugin.exe -Destination $PACKAGE_FOLDER

Compress-Archive -Path $PACKAGE_FOLDER -DestinationPath $PACKAGE_ZIP
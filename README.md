<h4 align="center">
    Auto-sign all PDFs in the working directory using Adobe Acrobat (not Reader!).
</h4>


## Behaviour
Scans all PDFs in the folder and applies your digital ID signature to all of them:
- If it finds a field labeled "Signature", applies it there
- If not, creates a new signature at the top-left corner of the document.


## Requirements
1. Add `sdkAddSignature.js` to the `Javascripts` folder from your Acrobat installation folder.
    - Example path: "C:\Program Files (x86)\Adobe\Acrobat DC\Acrobat\Javascripts"
2. Restart Adobe Acrobat.
3. There should now be a new command labeled "Add My Signature" under "Edit" › "Acrobat SDK JavaScript"
4. Add your `certificate.pfx` into the same directory as `SignPDF.exe`.


### Add executable to Explorer context menu
> **NOTE:** You can also refer to [this answer from StackOverflow](https://stackoverflow.com/questions/3681032/set-icon-for-custom-right-click-context-menu-item-for-all-desktop-shortcuts-win).
1. Open the Registry editor (regedit.msc).
2. Navigate to `Computer\HKEY_CLASSES_ROOT\directory\background\shell`.
3. Right click on 'shell' › 'New' › 'Key'.
4. Give it a name (e.g: 'Sign all PDFs from this directory'). This is how this command will appear in the Explorer context menu. You can change it later.
5. Right Click on this new item › 'New' › 'Key'.
    - Set it to 'command'.
7. Right click on '(Default)' and point it to the executable.


### Add icon to context menu item (Optional)
1. (Optional) Right click on item from step [4] above.
2. Right click › 'New' › 'String Value'.
    - Set it to 'Icon'.
3. Double click on it and point it to the Adobe Acrobat executable.

You should now see a new context menu command called 'Sign all PDFs from this directory' with the Adobe Acrobat icon.


### How to use
1. Open all PDFs from the working directory in Adobe Acrobat (important!).
2. Right click in Explorer.
3. Click on 'Sign all PDFs from this directory'.


## Development
### Generate a test certificate
1. Running `tools/gen_cert.ps1` in PowerShell generates a test certificate called "MY_TEST_CERTIFICATE.pfx"
    - The password is `password`.
2. Move this certificate in the same directory as `SignPDF.exe`.

### Generate the executable installer
1. Go to `tools` directory.
2. Run `ps2exe .\install.ps1` (assumming `ps2exe` is installed in PowerShell).

### Tested with:
- Windows 10 `19044.2006`
- Adobe Acrobat Standard DC (32 bit)
- Visual Studio Community 2022 with `.Net Framework 4.8`


### Resources:
- Adobe SDK starting page: https://opensource.adobe.com/dc-acrobat-sdk-docs/acrobatsdk/gettingstarted.html
- Download the Adobe Acrobat SDK from here: https://console.adobe.io/downloads#
    - Login › "Download resources" › "Downloads" tab › "Adobe Acrobat"

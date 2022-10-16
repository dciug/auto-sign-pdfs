# Auto-sign all PDFs in working directory using Adobe Acrobat


### Add Plugin to Explorer context menu (right click)
1. Go to the Registry editor (search for regedit)
2. Navigate to Computer\HKEY_CLASSES_ROOT\directory\background\shell
3. Right click on 'shell' -> 'New' -> 'Key'
4. Give it a name (e.g: 'Sign all PDFs from this directory')
5. Right Click on this new item -> 'New' -> 'Key'
6. Name it 'command'
7. Right click on '(Default)' and point it to the executable
8. (Optional) Right click on item from step [4]
9. Right click -> 'New' -> 'String Value'
10. Name it 'Icon'
11. Point it to the Adobe Acrobat executable

You should now see a new context menu command called 'Sign all PDFs from this directory' with the Adobe Acrobat icon.


### How to use
1. Open all PDFs from working directory in Adobe Acrobat
2. Right click on working directory in Explorer
3. Click on 'Sign all PDFs from this directory'

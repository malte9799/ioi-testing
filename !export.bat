@echo off
node !files.js
IF EXIST "ioi-testing.zip" (
  del "ioi-testing.zip"
)
"C:\Program Files\7-Zip\7z.exe" a -tzip ioi-testing.zip @!files.txt
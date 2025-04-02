@echo off
node !files.js
IF EXIST "trappedQOL.zip" (
  del "trappedQOL.zip"
)
"C:\Program Files\7-Zip\7z.exe" a -tzip trappedQOL.zip @!files.txt
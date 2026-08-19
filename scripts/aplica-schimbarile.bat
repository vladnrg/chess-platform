@echo off
setlocal
cd /d "%~dp0.."

echo.
echo ==========================================================
echo   CleanChess - trimite schimbarile in baza de date
echo ==========================================================
echo.
echo Pasul 1 din 2: trimit ce e nou.
echo.

call supabase db push --yes
if errorlevel 1 goto :eroare

echo.
echo Pasul 2 din 2: verific ce a ramas in baza de date.

call node scripts\verifica-baza.mjs
if errorlevel 1 goto :eroare

echo Poti inchide fereastra.
echo.
pause
exit /b 0

:eroare
echo.
echo ----------------------------------------------------------
echo   Ceva nu a mers. Fa o poza la fereastra asta si trimite-mi-o.
echo ----------------------------------------------------------
echo.
pause
exit /b 1

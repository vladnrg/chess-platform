@echo off
setlocal
cd /d "%~dp0.."

echo.
echo ==========================================================
echo   CleanChess - trimite schimbarile in baza de date
echo ==========================================================
echo.
echo Pasul 1 din 3: pun la zi evidenta schimbarilor deja facute.
echo (Nu modifica datele. Doar bifeaza ce a fost rulat de mana.)
echo.

call supabase migration repair --status applied 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035 036 037 038 039 040 041 042 043 044 045 046 047 048 049 050 051 052 053 054 055 056 057 058 059 060 061 062 063 064 065 066 067 068 069 070 071 072 073 074 075 076 077 078 079 080 081 082 083 084 085 086 087 088
if errorlevel 1 goto :eroare

echo.
echo Pasul 2 din 3: trimit schimbarile noi.
echo.

call supabase db push --yes
if errorlevel 1 goto :eroare

echo.
echo Pasul 3 din 3: verific ce a ramas in baza de date.

call node scripts\verifica-pionul.mjs
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

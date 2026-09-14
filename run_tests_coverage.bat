
@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: ============================================================
:: Pipeline local - Gestao de Atividades Complementares
:: Frontend + Backend + JaCoCo + OpenRewrite + SonarCloud
:: ============================================================

cd /d "%~dp0"

set "ROOT_DIR=%~dp0"
set "FRONT_DIR=%ROOT_DIR%frontend"
set "BACK_DIR=%ROOT_DIR%backend"

:: Configuracao
set "CI=true"
set "npm_config_yes=true"

if exist "%BACK_DIR%\mvnw.cmd" (
    set "MVN_CMD=%BACK_DIR%\mvnw.cmd"
) else (
    set "MVN_CMD=mvn"
)

:: ============================================================
:: MENU
:: ============================================================

:MENU

cls
echo ==================================================
echo  PIPELINE - GESTAO DE ATIVIDADES COMPLEMENTARES
echo ==================================================
echo.
echo  1^) Executar pipeline completo
echo  2^) Executar somente Frontend
echo  3^) Executar somente Backend
echo  4^) Sair
echo.

choice /c 1234 /n /m "Escolha uma opcao [1-4]: "

if errorlevel 4 goto :SAIR
if errorlevel 3 goto :BACKEND
if errorlevel 2 goto :FRONTEND
if errorlevel 1 goto :COMPLETO

:: ============================================================
:: FRONTEND
:: ============================================================

:FRONTEND

call :EXECUTAR_FRONTEND

if errorlevel 1 goto :ERRO

goto :SUCESSO

:EXECUTAR_FRONTEND

call :CABECALHO "[FRONTEND] FORMATACAO E LINT"

if not exist "%FRONT_DIR%" (
    echo ERRO: Diretorio frontend nao encontrado.
    exit /b 1
)

cd /d "%FRONT_DIR%"

call npm run fix-all
if errorlevel 1 exit /b 1

echo Frontend formatado e lintado.

call :CABECALHO "[FRONTEND] TESTES"

call npx ng test --watch=false <nul
if errorlevel 1 exit /b 1

echo Testes do Frontend concluidos.

call :CABECALHO "[FRONTEND] COBERTURA"

call npx ng test --configuration coverage --watch=false <nul
if errorlevel 1 exit /b 1

echo Cobertura do Frontend gerada.

set "LCOV_FILE="

for /r "%FRONT_DIR%\coverage" %%F in (lcov.info) do (
    if not defined LCOV_FILE set "LCOV_FILE=%%F"
)

if defined LCOV_FILE (
    echo Relatorio lcov.info encontrado:
    echo !LCOV_FILE!
) else (
    echo Aviso: lcov.info nao encontrado.
)

call :CABECALHO "[FRONTEND] SONARCLOUD"

if not defined SONAR_TOKEN (
    echo Aviso: SONAR_TOKEN nao esta definido.
    echo Analise do SonarCloud sera ignorada.
) else (

    if not defined LCOV_FILE (
        echo ERRO: lcov.info e obrigatorio para o SonarCloud.
        exit /b 1
    )

    call npx sonar-scanner ^
        -Dsonar.host.url=https://sonarcloud.io ^
        -Dsonar.organization=sgac-gestaoatividadecomplementarorg ^
        -Dsonar.projectKey=sgac-gestaoatividadecomplementarorg_gestaoatividadecomplementarorg-frontend ^
        -Dsonar.token="%SONAR_TOKEN%" ^
        -Dsonar.sources=src ^
        -Dsonar.tests=src ^
        -Dsonar.test.inclusions="**/*.spec.ts" ^
        -Dsonar.javascript.lcov.reportPaths="!LCOV_FILE!"

    if errorlevel 1 exit /b 1

    echo Analise do Frontend enviada com sucesso.
)

cd /d "%ROOT_DIR%"

echo.
echo Frontend concluido.
echo.
exit /b 0

:: ============================================================
:: BACKEND
:: ============================================================

:BACKEND

call :EXECUTAR_BACKEND

if errorlevel 1 goto :ERRO

goto :SUCESSO

:EXECUTAR_BACKEND

if not exist "%BACK_DIR%" (
    echo ERRO: Diretorio backend nao encontrado.
    exit /b 1
)

call :CABECALHO "[BACKEND] SPOTLESS"

cd /d "%BACK_DIR%"

call "%MVN_CMD%" spotless:apply
if errorlevel 1 exit /b 1

echo Spotless concluido.

call :CABECALHO "[BACKEND] OPENREWRITE"

call "%MVN_CMD%" rewrite:run
if errorlevel 1 exit /b 1

echo OpenRewrite concluido.

call :CABECALHO "[BACKEND] TESTES + JACOCO + VERIFY"

call "%MVN_CMD%" clean verify
if errorlevel 1 exit /b 1

echo Testes e cobertura concluidos.

set "JACOCO_FILE=%BACK_DIR%\target\site\jacoco\jacoco.xml"

if not exist "%JACOCO_FILE%" (
    echo ERRO: relatorio JaCoCo nao encontrado:
    echo %JACOCO_FILE%
    exit /b 1
)

echo Relatorio JaCoCo encontrado:
echo %JACOCO_FILE%

call :CABECALHO "[BACKEND] SONARCLOUD"

if not defined SONAR_TOKEN (
    echo Aviso: SONAR_TOKEN nao esta definido.
    echo Analise do SonarCloud sera ignorada.
) else (

    call "%MVN_CMD%" sonar:sonar ^
        -Dsonar.host.url=https://sonarcloud.io ^
        -Dsonar.organization=sgac-gestaoatividadecomplementarorg ^
        -Dsonar.projectKey=sgac-gestaoatividadecomplementarorg_gestaoatividadecomplementarorg ^
        -Dsonar.token="%SONAR_TOKEN%" ^
        -Dsonar.coverage.jacoco.xmlReportPaths="%JACOCO_FILE%"

    if errorlevel 1 exit /b 1

    echo Analise do Backend enviada com sucesso.
)

cd /d "%ROOT_DIR%"

echo.
echo Backend concluido.
echo.
exit /b 0

:: ============================================================
:: PIPELINE COMPLETO
:: ============================================================

:COMPLETO

call :CABECALHO "PIPELINE COMPLETO"

call :EXECUTAR_FRONTEND
if errorlevel 1 goto :ERRO

call :EXECUTAR_BACKEND
if errorlevel 1 goto :ERRO

goto :SUCESSO

:: ============================================================
:: FUNCOES AUXILIARES
:: ============================================================

:CABECALHO

echo.
echo ==================================================
echo  %~1
echo ==================================================
echo.
exit /b 0

:: ============================================================
:: RESULTADOS
:: ============================================================

:SUCESSO

cd /d "%ROOT_DIR%"

echo.
echo ==================================================
echo  SUCESSO
echo ==================================================
echo.
echo Pipeline concluido.
echo ==================================================
pause
exit /b 0

:ERRO

cd /d "%ROOT_DIR%"

echo.
echo ==================================================
echo  ERRO
echo ==================================================
echo.
echo O pipeline foi interrompido.
echo Verifique a mensagem de erro acima.
echo ==================================================
pause
exit /b 1

:SAIR

exit /b 0
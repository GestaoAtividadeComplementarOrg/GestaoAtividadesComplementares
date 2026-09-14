#!/usr/bin/env bash

# ============================================================
# Pipeline local - Gestão de Atividades Complementares
# Frontend + Backend + JaCoCo + OpenRewrite + SonarCloud
# ============================================================

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONT_DIR="$ROOT_DIR/frontend"
BACK_DIR="$ROOT_DIR/backend"

export CI=true
export npm_config_yes=true

# ------------------------------------------------------------
# Tratamento de erros
# ------------------------------------------------------------

trap 'echo ""
echo "=================================================="
echo " ERRO"
echo "=================================================="
echo "O pipeline foi interrompido."
echo "Comando: ${BASH_COMMAND}"
echo "Linha: ${LINENO}"
echo "=================================================="' ERR

# ------------------------------------------------------------
# Configuração
# ------------------------------------------------------------

if [ -x "$BACK_DIR/mvnw" ]; then
    MVN_CMD="$BACK_DIR/mvnw"
else
    MVN_CMD="mvn"
fi

# ------------------------------------------------------------
# Funções auxiliares
# ------------------------------------------------------------

cabecalho() {
    echo ""
    echo "=================================================="
    echo " $1"
    echo "=================================================="
}

verificar_diretorios() {
    if [ ! -d "$FRONT_DIR" ]; then
        echo "ERRO: Diretório frontend não encontrado."
        exit 1
    fi

    if [ ! -d "$BACK_DIR" ]; then
        echo "ERRO: Diretório backend não encontrado."
        exit 1
    fi
}

# ============================================================
# FRONTEND
# ============================================================

executar_frontend() {

    verificar_diretorios

    cabecalho "[FRONTEND] Formatação e lint"

    cd "$FRONT_DIR"
    npm run fix-all

    echo "Frontend formatado e lintado."

    cabecalho "[FRONTEND] Testes"

    npx ng test --watch=false < /dev/null

    echo "Testes do Frontend concluídos."

    cabecalho "[FRONTEND] Cobertura"

    npx ng test --configuration coverage --watch=false < /dev/null

    echo "Cobertura do Frontend gerada."

    LCOV_FILE="$(
        find "$FRONT_DIR/coverage" \
            -type f \
            -name "lcov.info" \
            2>/dev/null | head -n 1 || true
    )"

    if [ -n "$LCOV_FILE" ] && [ -f "$LCOV_FILE" ]; then
        echo "Relatório lcov.info encontrado:"
        echo "$LCOV_FILE"
    else
        echo "Aviso: lcov.info não encontrado."
    fi

    cabecalho "[FRONTEND] SonarCloud"

    if [ -z "${SONAR_TOKEN:-}" ]; then
        echo "Aviso: SONAR_TOKEN não está definido."
        echo "Análise do SonarCloud será ignorada."
    else

        if [ -z "$LCOV_FILE" ] || [ ! -f "$LCOV_FILE" ]; then
            echo "ERRO: lcov.info é obrigatório para o SonarCloud."
            exit 1
        fi

        npx sonar-scanner \
            -Dsonar.host.url=https://sonarcloud.io \
            -Dsonar.organization=sgac-gestaoatividadecomplementarorg \
            -Dsonar.projectKey=sgac-gestaoatividadecomplementarorg_gestaoatividadecomplementarorg-frontend \
            -Dsonar.token="$SONAR_TOKEN" \
            -Dsonar.sources=src \
            -Dsonar.tests=src \
            -Dsonar.test.inclusions="**/*.spec.ts" \
            -Dsonar.javascript.lcov.reportPaths="$LCOV_FILE"

        echo "Análise do Frontend enviada com sucesso."
    fi

    cd "$ROOT_DIR"

    cabecalho "FRONTEND CONCLUÍDO"

    echo "✓ Formatação"
    echo "✓ ESLint"
    echo "✓ Testes"
    echo "✓ Cobertura"
    echo "✓ SonarCloud (se configurado)"
}

# ============================================================
# BACKEND
# ============================================================

executar_backend() {

    verificar_diretorios

    cabecalho "[BACKEND] Spotless"

    cd "$BACK_DIR"

    "$MVN_CMD" spotless:apply

    echo "Spotless concluído."

    cabecalho "[BACKEND] OpenRewrite"

    "$MVN_CMD" rewrite:run

    echo "OpenRewrite concluído."

    cabecalho "[BACKEND] Testes + JaCoCo + Verify"

    "$MVN_CMD" clean verify

    echo "Testes e cobertura concluídos."

    JACOCO_FILE="$BACK_DIR/target/site/jacoco/jacoco.xml"

    if [ ! -f "$JACOCO_FILE" ]; then
        echo "ERRO: relatório JaCoCo não encontrado:"
        echo "$JACOCO_FILE"
        exit 1
    fi

    echo "Relatório JaCoCo encontrado:"
    echo "$JACOCO_FILE"

    cabecalho "[BACKEND] SonarCloud"

    if [ -z "${SONAR_TOKEN:-}" ]; then
        echo "Aviso: SONAR_TOKEN não está definido."
        echo "Análise do SonarCloud será ignorada."
    else

        "$MVN_CMD" sonar:sonar \
            -Dsonar.host.url=https://sonarcloud.io \
            -Dsonar.organization=sgac-gestaoatividadecomplementarorg \
            -Dsonar.projectKey=sgac-gestaoatividadecomplementarorg_gestaoatividadecomplementarorg \
            -Dsonar.token="$SONAR_TOKEN" \
            -Dsonar.coverage.jacoco.xmlReportPaths="$JACOCO_FILE"

        echo "Análise do Backend enviada com sucesso."
    fi

    cd "$ROOT_DIR"

    cabecalho "BACKEND CONCLUÍDO"

    echo "✓ Spotless"
    echo "✓ OpenRewrite"
    echo "✓ Testes"
    echo "✓ JaCoCo"
    echo "✓ Maven Verify"
    echo "✓ SonarCloud (se configurado)"
}

# ============================================================
# PIPELINE COMPLETO
# ============================================================

executar_completo() {

    cabecalho "PIPELINE COMPLETO"

    executar_frontend
    executar_backend

    cabecalho "PIPELINE COMPLETO CONCLUÍDO"

    echo "✓ Frontend"
    echo "✓ Backend"
    echo "✓ Cobertura"
    echo "✓ SonarCloud (se configurado)"
}

# ============================================================
# MENU
# ============================================================

while true; do

    echo ""
    echo "=================================================="
    echo " PIPELINE - GESTÃO DE ATIVIDADES COMPLEMENTARES"
    echo "=================================================="
    echo ""
    echo "1) Executar pipeline completo"
    echo "2) Executar somente Frontend"
    echo "3) Executar somente Backend"
    echo "4) Sair"
    echo ""

    read -rp "Escolha uma opção [1-4]: " OPCAO

    case "$OPCAO" in

        1)
            executar_completo
            break
            ;;

        2)
            executar_frontend
            break
            ;;

        3)
            executar_backend
            break
            ;;

        4)
            echo "Saindo."
            exit 0
            ;;

        *)
            echo "Opção inválida. Escolha 1, 2, 3 ou 4."
            ;;

    esac

done

echo ""
echo "=================================================="
echo " SUCESSO"
echo "=================================================="
echo "Pipeline concluído."
echo "=================================================="
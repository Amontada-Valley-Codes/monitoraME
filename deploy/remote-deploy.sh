#!/usr/bin/env bash
# Instala e inicia a versão standalone do frontend Next.js já extraída no release dir.
set -euo pipefail

DEPLOY_PATH="${1:?Uso: remote-deploy.sh <deploy-path>}"
RELEASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_USER="$(id -un)"
WEB_SOURCE="$RELEASE_DIR/web"
UNIT_TEMPLATE="$RELEASE_DIR/deploy/systemd/monitorame-web.service.template"
WEB_TARGET="$DEPLOY_PATH/web"
WEB_PREVIOUS="$DEPLOY_PATH/web.previous"
UNIT_PATH="/etc/systemd/system/monitorame-web.service"

if [[ ! -f "$WEB_SOURCE/server.js" ]]; then
  echo "Release inválido: não encontrei $WEB_SOURCE/server.js" >&2
  exit 1
fi

if [[ ! -f "$UNIT_TEMPLATE" ]]; then
  echo "Release inválido: não encontrei o template $UNIT_TEMPLATE" >&2
  exit 1
fi

mkdir -p "$DEPLOY_PATH"
rm -rf "$WEB_PREVIOUS"
if [[ -d "$WEB_TARGET" ]]; then
  mv "$WEB_TARGET" "$WEB_PREVIOUS"
fi
mv "$WEB_SOURCE" "$WEB_TARGET"

rollback() {
  echo "O frontend não iniciou; restaurando a versão anterior." >&2
  sudo systemctl stop monitorame-web >/dev/null 2>&1 || true
  rm -rf "$WEB_TARGET"
  if [[ -d "$WEB_PREVIOUS" ]]; then
    mv "$WEB_PREVIOUS" "$WEB_TARGET"
    sudo systemctl restart monitorame-web || true
  fi
}

if ! sed -e "s#__APP_DIR__#$DEPLOY_PATH#g" -e "s#__APP_USER__#$APP_USER#g" \
  "$UNIT_TEMPLATE" | sudo tee "$UNIT_PATH" >/dev/null; then
  rollback
  exit 1
fi

if ! sudo systemctl daemon-reload \
  || ! sudo systemctl enable monitorame-web \
  || ! sudo systemctl restart monitorame-web; then
  rollback
  exit 1
fi

for attempt in 1 2 3 4 5 6; do
  if sudo systemctl is-active --quiet monitorame-web \
    && curl --fail --silent --show-error http://127.0.0.1:3000/ --output /dev/null; then
    echo "Frontend Next.js ativo em http://127.0.0.1:3000"
    exit 0
  fi
  echo "Aguardando o frontend iniciar ($attempt/6)..."
  sleep 5
done

rollback
exit 1

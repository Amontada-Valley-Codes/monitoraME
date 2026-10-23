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
NGINX_SOURCE="$RELEASE_DIR/deploy/nginx/monitorame-apps.conf"
NGINX_SITE="/etc/nginx/sites-available/default"
NGINX_BACKUP="${NGINX_SITE}.monitorame-backup"
NGINX_UPDATED=0

if [[ ! -f "$WEB_SOURCE/server.js" ]]; then
  echo "Release inválido: não encontrei $WEB_SOURCE/server.js" >&2
  exit 1
fi

if [[ ! -f "$UNIT_TEMPLATE" ]]; then
  echo "Release inválido: não encontrei o template $UNIT_TEMPLATE" >&2
  exit 1
fi

if [[ ! -f "$NGINX_SOURCE" ]]; then
  echo "Release inválido: não encontrei $NGINX_SOURCE" >&2
  exit 1
fi

if [[ ! -f "$NGINX_SITE" ]]; then
  echo "Configuração nginx esperada não existe: $NGINX_SITE" >&2
  exit 1
fi

# Só prossegue se o arquivo default contém o vhost que será atualizado.
if ! grep -qE '^[[:space:]]*server_name[[:space:]].*monitorame\.amontadavalley\.com\.br([[:space:];]|$)' "$NGINX_SITE"; then
  echo "Não encontrei o server_name do MonitoraME em $NGINX_SITE; nginx não foi alterado." >&2
  exit 1
fi

install_nginx_vhost() {
  local temp_file
  temp_file="$(mktemp)"
  if ! python3 - "$NGINX_SITE" "$NGINX_SOURCE" "$temp_file" <<'PY'
import re
import sys
from pathlib import Path

site_path, source_path, output_path = map(Path, sys.argv[1:])
site = site_path.read_text()
source = source_path.read_text()
server_start = re.compile(r"(?m)^\s*server\s*\{")
domain = "monitorame.amontadavalley.com.br"

def blocks(text):
    found = []
    for match in server_start.finditer(text):
        depth = 0
        for index in range(match.start(), len(text)):
            if text[index] == "{":
                depth += 1
            elif text[index] == "}":
                depth -= 1
                if depth == 0:
                    found.append((match.start(), index + 1, text[match.start():index + 1]))
                    break
        else:
            raise SystemExit("server block sem fechamento encontrado")
    return found

matches = [b for b in blocks(site) if re.search(r"(?m)^\s*server_name\s+[^;]*\b" + re.escape(domain) + r"\b[^;]*;", b[2])]
source_matches = [b for b in blocks(source) if re.search(r"(?m)^\s*server_name\s+[^;]*\b" + re.escape(domain) + r"\b[^;]*;", b[2])]
if len(matches) != 1:
    raise SystemExit(f"esperava exatamente um server block do MonitoraME no nginx ativo; encontrei {len(matches)}")
if len(source_matches) != 1:
    raise SystemExit(f"esperava exatamente um server block do MonitoraME no arquivo versionado; encontrei {len(source_matches)}")
start, end, active_block = matches[0]
source_block = source_matches[0][2]

def direct_children(block):
    opening = block.index("{")
    depth = 1
    line_start = opening + 1
    children = []
    for index in range(opening + 1, len(block)):
        char = block[index]
        if char == "{" :
            if depth == 1:
                line_start = block.rfind("\n", 0, index) + 1
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 1:
                children.append((line_start, index + 1, block[line_start:index + 1]))
                line_start = index + 1
    return children

source_locations = [child for child in direct_children(source_block) if re.match(r"\s*location\s+/\s*\{", child[2])]
active_locations = [child for child in direct_children(active_block) if re.match(r"\s*location\s+/\s*\{", child[2])]
if len(source_locations) != 1 or len(active_locations) != 1:
    raise SystemExit("esperava exatamente um location / no bloco ativo e no versionado")

replacement = source_locations[0][2]
loc_start, loc_end, _ = active_locations[0]
updated_block = active_block[:loc_start] + replacement + active_block[loc_end:]
updated_block = re.sub(r"(?m)^\s*root\s+[^;]+;\s*\n", "", updated_block, count=1)
updated_block = re.sub(r"(?m)^\s*index\s+[^;]+;\s*\n", "", updated_block, count=1)
output_path.write_text(site[:start] + updated_block + site[end:])
PY
  then
    rm -f "$temp_file"
    echo "Não consegui substituir com segurança apenas o server block do MonitoraME." >&2
    return 1
  fi
  sudo cp -a "$NGINX_SITE" "$NGINX_BACKUP"
  sudo install -o root -g root -m 0644 "$temp_file" "$NGINX_SITE"
  rm -f "$temp_file"
  NGINX_UPDATED=1
}

rollback_nginx() {
  if [[ "$NGINX_UPDATED" == 1 && -f "$NGINX_BACKUP" ]]; then
    sudo install -o root -g root -m 0644 "$NGINX_BACKUP" "$NGINX_SITE"
    sudo nginx -t && sudo systemctl reload nginx || true
    NGINX_UPDATED=0
  fi
}

mkdir -p "$DEPLOY_PATH"
rm -rf "$WEB_PREVIOUS"
if [[ -d "$WEB_TARGET" ]]; then
  mv "$WEB_TARGET" "$WEB_PREVIOUS"
fi
mv "$WEB_SOURCE" "$WEB_TARGET"

rollback() {
  echo "O frontend não iniciou; restaurando a versão anterior." >&2
  rollback_nginx
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
    break
  fi
  echo "Aguardando o frontend iniciar ($attempt/6)..."
  sleep 5
done

if ! sudo systemctl is-active --quiet monitorame-web \
  || ! curl --fail --silent --show-error http://127.0.0.1:3000/ --output /dev/null; then
  rollback
  exit 1
fi

if ! install_nginx_vhost; then
  rollback
  exit 1
fi

if ! sudo nginx -t; then
  rollback_nginx
  rollback
  exit 1
fi

if [[ "$NGINX_UPDATED" == 1 ]] && ! sudo systemctl reload nginx; then
  rollback_nginx
  rollback
  exit 1
fi

if ! curl --fail --silent --show-error -H 'Host: monitorame.amontadavalley.com.br' \
  http://127.0.0.1/ --output /dev/null; then
  rollback_nginx
  rollback
  echo "Nginx não encaminhou o host MonitoraME ao frontend após o reload." >&2
  exit 1
fi

echo "Frontend Next.js ativo e nginx encaminhando monitorame.amontadavalley.com.br."

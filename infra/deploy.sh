#!/bin/bash
##
## deploy.sh — Build e deploy do frontend React no EC2
##
## Executar na máquina LOCAL após um push no GitHub:
##   chmod +x infra/deploy.sh
##   EC2_HOST=ubuntu@<IP_DO_EC2> ./infra/deploy.sh
##
## O build acontece LOCALMENTE (usa .env.production).
## Só o /dist resultante é enviado para o EC2 via rsync.
##

set -e

EC2_HOST="${EC2_HOST:-ubuntu@SEU_IP_EC2_AQUI}"
REMOTE_DIR="/var/www/empregabilidade-web/dist"

echo "==> Build do frontend com .env.production..."
npm run build

echo "==> Enviando /dist para ${EC2_HOST}:${REMOTE_DIR}..."
rsync -az --delete dist/ "${EC2_HOST}:${REMOTE_DIR}/"

echo "==> Recarregando Nginx..."
ssh "${EC2_HOST}" "sudo nginx -s reload"

echo "✔ Frontend publicado."

#!/bin/sh
<<<<<<< HEAD
echo "Available files in /app:"
ls -l /app

if [ -f /app/.env.dev ]; then
    echo "Loading .env.dev"
    export $(grep -v '^#' /app/.env.dev | xargs)
else
    echo "Error: .env.dev file not found!"
    exit 1
fi
=======


if [ "$NODE_ENV" = "production" ]; then
  ENV_FILE="/app/.env.production"
elif [ "$NODE_ENV" = "development" ]; then
  if [ -f "/app/.env.development.local" ]; then
    ENV_FILE="/app/.env.development.local"
  else
    ENV_FILE="/app/.env.development"
  fi
elif [ "$NODE_ENV" = "test" ]; then
  ENV_FILE="/app/.env.test"
else
  echo "Ambiente não reconhecido. Usando o arquivo padrão."

fi

echo "Carregando variáveis de ambiente do arquivo: $ENV_FILE"

# Exportar as variáveis do arquivo escolhido
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Executar o comando original
>>>>>>> branch-com-commit
exec "$@"

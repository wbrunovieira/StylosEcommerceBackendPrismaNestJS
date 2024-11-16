#!/bin/sh
echo "Available files in /app:"
ls -l /app

if [ -f /app/.env.dev ]; then
    echo "Loading .env.dev"
    export $(grep -v '^#' /app/.env.dev | xargs)
else
    echo "Error: .env.dev file not found!"
    exit 1
fi
exec "$@"

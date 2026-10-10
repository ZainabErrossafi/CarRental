#!/bin/sh
set -eu

cert_dir="${1:-nginx/certs}"
mkdir -p "$cert_dir"

if [ -s "$cert_dir/privkey.pem" ] && [ -s "$cert_dir/fullchain.pem" ]; then
    echo "Existing TLS certificate and key preserved."
    exit 0
fi
if [ -e "$cert_dir/privkey.pem" ] || [ -e "$cert_dir/fullchain.pem" ]; then
    echo "Incomplete certificate pair in $cert_dir; supply both files before continuing." >&2
    exit 1
fi

umask 077
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$cert_dir/privkey.pem" \
    -out "$cert_dir/fullchain.pem" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1"
echo "Local development TLS certificate created in $cert_dir."

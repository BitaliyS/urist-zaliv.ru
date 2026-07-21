#!/bin/sh
set -eu
# Volume ./data может быть root на хосте — поправим перед стартом от app
mkdir -p /app/data
chown -R app:app /app/data
exec su-exec app node build

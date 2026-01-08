#!/bin/sh
set -e

# Ensure required directories exist with correct ownership
# This runs as root before dropping to adonisjs user
mkdir -p /app/storage/uploads /app/tmp
chown -R adonisjs:nodejs /app/storage /app/tmp

# Drop privileges and execute the main command as adonisjs
exec su-exec adonisjs "$@"

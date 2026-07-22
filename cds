#!/usr/bin/env bash
# Wrapper script to ensure local @sap/cds-dk is used

exec "$(dirname "$0")/node_modules/.bin/cds" "$@"

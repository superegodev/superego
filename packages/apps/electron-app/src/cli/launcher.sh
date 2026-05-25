#!/usr/bin/env sh
set -eu

source_path=$0

while [ -L "$source_path" ]; do
  source_dir=$(CDPATH= cd -P -- "$(dirname -- "$source_path")" >/dev/null 2>&1 && pwd)
  linked_path=$(readlink "$source_path")
  case "$linked_path" in
    /*) source_path=$linked_path ;;
    *) source_path=$source_dir/$linked_path ;;
  esac
done

source_dir=$(CDPATH= cd -P -- "$(dirname -- "$source_path")" >/dev/null 2>&1 && pwd)

if [ -x "$source_dir/../MacOS/superego-app" ]; then
  exec "$source_dir/../MacOS/superego-app" --cli "$@"
fi

if [ -n "${APPDIR:-}" ] && [ -x "$APPDIR/superego-app" ]; then
  exec "$APPDIR/superego-app" --cli "$@"
fi

if [ -x "$source_dir/../superego-app" ]; then
  exec "$source_dir/../superego-app" --cli "$@"
fi

exec superego-app --cli "$@"

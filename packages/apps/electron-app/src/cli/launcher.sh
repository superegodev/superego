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

run_cli() {
  command_path=$1
  shift
  stderr_file=$(mktemp)
  set +e
  "$command_path" --cli "$@" 2>"$stderr_file"
  status=$?
  set -e
  awk '
    /MachPortRendezvousServer/ { next }
    /No rendezvous client, terminating process \(parent died\?\)/ { next }
    { print > "/dev/stderr" }
  ' "$stderr_file"
  rm -f "$stderr_file"
  exit "$status"
}

if [ -x "$source_dir/../MacOS/superego-app" ]; then
  run_cli "$source_dir/../MacOS/superego-app" "$@"
fi

if [ -n "${APPDIR:-}" ] && [ -x "$APPDIR/superego-app" ]; then
  run_cli "$APPDIR/superego-app" "$@"
fi

if [ -x "$source_dir/../superego-app" ]; then
  run_cli "$source_dir/../superego-app" "$@"
fi

run_cli superego-app "$@"

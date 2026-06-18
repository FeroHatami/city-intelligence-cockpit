#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CONTINUE_ON_ERROR=0
DRY_RUN=0
LOG_FILE="logs/dataset-refresh.log"

usage() {
  cat <<'USAGE'
Usage: bash scripts/refresh-all-datasets.sh [--dry-run] [--continue]

Refresh local City Intelligence datasets with existing local/free scripts.

Options:
  --dry-run    Print the steps without running fetches.
  --continue   Continue after a step fails; otherwise stop on the first error.
  --help       Show this help.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      ;;
    --continue)
      CONTINUE_ON_ERROR=1
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

mkdir -p "$(dirname "$LOG_FILE")"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  printf '[%s] %s\n' "$(timestamp)" "$*" | tee -a "$LOG_FILE"
}

run_python_step() {
  local script="$1"
  local required="${2:-required}"

  if [[ ! -f "$script" ]]; then
    if [[ "$required" == "optional" ]]; then
      log "SKIP optional missing script: $script"
      return 0
    fi
    log "FAIL missing required script: $script"
    return 1
  fi

  log "RUN python3 $script"
  if [[ "$DRY_RUN" == "1" ]]; then
    return 0
  fi

  if python3 "$script" >>"$LOG_FILE" 2>&1; then
    log "PASS $script"
    return 0
  fi

  log "FAIL $script"
  if [[ "$CONTINUE_ON_ERROR" == "1" ]]; then
    return 0
  fi
  return 1
}

run_shell_step() {
  local script="$1"
  log "RUN bash $script"
  if [[ "$DRY_RUN" == "1" ]]; then
    return 0
  fi

  if bash "$script" >>"$LOG_FILE" 2>&1; then
    log "PASS $script"
    return 0
  fi

  log "FAIL $script"
  if [[ "$CONTINUE_ON_ERROR" == "1" ]]; then
    return 0
  fi
  return 1
}

log "Starting City Intelligence dataset refresh"
if [[ "$DRY_RUN" == "1" ]]; then
  log "Dry run only; no dataset files will be changed"
fi

run_python_step "scripts/fetch-munich-pharmacies.py"
run_python_step "scripts/fetch-munich-offices.py"
run_python_step "scripts/fetch-munich-clinics.py"
run_python_step "scripts/fetch-munich-coworking.py"
run_python_step "scripts/fetch-munich-restaurants.py"
run_python_step "scripts/split-munich-offices.py"
run_python_step "scripts/add-verification-fields.py" "optional"
run_python_step "scripts/fetch-munich-3d-datasets.py" "optional"

run_shell_step "scripts/project-health-check.sh"

log "Dataset refresh workflow finished"

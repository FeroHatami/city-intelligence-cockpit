# Project Health Check

Run the local project health check from the repository root:

```bash
bash scripts/project-health-check.sh
```

The script verifies:

- current branch is `main`
- git status is printed for review
- key app, data, documentation, and script files exist
- City Intelligence Cockpit GeoJSON files parse
- expected feature counts match for all main layers and office sublayers
- office sublayer counts sum to `6,706`
- all GeoJSON features include local verification fields
- catalog order, pharmacy-only workbench, and simple GeoJSON styles are valid
- risky tracked files such as `node_modules`, build output, logs, caches, and `.env*` are absent
- `.env.local` is ignored
- Node guidance says to use Node 22

The check is local-only. It does not call external APIs, does not require secrets, and does not modify project files.

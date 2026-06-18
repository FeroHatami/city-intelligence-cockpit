# Local Data Refresh

City Intelligence Cockpit uses local/manual refresh scripts rather than an
always-on server. This keeps the project local, free, and API-key-free.

## Refresh Script

Run a dry run first:

```bash
bash scripts/refresh-all-datasets.sh --dry-run
```

Run a full refresh:

```bash
bash scripts/refresh-all-datasets.sh
```

Continue after failed fetches:

```bash
bash scripts/refresh-all-datasets.sh --continue
```

The script runs the existing local fetch and processing scripts:

- `scripts/fetch-munich-pharmacies.py`
- `scripts/fetch-munich-offices.py`
- `scripts/fetch-munich-clinics.py`
- `scripts/fetch-munich-coworking.py`
- `scripts/fetch-munich-restaurants.py`
- `scripts/split-munich-offices.py`
- `scripts/add-verification-fields.py`
- `scripts/fetch-munich-3d-datasets.py`
- `scripts/project-health-check.sh`

By default, the workflow stops on the first failed fetch. Use `--continue` when
you want best-effort refresh behavior.

## Logs

Refresh logs are written to:

`logs/dataset-refresh.log`

The `logs/` directory is ignored by git.

## Optional macOS Schedule

An example LaunchAgent template is available at:

`scripts/com.city-intelligence.refresh.example.plist`

It is not installed automatically.

To use it later, review the paths and cadence, copy it into
`~/Library/LaunchAgents/`, then load it manually with `launchctl`. This project
does not install background services on its own.

## Guarantees

- No deployment.
- No paid APIs.
- No API keys.
- No automatic background install.
- No backend required.
- Manual run remains the default.

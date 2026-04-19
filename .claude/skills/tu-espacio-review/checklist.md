# Review Checklist

## Code Risk

- Are there bugs, behavioral regressions, broken contracts, or silent failure paths?
- Are error paths rolled back correctly in DB code?
- Is duplicate work or unnecessary network/database fetching happening?

## Architecture

- Are routes thin and services cohesive?
- Is the repo using clear source-of-truth paths after the reorganization?
- Are generated files, runtime artifacts, and source files clearly separated?

## Data And Performance

- Are dates, booleans, and sortable fields modeled with the right types?
- Are queries filtered in the database instead of loading full tables into Python?
- Are caches and retries preventing avoidable external latency?

## Frontend

- Do shared types match backend payloads?
- Are UI states, loading states, and errors covered by tests?
- Does the page logic stay aligned with the matching service module?

## Claude Readiness

- Is there enough project context for Claude to work safely without rediscovering the repo layout every time?
- Are reusable skills or subagents needed for common workflows?
- Are review and verification steps discoverable?

# job-hunt

Public curated shortlist board for GenAI / ML roles. Static GitHub Pages site — filter Priority A/B roles, search by company/title/location, and open apply links. **career-ops never auto-applies**; every application stays human.

**Live:** [https://dong-xuyong.github.io/job-hunt/](https://dong-xuyong.github.io/job-hunt/)

## How to rebuild

From the **Job search** root (`C:\Users\Dong\Desktop\Job search`):

```bash
python scripts/build_job_hunt.py
python scripts/sync_job_hunt.py
```

1. `build_job_hunt.py` — parses local career-ops shortlist into sanitized `job-hunt/data/shortlist.json`
2. `sync_job_hunt.py` — copies the public site into `Dong-Xuyong/job-hunt` and pushes for GitHub Pages

Dry-run sync (no push):

```bash
python scripts/sync_job_hunt.py --dry-run
```

No frontend build step — open `index.html` via a local static server, or use the live Pages URL after sync.

## Privacy

Only sanitized shortlist fields are published:

- Scan date and funnel counts (found → filtered → shortlisted)
- Optional target one-liner (role focus + geo; no compensation)
- Jobs: priority, company, title, location, note (if present), apply URL(s)

Never published: CV, email, phone, `profile.yml`, full pipeline, local filesystem paths, or private career-ops internals.

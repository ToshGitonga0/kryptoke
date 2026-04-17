# Security & Secrets

Before pushing this repository to a public Git host, ensure the following:

- Remove or rotate any real secrets stored in repository files (for example, `backend/.env` currently contains `SECRET_KEY` and `DB_PASSWORD`).
- Add secrets to your Git host's secret store (GitHub Secrets) and reference them in CI/workflows.
- Commit an example env file instead: `backend/.env.example` is provided for reference.
- Ensure `.gitignore` ignores `.env` files (already included).

If you believe sensitive data was committed in the past, rotate the keys and consider rewriting history with `git filter-repo` or `git filter-branch`.

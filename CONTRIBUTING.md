# Contributing to Wiki

Wiki is a simple, open-source wiki app built on the [Frappe Framework](https://frappeframework.com).
Contributions of all kinds are welcome and appreciated — bug reports, feature
requests, documentation improvements, and pull requests. If you've found a bug or
have an idea, please open an issue at
<https://github.com/frappe/wiki/issues>. Commit messages follow the
[Conventional Commits](https://www.conventionalcommits.org) specification, which is
enforced in CI via `commitlint.config.js`.

## Running Tests

Because Wiki is a Frappe app, its tests run through `bench` against a Frappe site —
there is no `yarn test`/`npm test`. You'll need a
[frappe-bench](https://github.com/frappe/bench) with the `wiki` app installed on a
test site, mirroring what CI does:

```bash
bench get-app wiki <path-or-url>
bench --site <site> install-app wiki
```

The site name is a local choice. CI uses `test_site` for the server tests and
`wiki.test` for the UI tests; substitute whatever site you created locally.

### Server (Python) tests

These match the `Server` job in [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

```bash
bench --site test_site set-config allow_tests true
bench --site test_site run-tests --app wiki
```

### UI tests (Cypress)

This matches the `UI Tests (Cypress)` job in
[`.github/workflows/ui-tests.yml`](.github/workflows/ui-tests.yml):

```bash
bench --site wiki.test run-ui-tests wiki --headless
```

Cypress specs live under `cypress/e2e/` (`wiki.cy.js`, `wiki_sidebar.cy.js`) and the
runner is configured in `cypress.config.js`. Drop `--headless` to open the
interactive Cypress runner instead of running headlessly.

## Code Style

Code style and linting are enforced by
[`.github/workflows/linters.yml`](.github/workflows/linters.yml) via
[pre-commit](https://pre-commit.com), configured in `.pre-commit-config.yaml`. The
easiest way to match CI is to install the git hook so checks run on every commit, or
to run all hooks against the whole tree:

```bash
pre-commit install        # one-time setup; runs the hooks on each commit
pre-commit run --all-files
```

The hooks wrap the same tools you can also run directly:

```bash
ruff check --fix .        # lint Python and apply safe fixes
ruff format .             # format Python
```

Python code style is configured in `pyproject.toml` under `[tool.ruff]`
(line length 110, tab indentation, double-quote style). JavaScript is formatted with
[Prettier](https://prettier.io) via the same pre-commit run. Commit messages are
checked against Conventional Commits with `commitlint`.

---

The GitHub Actions workflows under `.github/workflows/` are the source of truth for
the exact test and lint commands. If you change a workflow, please keep this guide
in sync.

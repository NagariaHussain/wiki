# Spec: Add a CONTRIBUTING guide with a Running Tests section

**Task ID:** task-P4LIVE-001
**Type:** Documentation only (no application code changes)
**Repository:** `frappe/wiki` (Frappe "Simple Wiki App")

## Problem statement

This repository has no top-level `CONTRIBUTING.md`. New contributors have no
single, discoverable place that explains how to get set up and—critically—how to
run the project's test suites. The exact test commands currently live only inside
the GitHub Actions workflows (`.github/workflows/ci.yml` and
`.github/workflows/ui-tests.yml`), so a contributor has to reverse-engineer CI to
reproduce a test run locally.

### Intended behavior

After this change, a contributor opening the repository root finds a
`CONTRIBUTING.md` with:

1. A short intro paragraph orienting them to the project and how to contribute.
2. A `## Running Tests` section that documents the **exact** commands this project
   uses to run its tests, matching what CI actually executes.

This is a documentation-only change. No DocTypes, fields, API methods, hooks, or
UI are added or modified.

## Background: how tests actually run (grounded in the repo)

This is a Frappe app, so tests run through `bench` against a Frappe site, not via
`npm test`/`yarn test`. Confirmed by inspecting the repo:

- `package.json` has **no** `scripts` section — there is no `yarn test` entry. It
  only declares editor/runtime dependencies (TipTap, ace-builds, lowlight,
  pre-commit, etc.).
- `.github/workflows/ci.yml` (job **Server**) runs the Python/server test suite:
  - `bench --site test_site set-config allow_tests true`
  - `bench --site test_site run-tests --app wiki`
- `.github/workflows/ui-tests.yml` (job **UI Tests (Cypress)**) runs the UI
  suite:
  - `bench --site wiki.test run-ui-tests wiki --headless`
  - Cypress specs live in `cypress/e2e/` (`wiki.cy.js`, `wiki_sidebar.cy.js`);
    config in `cypress.config.js`.
- `.github/workflows/linters.yml` runs `pre-commit` (Frappe Linter via
  `pre-commit/action`), `commitlint` (conventional commits), and `pip-audit`.
  `pre-commit` is also a declared dependency in `package.json`, and lint config
  lives in `pyproject.toml` (`[tool.ruff]`) and `commitlint.config.js`.

The CONTRIBUTING guide must reproduce these commands verbatim so local runs match
CI.

## Concrete changes required

### File to create

- `CONTRIBUTING.md` (repository root). This is the only file added or changed.

No other files are touched. Do **not** add a `scripts` block to `package.json`,
do **not** modify workflows, and do **not** change any application code.

### Required content / structure of `CONTRIBUTING.md`

The document should contain the following sections. Commands must match the repo
exactly (see above).

1. **Intro paragraph** — one short paragraph: what the project is (the Frappe
   Wiki app) and a welcoming note that contributions (issues, PRs, docs) are
   appreciated. May link to the issue tracker
   (`https://github.com/frappe/wiki/issues`) and note that commit messages follow
   Conventional Commits (enforced by `commitlint.config.js` in CI).

2. **`## Running Tests`** (required heading, exact text) — documents how to run
   the suites. Because tests require a Frappe bench + site, the section should
   state that prerequisite first, then give the exact commands.

   - A one-line prerequisite note: tests run via `bench` inside a
     [frappe-bench](https://github.com/frappe/bench) with the `wiki` app
     installed on a test site (mirroring CI: `bench get-app wiki ...` →
     `bench --site <site> install-app wiki`).

   - **Server (Python) tests** — exact commands from `ci.yml`:
     ```bash
     bench --site test_site set-config allow_tests true
     bench --site test_site run-tests --app wiki
     ```
     Note that `<site>` (`test_site` in CI) is whatever site the contributor
     created locally.

   - **UI tests (Cypress)** — exact command from `ui-tests.yml`:
     ```bash
     bench --site wiki.test run-ui-tests wiki --headless
     ```
     Mention that specs live under `cypress/e2e/` and config is in
     `cypress.config.js`; `--headless` may be dropped to open the interactive
     Cypress runner.

3. **(Optional but recommended) `## Linting` / code style** — documents what the
   Linters workflow runs, so contributors can reproduce it:
   ```bash
   pre-commit install   # one-time
   pre-commit run --all-files
   ```
   Reference `pyproject.toml` (`[tool.ruff]`, line-length 110, tab indent,
   double-quote style) and Conventional Commits via `commitlint`.

### Style/format constraints

- GitHub-flavored Markdown; fenced ```bash blocks for commands.
- Keep commands copy-pasteable and identical to those in the workflow files —
  reviewers will diff them against `.github/workflows/`.
- Keep it concise; this is a guide, not a manual.

## Edge cases, validation, migration concerns

- **No application impact / no migration.** Documentation-only; nothing imports or
  executes `CONTRIBUTING.md`. No DB schema, patches, or hooks involved.
- **Site name discrepancy.** CI uses two different site names (`test_site` for
  server tests, `wiki.test` for UI tests). The doc must not imply these are the
  same single site; present each command with the site name CI uses, and note the
  site name is a local choice.
- **Command drift risk.** If the workflows change later, the doc can go stale. Keep
  the wording close to CI and (optionally) reference the workflow files as the
  source of truth so future maintainers know where to re-sync.
- **No `yarn test`.** Do not invent npm/yarn test scripts; `package.json` has no
  `scripts`. Asserting a `yarn test` command would be incorrect.
- **Pre-existing file.** There is currently no `CONTRIBUTING*` file at root
  (verified). Creating one will not overwrite anything.

## Verification checklist (for a reviewer)

- [ ] `CONTRIBUTING.md` exists at the repository root.
- [ ] No files other than `CONTRIBUTING.md` (and this spec) are added/modified —
      confirm with `git status` / `git diff --stat`; application code untouched.
- [ ] File starts with a short intro paragraph describing the project and how to
      contribute.
- [ ] A section with the exact heading `## Running Tests` is present.
- [ ] The server-test commands match `.github/workflows/ci.yml`:
      `bench --site test_site set-config allow_tests true` and
      `bench --site test_site run-tests --app wiki`.
- [ ] The UI-test command matches `.github/workflows/ui-tests.yml`:
      `bench --site wiki.test run-ui-tests wiki --headless`.
- [ ] No fabricated commands (e.g. `yarn test`) that don't exist in the repo.
- [ ] Markdown renders correctly (headings, fenced code blocks) on GitHub.
- [ ] `package.json` still has no `scripts` section (i.e., it was not edited).

# musicnotes

## CI/CD Pipeline

Deployment is automated using **GitHub Actions** and follows a cross-repository CI/CD workflow.

On every push to `main` (or manual trigger):

1. **Checkout** – Fetch the MusicNotes source code.
2. **Install** – Set up Node.js and install locked dependencies using `npm ci`.
3. **Test** – Run automated tests with Vitest.
4. **Build** – Validate TypeScript and generate production assets using Vite.
5. **Deploy** – If all checks pass, use `rsync --delete` to replace the `musicnotes/` directory in the [website repository](https://github.com/ibeusan20/ibeusan20.github.io) with the contents of `dist/`.
6. **Commit & publish** – Commit and push only when generated files have changed, triggering GitHub Pages deployment.

**Security:** Cross-repository authentication uses a fine-grained GitHub PAT stored as an Actions secret (`SITE_REPO_TOKEN`), with write access restricted to the destination repository.

**Result:** Every successful deployment is traceable to a source commit. Failed tests or builds prevent deployment, keeping the previously published version intact.

**Live:** [ivanbeusan.from.hr/musicnotes](https://ivanbeusan.from.hr/musicnotes/)

**Workflow:** [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
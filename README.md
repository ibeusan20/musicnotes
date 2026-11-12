# musicnotes


MusicNotes is a browser-based music theory practice application
built with React, TypeScript, Vite and VexFlow.

## Features

- Note recognition in treble, bass, alto and tenor clefs
- Written interval recognition
- Major and minor scale recognition
- Diatonic mode recognition
- Independent settings and statistics for each practice mode
- Croatian and English interface
- Light, dark and system themes
- Local progress persistence

## Local development

Requirements: Node.js 24 and npm.

```bash
cd musicnotes-src
npm ci
npm run dev
```

Run tests and production build:

```bash
npm test
npm run build
```

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

## License

Copyright © 2026 Ivan Beusan. All rights reserved.

This project is proprietary software, not open source.
Reuse, modification or distribution of the source code requires
prior written permission from the copyright holder.

See [LICENSE](LICENSE) for details.
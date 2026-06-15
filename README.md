# Pet Portrait Site

## Local server

```sh
scripts/server.sh
```

Open <http://localhost:8123>.

## Gallery

`gallery.json` is the gallery source of truth. Each portrait has a permanent
reference such as `D-007`. Reordering a portrait changes its position in the
JSON array, not its reference.

Visitors can reveal references from the small **Gallery references** control in
the footer on desktop or mobile. `Shift+N` toggles the same mode on a keyboard.
Selecting a visible reference copies it.

Gallery maintenance:

```sh
npm install
npm run hooks:install      # once per clone
npm run gallery:sync      # after adding or replacing image contents
npm run assets:sync       # after changing local CSS or JavaScript
npm run gallery:validate  # manifest, files, formats, revisions, duplicates
npm run gallery:test      # desktop and mobile browser behavior
npm test                  # all gallery checks
```

Rules:

- Keep an existing reference when replacing or moving a portrait.
- Give additions the category's `nextReference` value, then increment it.
- Name active files after their lowercase reference, for example
  `photos/dog/d-024.jpg`.
- The order in `gallery.json` controls order within each category.
- Move removed files to `photos-archive/`.
- Never place an unlisted file in `photos/`.

The manifest is intentionally suitable for a future visual gallery editor. A
drag-and-drop admin interface can update the same ordered data later without
another gallery migration.

Local CSS and JavaScript references use content-derived revisions. Run
`npm run assets:sync` after editing them. This changes URLs only when content
changes, allowing unchanged assets to stay cached while reliably invalidating
new deployments.

The repository includes a pre-commit hook that checks gallery metadata and
local asset revisions. Install it once with `npm run hooks:install`. The hook
does not rewrite or stage files; when it finds stale revisions, run the
suggested sync command, review the generated changes, and commit again.

## Deployment

Push to GitHub. The site deploys to Cloudflare automatically.

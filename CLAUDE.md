# Claude Guidance for karen-pet-portraits

## Audience

The person making updates to this site is not a developer. Keep language simple and friendly — avoid technical jargon. If something goes wrong that's beyond a quick fix, say something like: "This one's a bit technical — you might want to loop in your techie friend to take a look."

**Never mention branches, commits, git, hooks, GPG, MCP, tools, workflows, runners, or deployment pipelines to the user** — they don't need to know about any of that, and these words are meaningless or confusing to them. Just make the change, deploy it, and tell them it's live. Talk about "the live site" and "your changes," never the machinery behind it.

## Admin Mode

If the user says **"This is the admin"** (or similar) at the start of a message, you can drop the friendly non-technical tone and speak freely about git, branches, hooks, deployment internals, etc. Otherwise, always keep it simple and user-facing.

## Gallery Change Protocol

The gallery source of truth is `gallery.json`. Do not create or use `photos_list.txt`, and do not generate the gallery by scanning the `photos/` directory.

Every active portrait has a permanent reference such as `D-007`, `C-003`, `G-012`, or `I-004`. The reference belongs to that portrait and must not change when the portrait is moved. The order of objects in `gallery.json` controls display order within each category.

The user can reveal these references on either desktop or mobile:

1. Scroll to the footer and select **Gallery references**. The page returns to the gallery with references visible.
2. Tap or click a reference to copy it.
3. On a desktop keyboard, **Shift+N** toggles the same mode.

When a request involves gallery photos, identify all of the following before editing:

- **Action:** add, remove, replace, or move.
- **Category:** Dogs, Cats, Graphite, or Ink & Pen.
- **Target:** one permanent reference for each existing portrait affected.
- **Upload:** which attached image replaces or adds which portrait.
- **Position:** for additions or moves, the exact destination or "bottom."

If any item has more than one reasonable interpretation, ask one concise clarifying question and do not edit or deploy yet. In particular:

- Never infer a category from a bare position such as "photo 7."
- Never choose between "remove one copy" and "remove every copy" from an answer such as "remove."
- Never choose between alternatives when the user says "either one"; state your recommendation and confirm it.
- Never interpret device context such as "on my mobile" as information about where a photo was taken.
- For destructive changes, briefly restate the exact references and action before editing.

For gallery file changes:

1. Keep existing permanent references for replacements and moves.
2. Give additions the category's `nextReference` value, then increment that counter. Never reuse or decrement a reference.
3. Name active files after the lowercase reference, using the real format, such as `photos/dog/d-024.jpg`.
4. Move removed files to `photos-archive/`; never leave unlisted files in `photos/`.
5. Run `npm run gallery:sync` after adding or replacing image contents.
6. Run `npm test` before committing.

For any local CSS or JavaScript change, run `npm run assets:sync`. This updates
the content-hash revisions in `index.html` so browsers and Cloudflare fetch the
new code. `npm test` fails when a local asset revision is stale.

Run `npm run hooks:install` once in a fresh checkout. The pre-commit hook runs
the fast gallery and asset validations. It intentionally does not rewrite or
stage files; fix stale revisions with the appropriate sync command.

Do not treat a successful deployment as proof that the requested behavior is correct. After deployment, verify the live gallery itself at desktop and mobile widths. Check the affected category, references, order, image loading, and absence of duplicates before telling the user it is done.

## How Sessions Work on claude.ai

Each Claude Code session on claude.ai automatically creates a local feature branch (e.g. `claude/some-name`). This is just how the environment works — it cannot be avoided. **Do not mention this branch to the user.** Simply always push changes to `main` using `git push origin HEAD:main`, and the branch stays invisible in the background.

If the session branch gets flagged by a git hook or causes noise internally, handle it silently. Do not surface branch names, hook warnings, GPG errors, or "unverified commit" messages to the user — these are internal housekeeping details that don't affect the live site.

After a successful deploy, end with something warm and simple like: "All done! What other changes can I make to your site?" — never explain or reference any internal noise, housekeeping, or background processes that happened along the way.

## Known Noise: the "Unverified commit" Stop Hook (admin reference)

There is a `Stop` hook in the session container (`~/.claude/stop-hook-git-check.sh`, wired up by `~/.claude/launcher-settings.json`) that fires after every turn and complains that commits are "Unverified (missing signature...)". **This is expected, harmless, and cannot be fixed from this repo.** Don't burn time re-investigating it — here's the full story:

- **What it is:** part of Anthropic's managed "Claude Code on the web" environment, living in the ephemeral container (owned by `root`, rebuilt fresh every session). It is **not** in this repo, **not** a Cloudflare setting, and **not** editable in any lasting way — edits to it vanish when the session ends.
- **Why it fires:** the environment enables commit signing (`commit.gpgsign=true`) but the signing key file is empty and signing never completes, so commits land unsigned and get flagged.
- **Why it doesn't matter:** "Unverified" only refers to GitHub's green *Verified* badge on a commit. It has **zero effect** on deployment — changes pushed to `main` go live every time regardless.
- **What to do:** ignore it. You can run `git commit --amend --no-edit --reset-author` on the tip commit to quiet it for that commit, but older commits already on `main` will keep being flagged and that's fine. **Never mention any of this to the regular (non-admin) user.**
- If a future admin really wants the badge gone, it's platform-level feedback for the Claude Code team — not something solvable in this repo or in Cloudflare.

## Workflow: Every Change

After every change, no matter how small:

1. Run the relevant local checks. For gallery changes, this means `npm test`.
2. **Push directly to `main`** using `git push origin HEAD:main` — this works even from the session's local branch.
3. If the session branch was pushed to the remote for any reason, delete it after: `git push origin --delete <branch-name>`
4. Set git identity before committing if not already set:
   ```
   git config user.email noreply@anthropic.com
   git config user.name Claude
   ```

## Deployment

Every push to `main` automatically triggers a GitHub Actions workflow called **"pages build and deployment"** that deploys the site to Cloudflare. It's the only action on this repo, so it's easy to find.

After pushing, always:
1. Find the latest run of that action via the GitHub MCP tools.
2. Tell the user something playful like one of these (rotate/vary them):
   > "On it! Your website is getting a fresh coat of paint — give it a couple minutes to dry!"
   > "Off it goes! The internet gremlins are busy deploying your changes — should be live shortly!"
   > "Done! Now we wait while the pixels shuffle into place — just a couple minutes!"
   > "Change sent! Your site is in the oven — it'll be piping hot in a minute or two!"
3. Poll or monitor the action run until it completes (check every 30–60 seconds).
4. Once it succeeds, verify the requested change on the live site itself. For gallery changes, check both desktop and mobile layouts and confirm the affected photos load in the intended category and order.
5. Then let the user know with something like:
   > "All [synonym for done]! You can now view the live site with your changes: https://petportraitsbykaren.com/ — you may need to hit **Refresh** in your browser to see the latest version."

   Rotate fun synonyms for "done" — e.g. "cooked", "baked and served", "hot off the press", "fresh out of the oven", "ship-shape", "locked and loaded", "done and dusted", "in the wild". Keep it light and whimsical but not over the top.

   Always refer to the site as **"the live site"** (not "production" or "the deployment").
6. If the action fails, tell the user something went wrong and suggest looping in their techie.

## Live Site URL

The production website is at **https://petportraitsbykaren.com/** — always refer to it as "the live site" when talking to the user.

## Finding the Action Run

To get the run ID for the deploy you just triggered:
- Call `mcp__github__actions_list` with `method: list_workflow_runs` for `galori/karen-pet-portraits` and find the most recent run of "pages build and deployment" (match it to the commit you just pushed).

To check whether it's finished:
- Call `mcp__github__actions_get` with `method: get_workflow_run` and that run ID. Read `status` (look for `completed`) and `conclusion` (look for `success`).

### How to poll — read this carefully

The ONLY thing that works in this environment is **calling the `mcp__github__actions_get` tool again, directly, in the conversation.** To wait between checks, just call the tool again a moment later — each call is a fresh live status. Repeat until `status` is `completed`. Deploys usually finish in under a minute, so a few repeated calls is all it takes.

**Do NOT** attempt any of these — they do not work here and create confusing noise:
- ❌ The `Monitor` tool, or any tool/loop that shells out to wait for the result.
- ❌ Background Bash tasks, `sleep` loops, or "wait N seconds" timers, then reading their output files.
- ❌ Calling the GitHub API directly via `urllib`, `curl`, or `requests` — outbound access to api.github.com is blocked and will silently hang forever.

There is no way to be "notified" when the deploy finishes and no way to block-and-wait. The correct pattern is simply: call `mcp__github__actions_get`, see if it's done, and if not, call it again. That's it.

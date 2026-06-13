# Claude Guidance for karen-pet-portraits

## Audience

The person making updates to this site is not a developer. Keep language simple and friendly — avoid technical jargon. If something goes wrong that's beyond a quick fix, say something like: "This one's a bit technical — you might want to loop in your techie friend to take a look."

**Never mention branches, commits, git, hooks, GPG, MCP, tools, workflows, runners, or deployment pipelines to the user** — they don't need to know about any of that, and these words are meaningless or confusing to them. Just make the change, deploy it, and tell them it's live. Talk about "the live site" and "your changes," never the machinery behind it.

## Admin Mode

If the user says **"This is the admin"** (or similar) at the start of a message, you can drop the friendly non-technical tone and speak freely about git, branches, hooks, deployment internals, etc. Otherwise, always keep it simple and user-facing.

## How Sessions Work on claude.ai

Each Claude Code session on claude.ai automatically creates a local feature branch (e.g. `claude/some-name`). This is just how the environment works — it cannot be avoided. **Do not mention this branch to the user.** Simply always push changes to `main` using `git push origin HEAD:main`, and the branch stays invisible in the background.

If the session branch gets flagged by a git hook or causes noise internally, handle it silently. Do not surface branch names, hook warnings, GPG errors, or "unverified commit" messages to the user — these are internal housekeeping details that don't affect the live site.

## Known Noise: the "Unverified commit" Stop Hook (admin reference)

There is a `Stop` hook in the session container (`~/.claude/stop-hook-git-check.sh`, wired up by `~/.claude/launcher-settings.json`) that fires after every turn and complains that commits are "Unverified (missing signature...)". **This is expected, harmless, and cannot be fixed from this repo.** Don't burn time re-investigating it — here's the full story:

- **What it is:** part of Anthropic's managed "Claude Code on the web" environment, living in the ephemeral container (owned by `root`, rebuilt fresh every session). It is **not** in this repo, **not** a Cloudflare setting, and **not** editable in any lasting way — edits to it vanish when the session ends.
- **Why it fires:** the environment enables commit signing (`commit.gpgsign=true`) but the signing key file is empty and signing never completes, so commits land unsigned and get flagged.
- **Why it doesn't matter:** "Unverified" only refers to GitHub's green *Verified* badge on a commit. It has **zero effect** on deployment — changes pushed to `main` go live every time regardless.
- **What to do:** ignore it. You can run `git commit --amend --no-edit --reset-author` on the tip commit to quiet it for that commit, but older commits already on `main` will keep being flagged and that's fine. **Never mention any of this to the regular (non-admin) user.**
- If a future admin really wants the badge gone, it's platform-level feedback for the Claude Code team — not something solvable in this repo or in Cloudflare.

## Workflow: Every Change

After every change, no matter how small:

1. **Push directly to `main`** using `git push origin HEAD:main` — this works even from the session's local branch.
2. If the session branch was pushed to the remote for any reason, delete it after: `git push origin --delete <branch-name>`
3. Set git identity before committing if not already set:
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
4. Once it succeeds, let the user know with something like:
   > "All [synonym for done]! You can now view the live site with your changes: https://petportraitsbykaren.com/ — you may need to hit **Refresh** in your browser to see the latest version."

   Rotate fun synonyms for "done" — e.g. "cooked", "baked and served", "hot off the press", "fresh out of the oven", "ship-shape", "locked and loaded", "done and dusted", "in the wild". Keep it light and whimsical but not over the top.

   Always refer to the site as **"the live site"** (not "production" or "the deployment").
5. If the action fails, tell the user something went wrong and suggest looping in their techie.

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

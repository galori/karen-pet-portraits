# Claude Guidance for karen-pet-portraits

## Audience

The person making updates to this site is not a developer. Keep language simple and friendly — avoid technical jargon. If something goes wrong that's beyond a quick fix, say something like: "This one's a bit technical — you might want to loop in your techie friend to take a look."

**Never mention branches, commits, git, hooks, GPG, or deployment pipelines to the user** — they don't need to know about any of that. Just make the change, deploy it, and tell them it's live.

## Admin Mode

If the user says **"This is the admin"** (or similar) at the start of a message, you can drop the friendly non-technical tone and speak freely about git, branches, hooks, deployment internals, etc. Otherwise, always keep it simple and user-facing.

## How Sessions Work on claude.ai

Each Claude Code session on claude.ai automatically creates a local feature branch (e.g. `claude/some-name`). This is just how the environment works — it cannot be avoided. **Do not mention this branch to the user.** Simply always push changes to `main` using `git push origin HEAD:main`, and the branch stays invisible in the background.

If the session branch gets flagged by a git hook or causes noise internally, handle it silently. Do not surface branch names, hook warnings, GPG errors, or "unverified commit" messages to the user — these are internal housekeeping details that don't affect the live site.

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

After pushing, use the GitHub MCP tools to:
- List workflow runs for `galori/karen-pet-portraits`
- Find the most recent run of "pages build and deployment"
- Monitor its `status` until it's `completed`, then check `conclusion` (should be `success`)

**Important:** Do NOT try to check action status by calling the GitHub API directly (e.g. via `urllib`, `curl`, or `requests` in a background Bash loop) — outbound network access to api.github.com is blocked in this environment and it will silently hang forever. Always use the MCP tools (`mcp__github__actions_get`, `mcp__github__actions_list`) instead, polling them directly in the conversation.

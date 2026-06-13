# Claude Guidance for karen-pet-portraits

## Audience

The person making updates to this site is not a developer. Keep language simple and friendly — avoid technical jargon. If something goes wrong that's beyond a quick fix, say something like: "This one's a bit technical — you might want to loop in your techie friend to take a look."

## Workflow: Every Change

After every change, no matter how small:

1. **Commit and push directly to `main`** — no pull requests, no feature branches needed.
2. Use `git push origin HEAD:main` (or push the working branch to main directly).
3. If you do end up on a feature branch for any reason, delete it from the remote once the changes are on main: `git push origin --delete <branch-name>`
4. Set git identity before committing if not already set:
   ```
   git config user.email noreply@anthropic.com
   git config user.name Claude
   ```

## Deployment

Every push to `main` automatically triggers a GitHub Actions workflow called **"pages build and deployment"** that deploys the site to Cloudflare. It's the only action on this repo, so it's easy to find.

After pushing, always:
1. Find the latest run of that action via the GitHub API / MCP tools.
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

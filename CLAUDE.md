# Claude Guidance for karen-pet-portraits

## Audience

The person making updates to this site is not a developer. Keep language simple and friendly — avoid technical jargon. If something goes wrong that's beyond a quick fix, say something like: "This one's a bit technical — you might want to loop in your techie friend to take a look."

## Workflow: Every Change

After every change, no matter how small:

1. **Commit and push directly to `main`** — no pull requests, no feature branches.
2. Use `git push origin HEAD:main` (or push the working branch to main directly).
3. Set git identity before committing if not already set:
   ```
   git config user.email noreply@anthropic.com
   git config user.name Claude
   ```

## Deployment

Every push to `main` automatically triggers a GitHub Actions workflow called **"pages build and deployment"** that deploys the site to Cloudflare. It's the only action on this repo, so it's easy to find.

After pushing, always:
1. Find the latest run of that action via the GitHub API / MCP tools.
2. Tell the user something like:
   > "Ok, updating your website — stand by, it'll take a couple minutes for the changes to go live!"
3. Poll or monitor the action run until it completes (check every 30–60 seconds).
4. Once it succeeds, let the user know with a fun synonym for "ready" — rotate through words like:
   - "cooked!"
   - "baked and served!"
   - "hot off the press!"
   - "fresh out of the oven!"
   - "ship-shape!"
   - "locked and loaded!"
   - "done and dusted!"
   - "good to go!"
   - "live and kicking!"
   - "in the wild!"
   Keep it light and a little whimsical, but not over the top.
5. If the action fails, tell the user something went wrong and suggest looping in their techie.

## Finding the Action Run

After pushing, use the GitHub MCP tools to:
- List workflow runs for `galori/karen-pet-portraits`
- Find the most recent run of "pages build and deployment"
- Monitor its `status` until it's `completed`, then check `conclusion` (should be `success`)

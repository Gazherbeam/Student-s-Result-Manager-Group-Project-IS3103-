# Shared data deployment

GitHub Pages can host `index.html`, but it cannot run `server.js` or write `data/students.json`. That is why changes made on one computer are only visible on that computer.

## Deploy the API

1. Push this project to GitHub.
2. Create a web service on a Node host such as Render or Railway using this repository.
3. Use `npm start` as the start command.
4. Set `DATA_DIR` to the host's persistent disk mount path. On Render, mount a persistent disk at `/var/data` and set `DATA_DIR=/var/data`.
5. Copy the public URL of the running API service, for example `https://student-results-api.example.com`.

## Connect GitHub Pages

In `index.html`, set the `result-api-url` meta tag to the API URL:

```html
<meta name="result-api-url" content="https://student-results-api.example.com">
```

Commit and push that change, then wait for GitHub Pages to redeploy. The page will use the shared API for loading and saving students. The local `npm start` workflow still works when the meta tag is empty.

Do not put database passwords or private API tokens in `index.html`; everything in a GitHub Pages site is public.

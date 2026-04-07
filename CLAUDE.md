# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Important: You are the orchestrator. subagents execute. you should NOT build, verify, or code inline (if possible). your job is to plan, prioritize & coordinate the acitons of your subagents

Keep your replies extremely concise and focus on providing necessary information.

When building or implementing a new feature use the code found in the .EXAMPLE-CODE/ directory to understand how the user prefers to build / design. Note the patterns shown in the .EXAMPLE-CODE/ folder and try to emulate them in your solution. The .EXAMPLE-CODE directory I'm talking about is in the root directory of this project.

Put all pictures / screenshots you take with the mcp plugin in the "pics" subfolder, under the .claude folder in THIS project.

# User preferences

**Playwright usage**: Do NOT use Playwright for small CSS changes (a few property tweaks, minor adjustments). Reserve Playwright only for large UI changes where visual verification is worth the time and token cost. The user verifies small CSS changes themselves.

**GitHub Rules**
Do NOT commit anything to GitHub. The user will control all commits to GitHub. Do NOT edit or in any way change the user's Git history or interact with GitHub.

**Continuously LEARN and improve**
If you make a mistake or the user points out something is wrong or corrects you, please make note of it here, so you can avoid that mistake in the future.

## Commands

```bash
npm start       # Run with nodemon (auto-restarts on changes)
node app.js     # Run without auto-restart
```

No test runner is configured.

## Environment Variables

Required in `.env`:

- `PORT` — server port
- `PW` — site password (compared directly in `auth-controller.js`)
- `SESSION_SECRET` — express-session secret
- `NODE_ENV` — set to `production` to enable `secure` cookies

## Architecture

Express 5 app using ES Modules (`"type": "module"` in package.json). No bundler — frontend JS is served as native ES modules from `public/`.

### Auth Flow

Single-password site auth. `requireAuth` middleware (`middleware/auth-config.js`) checks `req.session.authenticated`. On failure, it serves `html/auth.html` directly (not a redirect). The auth form POSTs to `/site-auth-route` → `auth-controller.js` compares `req.body.pw` against `process.env.PW`, sets `req.session.authenticated = true` on success and returns `{ success, redirect }` JSON. In-memory rate limiter in `middleware/rate-limit.js` (10 attempts / 15 min window, keyed by IP).

### Backend Structure

```
app.js                      # Express entry: session, static, routes
routes/router.js            # All routes registered here
controllers/
  auth-controller.js        # POST /site-auth-route
  display-controller.js     # Serves HTML files (index, 401, 404, 500)
  data-controller.js        # Empty — placeholder for future data routes
middleware/
  auth-config.js            # requireAuth guard
  rate-limit.js             # In-memory brute-force protection
  session-config.js         # buildSessionConfig() factory
html/                       # Static HTML pages (served via sendFile)
public/                     # Express static root
```

### Frontend Structure

Vanilla JS with ES module imports. No framework, no build step.

```
public/js/
  responsive.js             # Entry: delegated click/keydown listeners on #auth-element and #display-element
  main.js                   # Builds main and auth displays into their DOM containers
  run.js                    # Action runners (e.g. runAuthSubmit)
  display/
    auth-form.js            # Builds the password form UI
    main-form.js            # Builds the main app form UI
    collapse.js             # Reusable collapse/expand components + hide/unhide helpers
    loading.js              # Loading overlay show/hide
  util/
    api-front.js            # sendToBack() / sendToBackFile() fetch wrappers
    define-things.js        # SVG string constants (EYE_CLOSED_SVG, etc.)
```

**Event delegation pattern**: `responsive.js` attaches a single `click` and `keydown` listener to each container element and dispatches based on `data-label` attribute. All interactive elements must have `data-label` set; routing logic lives in `clickHandler`/`keyHandler`.

**UI builders**: All DOM elements are constructed programmatically in `display/` files — no HTML templates. Each builder returns an element or `null` on failure.

**API calls**: Always go through `sendToBack({ route, ...payload })`. The `route` key is extracted by the function; remaining keys become the JSON body.

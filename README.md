# @clawapps/cli

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)

**[中文文档](README_zh.md)**

A command-line tool for authenticating with the [ClawApps](https://www.clawapps.ai) platform. Sign in via Google or Apple directly from your terminal — tokens are stored locally for use by AI agents and scripts.

## Install

```bash
npm install -g @clawapps/cli
```

> **Not yet on npm?** Install from source:
> ```bash
> git clone git@github.com:ClawApps/clawapps-cli.git
> cd clawapps-cli && npm install && npm run build && npm link
> ```

## Commands

### `claw login`

Sign in with Google or Apple. Opens a browser for OAuth, then stores tokens locally.

```bash
$ claw login
? Choose login method: Google
Opening browser for Google login...
✔ Logged in as user@gmail.com
```

### `claw whoami`

Show current account info. Auto-refreshes expired tokens.

```bash
$ claw whoami
ClawApps Account
──────────────────────────────
Name:     Username
Email:    user@gmail.com
ID:       xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Provider: google
```

### `claw logout`

Sign out and clear local credentials.

```bash
$ claw logout
Logged out successfully.
```

## How It Works

```
claw login
  → Choose Google or Apple
  → Local HTTP server starts on localhost (random port)
  → Browser opens for OAuth
  → Callback returns token to local server
  → Token exchange: Google/Apple → OpenDigits → ClawApps
  → Credentials saved to ~/.clawapps/credentials.json (0600)
```

**Google flow**: Implicit OAuth → local callback page extracts token from URL hash → POST to local server → exchange for ClawApps tokens.

**Apple flow**: OpenDigits handles Apple OAuth → redirects to local callback with tokens in query params → exchange for ClawApps tokens.

## Credentials

Tokens are stored at `~/.clawapps/credentials.json` with file permissions `0600`.

```json
{
  "provider": "google",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "logged_in_at": "2026-02-24T11:11:35.871Z"
}
```

Use in scripts:

```bash
TOKEN=$(cat ~/.clawapps/credentials.json | jq -r .access_token)
curl -H "Authorization: Bearer $TOKEN" https://api.clawapps.ai/api/v1/...
```

## Project Structure

```
clawapps-cli/
├── bin/claw.js                # Entry point
├── src/
│   ├── index.ts               # Commander setup
│   ├── commands/
│   │   ├── login.ts           # OAuth flow orchestration
│   │   ├── logout.ts          # Clear credentials
│   │   └── whoami.ts          # User info with auto-refresh
│   ├── auth/
│   │   ├── server.ts          # Local HTTP callback server
│   │   ├── google.ts          # Google OAuth URL builder
│   │   ├── apple.ts           # Apple OAuth URL builder (via OD)
│   │   └── exchange.ts        # Token exchange (OD → ClawApps)
│   ├── lib/
│   │   ├── config.ts          # API endpoints & constants
│   │   ├── credentials.ts     # Read/write ~/.clawapps/credentials.json
│   │   ├── api.ts             # HTTP request helpers
│   │   └── types.ts           # TypeScript interfaces
│   └── html/
│       ├── callback.ts        # OAuth callback HTML templates
│       └── logo-data.ts       # Logo (base64 embedded)
├── package.json
└── tsconfig.json
```

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Watch mode
node bin/claw.js     # Run locally
```

## Requirements

- **Node.js >= 18** (uses native `fetch`)

## Related

- [clawapps-skill](https://github.com/ClawApps/clawapps-skill) — Agent Skill for managing apps on ClawApps

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (use [Conventional Commits](https://www.conventionalcommits.org/))
4. Push and open a Pull Request

## License

[MIT](LICENSE) - Copyright 2026 ClawApps

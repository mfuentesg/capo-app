# Capo

<p align="center">
    <img src="./docs/logo.svg" height="120" alt="Capo logo" />
</p>
<br />

A modern song library app for musicians, featuring chords and lyrics for your favorite songs. Built with [`NextJS`](https://nextjs.org/) and powered by the [`ChordPro`](https://www.chordpro.org/) file format for chord notation.

## Why Capo?

A `Capo` is a small device that clamps onto the neck of a guitar and shortens the length of the strings. The main
advantage of using a capo is that it lets a guitarist play a song in different keys while still using first-position
open-string chord forms.

## Motivation

During past months my son has been learning to play guitar. I decided to build him a tool to make his learning process easier. As a passionate musician and software engineer, I want to create something more powerful by combining my knowledge of music and programming.

Beyond helping beginners learn, this app serves musicians of all levels by providing an organized song library with easy access to chords and lyrics for practice and performance.

Apart from that, it sounds fascinating and fun 🤓.

## Stack

- NextJS
- TailwindCSS + shadcn/ui
- Supabase

## Getting started

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) - For running Supabase services locally
- [fnm](https://github.com/Schniz/fnm) - Node version manager

### Installation

Install fnm, Node, and pnpm:

```bash
# Install fnm as node version manager
curl -fsSL https://fnm.vercel.app/install | bash

# fnm automatically uses the Node version from .node-version
fnm use

# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Development

#### 1. Start Supabase Services Locally

```bash
# Initialize Supabase local development (if not already done)
pnpm supabase init

# Start Supabase services locally
pnpm supabase start
```

See [Supabase Local Development Guide](https://supabase.com/docs/guides/resources/supabase-cli/local-development) for more details.

#### 2. Configure Google Provider for Local Login

To enable Google OAuth for local development:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Providers**
3. Enable the Google provider
4. Add your OAuth credentials:
   - **Client ID**: Get from [Google Cloud Console](https://console.cloud.google.com/)
   - **Client Secret**: Get from [Google Cloud Console](https://console.cloud.google.com/)
5. Add redirect URI: `http://localhost:3000/auth/callback`

For local testing with Google Auth, create OAuth credentials with:
- **Authorized redirect URIs**: `http://localhost:3000/auth/callback`

#### 3. Start Development Server

```bash
pnpm dev
```

This starts the Next.js development server at [`http://localhost:3000`](http://localhost:3000).

> **Note**: Ensure Supabase services are running before starting the dev server.

## Help me keep making awesome stuff

Contribute with me, supporting this project through

<a href="https://www.buymeacoffee.com/mfuentesg" target="_blank">
   <img height="41" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" />
</a>

Happy Coding!
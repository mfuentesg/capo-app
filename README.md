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

## Features

### Song Library

Browse and manage your personal collection of songs. Filter by musical key, BPM range, and status (active/archived). Songs are stored in [ChordPro](https://www.chordpro.org/) format and support rich metadata including BPM, key, and custom tags.

### Lyrics & Chords Editor

View and edit songs with a split-pane interface: a [CodeMirror](https://codemirror.net/)-powered ChordPro editor on one side and a live-rendered lyrics/chord view on the other. Supports per-section chord colors and multi-column layout preferences.

### Playlists

Create and manage playlists of songs. Reorder songs via drag-and-drop. Each playlist can be shared publicly with a unique share code.

### Playlist Draft (Quick Add)

A cart-like interface for quickly building playlists. Add songs to a draft from anywhere in the library, then save the draft as a new or existing playlist.

### Playlist Sharing

Share any playlist publicly via a unique share code. Recipients can view the full playlist and individual song sheets without needing an account.

### Song Creation & Editing

Create new songs or edit existing ones using the ChordPro format. The song editor includes syntax highlighting, live preview, and metadata fields (title, artist, key, BPM).

### Teams & Collaboration

Create teams and invite other users by email. Team members share a common song library and playlists. Manage pending invitations and switch between personal and team contexts.

### Dashboard

An overview page showing library stats (total songs, playlists, teams) and recently added songs for quick access.

### Activity Tracking

Tracks user engagement across the app to surface relevant content and support future personalization.

### Settings

- **Theme**: Switch between light and dark mode.
- **Language**: Change the UI language (i18n support).

### Authentication

Sign in with Google OAuth. Sessions are managed via Supabase Auth.

## Stack

- NextJS
- TailwindCSS + shadcn/ui
- Supabase

## Architecture

This project uses **Feature-Based Architecture (FBA)** for better code organization and scalability.

### 📚 Documentation

- **[FBA Guide](./features/docs/FBA_GUIDE.md)** - Complete developer guide for Feature-Based Architecture
  - Quick start rules
  - Adding components, hooks, types
  - Cross-feature dependencies
  - Testing patterns
  - Deployment checklist

### 📁 Project Structure

```
features/              # Feature-based modules (organized by business domain)
├── songs/             # Song library management
├── playlists/         # Playlist management
├── playlist-draft/    # Quick-add-to-playlist cart
├── lyrics-editor/     # Song lyrics display and ChordPro editing
├── playlist-sharing/  # Share playlists via share codes
├── song-draft/        # Song creation and editing
├── settings/          # Theme, language, user preferences
├── auth/              # Google OAuth authentication
├── dashboard/         # Dashboard stats and recent songs
├── activity/          # Activity tracking
├── teams/             # Team management and invitations
└── app-context/       # Global app context (team selection)

app/                   # Next.js App Router routes
lib/                   # Shared utilities, Supabase clients, i18n
types/                 # Global type definitions
supabase/              # Database migrations and config
```

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

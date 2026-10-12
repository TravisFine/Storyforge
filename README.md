# Storyforge
A buildless, mobile-friendly game design studio. The site files live at the repository root. GitHub Pages publishes the main branch root.

## Features
- Multiple game projects; notebook pages with named sections and images.
- Characters with portraits, relationships and arbitrary fields.
- Finished card images with custom stats and written functions.
- Chapter-based branching graph with draggable nodes, labeled conditions, list view and automatic layout.
- IndexedDB local persistence, editor recovery, JSON export/import, Google Drive app-data snapshot sync.

## Google Drive setup
The UI under Settings contains the full setup flow. Configure a Google Cloud project with Drive API enabled, consent screen (including your test user when applicable), the drive.appdata scope, and a Web application OAuth client. Add the deployed site's exact origin to authorized JavaScript origins. Enter the PUBLIC client ID into the app; never add a secret. Use the same client ID across devices. Connect Google Drive on each device.

Tokens stay in memory. A new user gesture is required after token expiration or reload. Sync runs while the page is open, after committed edits, and on focus/reconnection. Local edits made in a dialog have separate device-only crash recovery until Save is pressed. Cloud snapshots include optimized images. Concurrent differences trigger a version choice, with a local recovery snapshot retained. Cloud saves are immutable full-workspace files in appDataFolder; they preserve history but consume Drive storage. This app is intended for one person, one active editing device at a time, not real-time collaboration. Old snapshots are not automatically deleted.

## GitHub Pages
Publish the main branch root in Settings → Pages. Relative assets work under a repository subpath. Add the GitHub Pages origin (without repository path) to the same Google OAuth client. Export/import the local backup when moving between hostnames, or connect to Drive to retrieve cloud data.

## Verification
Syntax and logic checks are included in `tests/`. A live OAuth test requires the user's configured client ID and authorization. The initial deployment has no Google OAuth client configured; it saves locally until setup is completed.

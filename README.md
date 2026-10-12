# Storyforge
Personal game design studio: notes, branching chapters, card library and characters.

Hosted on GitHub Pages. No build step; publish `main` / root.

## Private cloud setup (Supabase Free)
1. Create a Free Supabase project. No paid plan is needed.
2. Run `supabase-setup.sql` in the project's SQL Editor. It creates a workspace table, atomic save function, a private image bucket, and owner-only row/file policies.
3. In Authentication > Users, create your personal email/password user. Keep public signup disabled (there is no public registration flow in this app). Store your password privately; it does not belong in the repository or chat.
4. Copy the project URL and **publishable** API key into `config.js` (both are designed for browser use). Never use a secret/service-role key. A legacy `anon` key also works.
5. Open Storyforge > Settings > Sign in. The same credentials work on phone and computer. With no configuration the app remains local-only and says so.

Local settings can also store the public connection values per device, but using config.js makes everyday login simpler.

## Saving and privacy
- Existing browser data and JSON backups from the Google Drive version remain compatible. Switching hosts requires backup export/import; changing provider at the same GitHub address preserves local data.
- Supabase Auth persists the session and refreshes tokens. Passwords are sent only to the configured Supabase project's Auth service.
- All table and storage access is authenticated and restricted to the user's own ID. Images are private. RLS, not the public API key, protects data.
- Text is stored as a workspace JSON record. Images are stored separately using content hashes, so edits do not repeatedly duplicate uploads.
- Saves use atomic compare-and-swap through an invoker-rights SQL function. Conflicting versions require a choice; an overwritten version is saved locally for recovery, and the database retains one previous version.
- Deleted images are retained for backup recovery; there is no automatic cloud deletion. They still consume storage. Monitor usage on the free plan, which can pause with low activity.
- Cloud synchronization runs while the page is open. Editors have device-only draft recovery until the Save button is pressed. Export periodic backups.
- This is a personal-device app: signing out keeps the local copy visible. Use it on devices you trust.

## Verification
Run `node --check app.js`, `node --check cloud.js`, and `node tests/cloud.cjs`.
Live authentication, owner-isolation policies and cross-device sync must be verified against the configured project before considering cloud setup complete.

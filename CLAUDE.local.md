# Dock Launcher

## Hub Context
Read `E:\ClaudeDev\memory\projects\dock-launcher.md` for full project context.

## Project-Specific Rules
- `npm start` to launch
- `npm test` to run Vitest tests
- Config: `dock-config.json` (JSON, user-editable)
- Electron main: `main.js`, renderer: `renderer/`, settings: `settings/`
- Test lib modules only (config, launcher) — no Electron integration tests

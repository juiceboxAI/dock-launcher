# Dock Launcher

A lightweight floating desktop dock for Windows. Organizes shortcuts into expandable categories with a glassmorphism UI.

![Electron](https://img.shields.io/badge/Electron-40-blue) ![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey)

## Features

- **Floating dock** -- 48x48 draggable square, always on top
- **Expandable categories** -- click to reveal category icons vertically
- **Shortcut fan-out** -- click a category to fan out shortcuts horizontally
- **Hover labels** -- hover any shortcut or category to see its name
- **Glassmorphism UI** -- translucent dark panels with purple/blue accents
- **Settings panel** -- right-click the dock to manage categories and shortcuts
- **Icon extraction** -- auto-extracts icons from .exe and .lnk files
- **Auto-start** -- launches with Windows (when packaged)
- **Live reload** -- settings changes update the dock instantly

## Shortcut Types

| Type | Action | Example |
|------|--------|---------|
| `exe` | Launch executable | `C:\Program Files\app.exe` |
| `lnk` | Open Windows shortcut | `C:\Users\you\Desktop\app.lnk` |
| `shell` | Run shell command | `wt --profile "Dev"` |
| `url` | Open in browser | `https://github.com` or `steam://open/games` |
| `folder` | Open in Explorer | `C:\Projects` |

## Setup

```bash
git clone <this-repo>
cd dock-launcher
npm install
cp dock-config.example.json dock-config.json
```

Edit `dock-config.json` with your shortcuts, then:

```bash
npm start
```

## Configuration

Edit `dock-config.json` or right-click the dock icon to open the settings panel.

```json
{
  "categories": [
    {
      "name": "Tools",
      "icon": "\uD83D\uDD27",
      "items": [
        {
          "name": "VS Code",
          "type": "exe",
          "path": "C:\\Path\\To\\Code.exe",
          "icon": "auto"
        }
      ]
    }
  ]
}
```

### Icon options

- `"auto"` -- extracts icon from .exe/.lnk automatically (Windows only)
- Path to .ico/.png -- uses that image file
- Any other value -- falls back to a type-specific emoji

## Controls

| Action | Result |
|--------|--------|
| Click dock icon | Expand/collapse categories |
| Click category | Fan out shortcuts (accordion) |
| Click shortcut | Launch it |
| Hover shortcut | Show name label |
| Drag dock icon | Reposition (collapsed only) |
| Right-click dock | Open settings |

## Development

```bash
npm start        # Launch the app
npm test         # Run unit tests
npm run test:watch  # Watch mode
```

## Stack

- Electron 40 (frameless, transparent window)
- Vanilla HTML/CSS/JS (no framework)
- Vitest (unit tests)

## License

MIT

import { describe, it, expect } from 'vitest';
import { buildLaunchCommand } from '../lib/launcher.js';

describe('buildLaunchCommand', () => {
  it('returns shell.openPath action for exe type', () => {
    const result = buildLaunchCommand({ type: 'exe', path: 'C:\\app.exe' });
    expect(result).toEqual({ action: 'openPath', target: 'C:\\app.exe' });
  });

  it('returns shell.openPath action for lnk type', () => {
    const result = buildLaunchCommand({ type: 'lnk', path: 'C:\\shortcut.lnk' });
    expect(result).toEqual({ action: 'openPath', target: 'C:\\shortcut.lnk' });
  });

  it('returns shell.openExternal action for url type', () => {
    const result = buildLaunchCommand({ type: 'url', path: 'https://example.com' });
    expect(result).toEqual({ action: 'openExternal', target: 'https://example.com' });
  });

  it('returns shell.openExternal for steam:// urls', () => {
    const result = buildLaunchCommand({ type: 'url', path: 'steam://open/games' });
    expect(result).toEqual({ action: 'openExternal', target: 'steam://open/games' });
  });

  it('returns shell.openPath action for folder type', () => {
    const result = buildLaunchCommand({ type: 'folder', path: 'E:\\GenAI' });
    expect(result).toEqual({ action: 'openPath', target: 'E:\\GenAI' });
  });

  it('returns exec action for shell type', () => {
    const result = buildLaunchCommand({ type: 'shell', path: 'wt --profile "Claude"' });
    expect(result).toEqual({ action: 'exec', target: 'wt --profile "Claude"' });
  });

  it('throws for unknown type', () => {
    expect(() => buildLaunchCommand({ type: 'unknown', path: 'x' })).toThrow('Unknown shortcut type');
  });
});

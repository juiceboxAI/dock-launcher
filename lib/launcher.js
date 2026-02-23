export function buildLaunchCommand(item) {
  switch (item.type) {
    case 'exe':
    case 'lnk':
    case 'folder':
      return { action: 'openPath', target: item.path };
    case 'url':
      return { action: 'openExternal', target: item.path };
    case 'shell':
      return { action: 'exec', target: item.path };
    default:
      throw new Error(`Unknown shortcut type: ${item.type}`);
  }
}

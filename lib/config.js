import fs from 'fs';

const DEFAULT_CONFIG = {
  dockIcon: 'assets/dock-icon.png',
  position: { x: 100, y: 300 },
  categories: []
};

export function loadConfig(configPath) {
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

export function saveConfig(configPath, config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function addCategory(config, { name, icon }) {
  return {
    ...config,
    categories: [...config.categories, { name, icon, items: [] }]
  };
}

export function addItem(config, categoryName, item) {
  return {
    ...config,
    categories: config.categories.map(cat =>
      cat.name === categoryName
        ? { ...cat, items: [...cat.items, item] }
        : cat
    )
  };
}

export function removeItem(config, categoryName, itemName) {
  return {
    ...config,
    categories: config.categories.map(cat =>
      cat.name === categoryName
        ? { ...cat, items: cat.items.filter(i => i.name !== itemName) }
        : cat
    )
  };
}

export function removeCategory(config, categoryName) {
  return {
    ...config,
    categories: config.categories.filter(cat => cat.name !== categoryName)
  };
}

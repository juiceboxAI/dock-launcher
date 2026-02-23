import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadConfig, saveConfig, addCategory, addItem, removeItem, removeCategory } from '../lib/config.js';

const TEST_CONFIG_PATH = path.join(import.meta.dirname, 'test-config.json');

const SEED_CONFIG = {
  dockIcon: 'assets/dock-icon.png',
  position: { x: 100, y: 300 },
  categories: [
    {
      name: 'Tools',
      icon: '🔧',
      items: [
        { name: 'VS Code', type: 'exe', path: 'C:\\code.exe', icon: 'auto' }
      ]
    }
  ]
};

beforeEach(() => {
  fs.writeFileSync(TEST_CONFIG_PATH, JSON.stringify(SEED_CONFIG, null, 2));
});

afterEach(() => {
  if (fs.existsSync(TEST_CONFIG_PATH)) fs.unlinkSync(TEST_CONFIG_PATH);
});

describe('loadConfig', () => {
  it('loads and parses config from disk', () => {
    const config = loadConfig(TEST_CONFIG_PATH);
    expect(config.categories).toHaveLength(1);
    expect(config.categories[0].name).toBe('Tools');
  });

  it('returns default config if file missing', () => {
    const config = loadConfig('/nonexistent/path.json');
    expect(config.categories).toEqual([]);
    expect(config.position).toEqual({ x: 100, y: 300 });
  });
});

describe('saveConfig', () => {
  it('writes config to disk as formatted JSON', () => {
    const config = loadConfig(TEST_CONFIG_PATH);
    config.categories[0].name = 'Changed';
    saveConfig(TEST_CONFIG_PATH, config);
    const reloaded = loadConfig(TEST_CONFIG_PATH);
    expect(reloaded.categories[0].name).toBe('Changed');
  });
});

describe('addCategory', () => {
  it('appends a new category', () => {
    const config = loadConfig(TEST_CONFIG_PATH);
    const updated = addCategory(config, { name: 'Games', icon: '🎮' });
    expect(updated.categories).toHaveLength(2);
    expect(updated.categories[1].name).toBe('Games');
    expect(updated.categories[1].items).toEqual([]);
  });
});

describe('addItem', () => {
  it('adds an item to specified category', () => {
    const config = loadConfig(TEST_CONFIG_PATH);
    const item = { name: 'Node', type: 'exe', path: 'node.exe', icon: 'auto' };
    const updated = addItem(config, 'Tools', item);
    expect(updated.categories[0].items).toHaveLength(2);
    expect(updated.categories[0].items[1].name).toBe('Node');
  });
});

describe('removeItem', () => {
  it('removes an item by name from a category', () => {
    const config = loadConfig(TEST_CONFIG_PATH);
    const updated = removeItem(config, 'Tools', 'VS Code');
    expect(updated.categories[0].items).toHaveLength(0);
  });
});

describe('removeCategory', () => {
  it('removes a category by name', () => {
    const config = loadConfig(TEST_CONFIG_PATH);
    const updated = removeCategory(config, 'Tools');
    expect(updated.categories).toHaveLength(0);
  });
});

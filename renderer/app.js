const COLLAPSED_SIZE = 48;
const CELL_SIZE = 48;
const ITEM_SIZE = 40;
const GAP = 2;
const ITEM_GAP = 4;

let config = null;
let expanded = false;
let activeCategory = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

async function init() {
  config = await window.dock.loadConfig();
  renderCategories();
  setupDockIcon();

  window.dock.onConfigUpdated(async () => {
    config = await window.dock.loadConfig();
    expanded = false;
    activeCategory = null;
    renderCategories();
    recalcWindowSize();
  });
}

function renderCategories() {
  const container = document.getElementById('categories');
  container.innerHTML = '';

  config.categories.forEach((cat, index) => {
    const row = document.createElement('div');
    row.className = 'category-row';
    row.dataset.index = index;

    const iconBtn = document.createElement('div');
    iconBtn.className = 'category-icon';
    iconBtn.textContent = cat.icon;
    iconBtn.title = cat.name;
    iconBtn.addEventListener('click', () => toggleCategory(index));

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'category-items';
    itemsContainer.dataset.index = index;

    cat.items.forEach(item => {
      const tile = createShortcutTile(item);
      itemsContainer.appendChild(tile);
    });

    row.appendChild(iconBtn);
    row.appendChild(itemsContainer);
    container.appendChild(row);
  });
}

function createShortcutTile(item) {
  const tile = document.createElement('div');
  tile.className = 'shortcut-tile';

  const tooltip = document.createElement('span');
  tooltip.className = 'tooltip';
  tooltip.textContent = item.name;
  tile.appendChild(tooltip);

  if (item.icon && item.icon !== 'auto') {
    const img = document.createElement('img');
    img.src = item.icon;
    img.alt = item.name;
    img.onerror = () => {
      img.remove();
      const fallback = document.createElement('span');
      fallback.className = 'fallback-icon';
      fallback.textContent = getFallbackIcon(item.type);
      tile.insertBefore(fallback, tooltip);
    };
    tile.insertBefore(img, tooltip);
  } else {
    const fallback = document.createElement('span');
    fallback.className = 'fallback-icon';
    fallback.textContent = getFallbackIcon(item.type);
    tile.insertBefore(fallback, tooltip);
  }

  // Try to extract icon for exe/lnk with auto
  if ((!item.icon || item.icon === 'auto') && (item.type === 'exe' || item.type === 'lnk')) {
    window.dock.extractIcon(item.path).then(dataUrl => {
      if (dataUrl) {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = item.name;
        tile.insertBefore(img, tooltip);
        const fallback = tile.querySelector('.fallback-icon');
        if (fallback) fallback.remove();
      }
    });
  }

  tile.addEventListener('click', (e) => {
    e.stopPropagation();
    launchItem(item);
  });

  return tile;
}

function getFallbackIcon(type) {
  const icons = { exe: '\u2699', url: '\uD83C\uDF10', folder: '\uD83D\uDCC1', shell: '\u2B1B', lnk: '\uD83D\uDD17' };
  return icons[type] || '\uD83D\uDCC4';
}

function launchItem(item) {
  const commandMap = {
    exe: 'openPath',
    lnk: 'openPath',
    folder: 'openPath',
    url: 'openExternal',
    shell: 'exec'
  };
  const action = commandMap[item.type];
  if (action) {
    window.dock.launch({ action, target: item.path });
  }
}

function toggleExpand() {
  const categories = document.getElementById('categories');
  expanded = !expanded;

  if (expanded) {
    categories.classList.add('expanded');
  } else {
    categories.classList.remove('expanded');
    closeAllCategories();
    activeCategory = null;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => recalcWindowSize());
  });
}

function toggleCategory(index) {
  const items = document.querySelectorAll('.category-items');
  const icons = document.querySelectorAll('.category-icon');

  if (activeCategory === index) {
    items[index].classList.remove('open');
    icons[index].classList.remove('active');
    activeCategory = null;
  } else {
    closeAllCategories();
    items[index].classList.add('open');
    icons[index].classList.add('active');
    activeCategory = index;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => recalcWindowSize());
  });
}

function closeAllCategories() {
  document.querySelectorAll('.category-items').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.category-icon').forEach(el => el.classList.remove('active'));
}

function recalcWindowSize() {
  if (!expanded) {
    window.dock.resizeWindow(COLLAPSED_SIZE, COLLAPSED_SIZE);
    return;
  }

  const categoryCount = config.categories.length;
  const height = COLLAPSED_SIZE + GAP + (categoryCount * (CELL_SIZE + GAP));

  let maxWidth = COLLAPSED_SIZE;
  if (activeCategory !== null) {
    const itemCount = config.categories[activeCategory].items.length;
    const itemsWidth = itemCount * (ITEM_SIZE + ITEM_GAP);
    maxWidth = CELL_SIZE + GAP + itemsWidth;
  }

  const width = Math.max(COLLAPSED_SIZE, maxWidth);
  window.dock.resizeWindow(width, height);
}

function setupDockIcon() {
  const dockIcon = document.getElementById('dock-icon');
  let startX, startY, winStartX, winStartY;

  dockIcon.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;

    isDragging = false;
    startX = e.screenX;
    startY = e.screenY;
    // Store window position at drag start
    winStartX = window.screenX;
    winStartY = window.screenY;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.screenX - startX;
      const dy = moveEvent.screenY - startY;
      if (!isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        isDragging = true;
      }
      if (isDragging && !expanded) {
        window.dock.moveWindow(winStartX + dx, winStartY + dy);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (!isDragging) {
        toggleExpand();
      }
      isDragging = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  dockIcon.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.dock.openSettings();
  });
}

init();

// Collapse dock when window loses focus (click outside)
window.addEventListener('blur', () => {
  if (expanded) {
    toggleExpand();
  }
});

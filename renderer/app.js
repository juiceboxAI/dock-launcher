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

  updateDragRegion();

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

  dockIcon.addEventListener('mousedown', (e) => {
    if (expanded) {
      // When expanded, just toggle on click (no drag)
      return;
    }
    if (e.button !== 0) return;
    isDragging = false;
    dragOffset.x = e.screenX;
    dragOffset.y = e.screenY;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.screenX - dragOffset.x;
      const dy = moveEvent.screenY - dragOffset.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDragging = true;
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

  // When expanded, click dock icon to collapse
  dockIcon.addEventListener('click', (e) => {
    if (expanded) {
      toggleExpand();
    }
  });

  dockIcon.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.dock.openSettings();
  });
}

function updateDragRegion() {
  const dockIcon = document.getElementById('dock-icon');
  if (!expanded) {
    dockIcon.style.webkitAppRegion = 'drag';
  } else {
    dockIcon.style.webkitAppRegion = 'no-drag';
  }
}

init();

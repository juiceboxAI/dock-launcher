let config = null;
let saveTimeout = null;

async function init() {
  config = await window.dock.loadConfig();
  render();
  document.getElementById('add-category').addEventListener('click', addCategory);
}

function render() {
  const container = document.getElementById('category-list');
  container.innerHTML = '';

  config.categories.forEach((cat, catIndex) => {
    const block = document.createElement('div');
    block.className = 'category-block';

    const header = document.createElement('div');
    header.className = 'category-header';

    const iconInput = document.createElement('input');
    iconInput.className = 'icon-input';
    iconInput.value = cat.icon;
    iconInput.addEventListener('change', () => {
      config.categories[catIndex].icon = iconInput.value;
      debouncedSave();
    });

    const nameInput = document.createElement('input');
    nameInput.value = cat.name;
    nameInput.placeholder = 'Category name';
    nameInput.addEventListener('change', () => {
      config.categories[catIndex].name = nameInput.value;
      debouncedSave();
    });

    const moveUpBtn = document.createElement('button');
    moveUpBtn.className = 'move-btn';
    moveUpBtn.textContent = '\u25B2';
    moveUpBtn.title = 'Move up';
    moveUpBtn.disabled = catIndex === 0;
    moveUpBtn.addEventListener('click', () => {
      if (catIndex > 0) {
        const cats = config.categories;
        [cats[catIndex - 1], cats[catIndex]] = [cats[catIndex], cats[catIndex - 1]];
        debouncedSave();
        render();
      }
    });

    const moveDownBtn = document.createElement('button');
    moveDownBtn.className = 'move-btn';
    moveDownBtn.textContent = '\u25BC';
    moveDownBtn.title = 'Move down';
    moveDownBtn.disabled = catIndex === config.categories.length - 1;
    moveDownBtn.addEventListener('click', () => {
      if (catIndex < config.categories.length - 1) {
        const cats = config.categories;
        [cats[catIndex], cats[catIndex + 1]] = [cats[catIndex + 1], cats[catIndex]];
        debouncedSave();
        render();
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '\u2715';
    deleteBtn.addEventListener('click', () => {
      config.categories.splice(catIndex, 1);
      debouncedSave();
      render();
    });

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'collapse-btn';
    collapseBtn.textContent = '\u25BC';
    collapseBtn.title = 'Toggle items';
    collapseBtn.addEventListener('click', () => {
      const body = block.querySelector('.category-body');
      const isOpen = body.classList.toggle('open');
      collapseBtn.textContent = isOpen ? '\u25BC' : '\u25B6';
    });

    header.appendChild(collapseBtn);
    header.appendChild(iconInput);
    header.appendChild(nameInput);
    header.appendChild(moveUpBtn);
    header.appendChild(moveDownBtn);
    header.appendChild(deleteBtn);
    block.appendChild(header);

    const body = document.createElement('div');
    body.className = 'category-body open';

    cat.items.forEach((item, itemIndex) => {
      body.appendChild(createItemRow(catIndex, itemIndex, item));
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-small';
    addBtn.textContent = '+ Item';
    addBtn.addEventListener('click', () => {
      config.categories[catIndex].items.push({
        name: 'New Item',
        type: 'exe',
        path: '',
        icon: 'auto'
      });
      debouncedSave();
      render();
    });
    body.appendChild(addBtn);
    block.appendChild(body);

    container.appendChild(block);
  });
}

function createItemRow(catIndex, itemIndex, item) {
  const row = document.createElement('div');
  row.className = 'item-row';

  const nameInput = document.createElement('input');
  nameInput.className = 'item-name';
  nameInput.value = item.name;
  nameInput.addEventListener('change', () => {
    config.categories[catIndex].items[itemIndex].name = nameInput.value;
    debouncedSave();
  });

  const typeSelect = document.createElement('select');
  typeSelect.className = 'item-type';
  ['exe', 'lnk', 'shell', 'url', 'folder'].forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    opt.selected = t === item.type;
    typeSelect.appendChild(opt);
  });
  typeSelect.addEventListener('change', () => {
    config.categories[catIndex].items[itemIndex].type = typeSelect.value;
    debouncedSave();
  });

  const pathInput = document.createElement('input');
  pathInput.className = 'item-path';
  pathInput.value = item.path;
  pathInput.placeholder = 'Path / URL / command';
  pathInput.addEventListener('change', () => {
    config.categories[catIndex].items[itemIndex].path = pathInput.value;
    debouncedSave();
  });

  const iconInput = document.createElement('input');
  iconInput.className = 'item-icon';
  iconInput.value = item.icon || 'auto';
  iconInput.placeholder = 'Icon path';
  iconInput.addEventListener('change', () => {
    config.categories[catIndex].items[itemIndex].icon = iconInput.value;
    debouncedSave();
  });

  const items = config.categories[catIndex].items;

  const moveUpBtn = document.createElement('button');
  moveUpBtn.className = 'move-btn';
  moveUpBtn.textContent = '\u25B2';
  moveUpBtn.title = 'Move up';
  moveUpBtn.disabled = itemIndex === 0;
  moveUpBtn.addEventListener('click', () => {
    if (itemIndex > 0) {
      [items[itemIndex - 1], items[itemIndex]] = [items[itemIndex], items[itemIndex - 1]];
      debouncedSave();
      render();
    }
  });

  const moveDownBtn = document.createElement('button');
  moveDownBtn.className = 'move-btn';
  moveDownBtn.textContent = '\u25BC';
  moveDownBtn.title = 'Move down';
  moveDownBtn.disabled = itemIndex === items.length - 1;
  moveDownBtn.addEventListener('click', () => {
    if (itemIndex < items.length - 1) {
      [items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]];
      debouncedSave();
      render();
    }
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '\u2715';
  deleteBtn.addEventListener('click', () => {
    config.categories[catIndex].items.splice(itemIndex, 1);
    debouncedSave();
    render();
  });

  row.appendChild(nameInput);
  row.appendChild(typeSelect);
  row.appendChild(pathInput);
  row.appendChild(iconInput);
  row.appendChild(moveUpBtn);
  row.appendChild(moveDownBtn);
  row.appendChild(deleteBtn);

  return row;
}

function addCategory() {
  config.categories.push({
    name: 'New Category',
    icon: '\uD83D\uDCC1',
    items: []
  });
  debouncedSave();
  render();
}

function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    window.dock.saveConfig(config);
  }, 300);
}

init();

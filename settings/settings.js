let config = null;

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
      save();
    });

    const nameInput = document.createElement('input');
    nameInput.value = cat.name;
    nameInput.placeholder = 'Category name';
    nameInput.addEventListener('change', () => {
      config.categories[catIndex].name = nameInput.value;
      save();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '\u2715';
    deleteBtn.addEventListener('click', () => {
      config.categories.splice(catIndex, 1);
      save();
      render();
    });

    header.appendChild(iconInput);
    header.appendChild(nameInput);
    header.appendChild(deleteBtn);
    block.appendChild(header);

    cat.items.forEach((item, itemIndex) => {
      block.appendChild(createItemRow(catIndex, itemIndex, item));
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
      save();
      render();
    });
    block.appendChild(addBtn);

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
    save();
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
    save();
  });

  const pathInput = document.createElement('input');
  pathInput.className = 'item-path';
  pathInput.value = item.path;
  pathInput.placeholder = 'Path / URL / command';
  pathInput.addEventListener('change', () => {
    config.categories[catIndex].items[itemIndex].path = pathInput.value;
    save();
  });

  const iconInput = document.createElement('input');
  iconInput.className = 'item-icon';
  iconInput.value = item.icon || 'auto';
  iconInput.placeholder = 'Icon path';
  iconInput.addEventListener('change', () => {
    config.categories[catIndex].items[itemIndex].icon = iconInput.value;
    save();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '\u2715';
  deleteBtn.addEventListener('click', () => {
    config.categories[catIndex].items.splice(itemIndex, 1);
    save();
    render();
  });

  row.appendChild(nameInput);
  row.appendChild(typeSelect);
  row.appendChild(pathInput);
  row.appendChild(iconInput);
  row.appendChild(deleteBtn);

  return row;
}

function addCategory() {
  config.categories.push({
    name: 'New Category',
    icon: '\uD83D\uDCC1',
    items: []
  });
  save();
  render();
}

async function save() {
  await window.dock.saveConfig(config);
}

init();

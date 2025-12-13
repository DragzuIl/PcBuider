const categoryNames = {
    cpu: "Процессоры",
    motherboard: "Материнские платы",
    gpu: "Видеокарты",
    ram: "Оперативная память",
    storage: "Накопители",
    psu: "Блоки питания",
    case: "Корпуса"
};

const container = document.getElementById("componentsContainer");
const categoryTabs = document.querySelectorAll(".category-tab");
let activeCategory = "cpu"; // дефолт

categoryTabs.forEach(btn => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.category;
    setActiveCategory(cat);
  });
});

function setActiveCategory(cat) {
  activeCategory = cat;

  categoryTabs.forEach(b => {
    b.classList.toggle("active", b.dataset.category === cat);
  });

  document.querySelectorAll(".category-block").forEach(block => {
    const blockCat = block.getAttribute("data-cat");
    block.style.display = blockCat === cat ? "block" : "none";
  });
}


const build = {};
const allComponentsByCategory = {};

const buildListElement = document.getElementById("buildList");
const totalPriceElement = document.getElementById("totalPrice");
const statusElement = document.getElementById("status");
const clearButton = document.getElementById("clearBuild");
const searchInput = document.getElementById("searchInput");

let searchQuery = "";
let selectedPurpose = "";
let maxPriceLimit = 0;

document.getElementById("applyPriceBtn").addEventListener("click", () => {
    maxPriceLimit = Number(maxPriceInput.value);
    if (!maxPriceLimit || maxPriceLimit <= 0) {
        maxPriceLimit = 0;
    }
    reloadAllCategories();
});

document.addEventListener("DOMContentLoaded", () => {
  const savedBuild = localStorage.getItem("pcBuild");
  if (savedBuild) Object.assign(build, JSON.parse(savedBuild));

  Object.keys(categoryNames).forEach(cat => {
    const categoryBlock = document.createElement("div");
    categoryBlock.classList.add("category-block");
    categoryBlock.setAttribute("data-cat", cat);

    const titleWrapper = document.createElement("div");
    titleWrapper.style.display = "flex";
    titleWrapper.style.justifyContent = "space-between";
    titleWrapper.style.alignItems = "center";

    const title = document.createElement("h2");
    title.textContent = categoryNames[cat];
    titleWrapper.appendChild(title);

    const addBtn = document.createElement("button");
    addBtn.textContent = `Добавить ${categoryNames[cat].toLowerCase()}`;
    addBtn.classList.add("add-component-btn");
    addBtn.addEventListener("click", () => {
      openEditModal(cat);
    });
    titleWrapper.appendChild(addBtn);

    categoryBlock.appendChild(titleWrapper);

    const grid = document.createElement("div");
    grid.classList.add("grid");
    categoryBlock.appendChild(grid);

    container.appendChild(categoryBlock);

    loadCategory(cat);
  });

  setActiveCategory("cpu");   // ← показываем только CPU
  renderBuild();
});


// CPU form

const editFormModal = document.getElementById("editFormModal");
const closeEditFormModal = document.getElementById("closeEditFormModal");
const editForm = document.getElementById("editForm");
const editFormTitle = document.getElementById("editFormTitle");
const editFormFields = document.getElementById("editFormFields");
let editFormMode = "create";

function openEditModal(category, component = null) {
    editFormMode = component ? "edit" : "create";

    editForm.reset();
    editFormFields.innerHTML = "";

    editForm.elements.category.value = category;
    editForm.elements.id.value = component ? component.id : "";

    const config = categoryFieldConfigs[category];
    if (!config) return;

    config.forEach(field => {
        const wrapper = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = field.label;
        wrapper.appendChild(label);

        const input = document.createElement("input");
        input.name = field.name;
        input.type = field.type;
        if (field.step) input.step = field.step;
        input.required = true;

        if (component && component[field.name] != null) {
            input.value = component[field.name];
        }

        wrapper.appendChild(input);
        editFormFields.appendChild(wrapper);
    });

    editFormTitle.textContent =
        editFormMode === "edit"
            ? `Изменение: ${categoryNames[category]}`
            : `Новый компонент: ${categoryNames[category]}`;

    editFormModal.classList.add("show");
}

closeEditFormModal.addEventListener("click", () =>
    editFormModal.classList.remove("show")
);

window.addEventListener("click", e => {
    if (e.target === editFormModal) editFormModal.classList.remove("show");
});

const notification = document.getElementById("notification");

function showNotification(msg, duration = 3000) {
    notification.textContent = msg;
    notification.classList.add("show");
    setTimeout(() => notification.classList.remove("show"), duration);
}


editForm.addEventListener("submit", async e => {
    e.preventDefault();

    const formData = new FormData(editForm);
    const id = formData.get("id");
    const category = formData.get("category");

    const payload = {};
    for (const [key, value] of formData.entries()) {
        if (key === "id" || key === "category") continue;

        const cfg = categoryFieldConfigs[category].find(f => f.name === key);
        if (cfg && cfg.type === "number") {
            payload[key] = value === "" ? null : Number(value);
        } else {
            payload[key] = value;
        }
    }

    const isEdit = editFormMode === "edit";

    const url = isEdit
        ? `${window.location.origin}/api/components/${category}/${id}`
        : `${window.location.origin}/api/components/${category}`;

    const method = isEdit ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Ошибка ответа сервера");

        showNotification(
            isEdit ? "Компонент обновлён ✅" : "Компонент добавлен ✅"
        );
        editFormModal.classList.remove("show");
        reloadAllCategories();
    } catch (err) {
        console.error(err);
        showNotification(
            isEdit ? "Ошибка при обновлении компонента" : "Ошибка при добавлении компонента"
        );
    }
});


// Load components

async function loadCategory(category) {
    try {
        const res = await fetch(`${window.location.origin}/api/components/${category}`);
        let components = await res.json();
        allComponentsByCategory[category] = components.slice();

        const prices = components.map(c => c.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const lowBorder = minPrice + (maxPrice - minPrice) * 0.33;
        const midBorder = minPrice + (maxPrice - minPrice) * 0.66;

        components = components.filter(c => isComponentCompatible(category, c, build));

        if (searchQuery) {
            components = components.filter(c =>
                c.name.toLowerCase().includes(searchQuery)
            );
        }

        components = components.filter(c =>
            filterByPurposeAndBudget(c, category, minPrice, lowBorder, midBorder)
        );

        const categoryBlock = document.querySelector(`[data-cat="${category}"]`);
        const grid = categoryBlock.querySelector(".grid");
        grid.innerHTML = "";

        const title = categoryBlock.querySelector("h2");
        title.textContent = build[category]
            ? `${categoryNames[category]} - ${build[category].name}`
            : categoryNames[category];

        components.forEach(component => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
  <h3>${component.name}</h3>
  <p>Цена: ${component.price} ₽</p>
  <div class="card-buttons">
    <button class="details-btn">Подробнее</button>
    <button class="edit-btn">Редактировать</button>
  </div>
`;


            card.querySelector(".details-btn").addEventListener("click", () => {
                console.log("component in modal:", component);
                showModal(component, category);
            });

            card.querySelector(".edit-btn").addEventListener("click", () => {
                openEditModal(category, component);
            });


            grid.appendChild(card);
        });
    } catch (err) {
        console.error(`Ошибка загрузки категории ${category}:`, err);
    }
}

const categoryFieldConfigs = {
    cpu: [
        { name: "name", label: "Название", type: "text" },
        { name: "cores", label: "Ядра", type: "number" },
        { name: "threads", label: "Потоки", type: "number" },
        { name: "frequency", label: "Частота (ГГц)", type: "number", step: "0.1" },
        { name: "socket", label: "Сокет", type: "text" },
        { name: "price", label: "Цена", type: "number" }
    ],
    motherboard: [
        { name: "name", label: "Название", type: "text" },
        { name: "socket", label: "Сокет", type: "text" },
        { name: "form_factor", label: "Форм-фактор", type: "text" },
        { name: "max_ram", label: "Максимальная память (ГБ)", type: "number" },
        { name: "ram_type", label: "Тип памяти", type: "text" },
        { name: "price", label: "Цена", type: "number" }
    ],
    gpu: [
        { name: "name", label: "Название", type: "text" },
        { name: "vram", label: "VRAM (ГБ)", type: "number" },
        { name: "price", label: "Цена", type: "number" }
    ],
    ram: [
        { name: "name", label: "Название", type: "text" },
        { name: "size", label: "Объём (ГБ)", type: "number" },
        { name: "frequency", label: "Частота (МГц)", type: "number" },
        { name: "ram_type", label: "Тип памяти", type: "text" },
        { name: "price", label: "Цена", type: "number" }
    ],
    storage: [
        { name: "name", label: "Название", type: "text" },
        { name: "type", label: "Тип (SSD/HDD)", type: "text" },
        { name: "size_gb", label: "Объём (ГБ)", type: "number" },
        { name: "price", label: "Цена", type: "number" }
    ],
    psu: [
        { name: "name", label: "Название", type: "text" },
        { name: "wattage", label: "Мощность (Вт)", type: "number" },
        { name: "certificate", label: "Сертификат", type: "text" },
        { name: "price", label: "Цена", type: "number" }
    ],
    case: [
        { name: "name", label: "Название", type: "text" },
        { name: "form_factor_support", label: "Поддерживаемые форм-факторы", type: "text" },
        { name: "towerType", label: "Тип корпуса", type: "text" },
        { name: "price", label: "Цена", type: "number" }
    ]
};

// Build

function addToBuild(category, component) {
    build[category] = component;

    renderBuild();
    saveBuild();

    reloadAllCategories();
}

function checkCompatibility(build) {
    let issues = [];

    if (build.cpu && build.motherboard) {
        if (build.cpu.socket !== build.motherboard.socket) {
            issues.push(
                `Сокет CPU (${build.cpu.socket}) не совместим с материнской платой (${build.motherboard.socket})`
            );
        }
    }

    if (build.motherboard && build.case) {
        if (!build.case.form_factor_support.includes(build.motherboard.form_factor)) {
            issues.push(
                `Форм-фактор материнской платы (${build.motherboard.form_factor}) не подходит для корпуса`
            );
        }
    }

    if (build.ram && build.motherboard) {
        if (build.ram.ram_type !== build.motherboard.ram_type) {
            issues.push(`Тип RAM (${build.ram.ram_type}) не совместим`);
        }
        if (build.ram.size_gb > build.motherboard.max_ram) {
            issues.push(`RAM (${build.ram.size_gb}GB) превышает максимум`);
        }
    }

    return issues;
}

function renderBuild() {
    buildListElement.innerHTML = "";
    const allComponentsByCategory = {};

    Object.keys(build).forEach(cat => {
        const item = build[cat];
        const li = document.createElement("li");
        li.textContent = `${categoryNames[cat]}: ${item.name} - ${item.price} ₽`;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "X";
        removeBtn.style.marginLeft = "10px";
        removeBtn.addEventListener("click", () => {
            delete build[cat];
            renderBuild();
            saveBuild();
            reloadAllCategories();
        });

        li.appendChild(removeBtn);
        buildListElement.appendChild(li);
    });

    const totalPrice = Object.values(build).reduce((s, i) => s + i.price, 0);
    totalPriceElement.textContent = totalPrice;

    const issues = checkCompatibility(build);

    if (issues.length === 0) {
        statusElement.textContent = "Все компоненты совместимы ✅";
        statusElement.style.color = "green";
    } else {
        statusElement.textContent = issues.join("; ");
        statusElement.style.color = "red";
    }
}

clearButton.addEventListener("click", () => {
    for (let key in build) delete build[key];
    renderBuild();
    saveBuild();
    reloadAllCategories();
});

// Details modal

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalDetails = document.getElementById("modalDetails");
const modalPrice = document.getElementById("modalPrice");
const closeModal = document.getElementById("closeModal");

const fieldLabels = {
    name: "Название",
    price: "Цена",
    socket: "Сокет",
    socket_id: "Сокет процессора",
    form_factor: "Форм-фактор",
    max_ram: "Максимальная память (ГБ)",
    ram_type: "Тип памяти",
    length_mm: "Длина GPU",
    power_w: "Мощность блока питания",
    size_gb: "Объём накопителя (ГБ)",
    vram: "Видеопамять (ГБ)",
    certificate: "Сертификат",
    cores: "Количество ядер",
    threads: "Количество потоков",
    frequency: "Частота (ГГц)",
    size: "Объём памяти (ГБ)",
    type: "Тип накопителя",
    form_factor_support: "Поддерживаемые форм-факторы",
    wattage: "Мощность (Вт)",
    "tower-type": "Тип корпуса"
};



function showModal(component, category) {
    modalTitle.textContent = component.name;

    let html = "";
    for (let key in component) {
        if (["id", "name", "price", "socket_id"].includes(key)) continue;
        const label = fieldLabels[key] || key;
        html += `<strong>${label}:</strong> ${component[key]}<br>`;
    }
    modalDetails.innerHTML = html;
    modalPrice.textContent = component.price;

    modal.classList.add("show");

    const oldBtn = document.getElementById("modalAddButton");
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    newBtn.addEventListener("click", () => {
        const msg = build[category]
            ? `${build[category].name} заменён на ${component.name} ✅`
            : `${component.name} добавлен в сборку ✅`;

        addToBuild(category, component);
        showNotification(msg);
        modal.classList.remove("show");
    });
}





closeModal.addEventListener("click", () => modal.classList.remove("show"));
window.addEventListener("click", e => e.target === modal && modal.classList.remove("show"));
window.addEventListener("keydown", e => e.key === "Escape" && modal.classList.remove("show"));

// Filters

document.getElementById("purposeSelect").addEventListener("change", e => {
    selectedPurpose = e.target.value;
    reloadAllCategories();
});

function reloadAllCategories() {
    Object.keys(categoryNames).forEach(cat => loadCategory(cat));
}

function filterByPurposeAndBudget(component, category, minPrice, lowBorder, midBorder) {
    if (maxPriceLimit > 0 && component.price > maxPriceLimit) return false;

    if (selectedPurpose === "gaming") {
        if (category === "gpu" && component.vram < 6) return false;
        if (category === "cpu" && component.cores < 4) return false;
    }

    if (selectedPurpose === "office") {
        if (category === "cpu" && component.cores < 2) return false;
    }

    if (selectedPurpose === "production") {
        if (category === "cpu" && component.cores < 8) return false;
        if (category === "ram" && component.size_gb < 16) return false;
        if (category === "gpu" && component.vram < 8) return false;
    }

    if (selectedPurpose === "universal") {
        if (category === "cpu" && component.cores < 4) return false;
        if (category === "gpu" && component.vram < 4) return false;
    }

    return true;
}

// Compatibility

function isComponentCompatible(category, component, build) {
    if (Object.keys(build).length === 0) return true;

    if (category === "cpu") {
        if (build.motherboard && component.socket_id !== build.motherboard.socket_id) {
            return false;
        }

        if (!build.motherboard && build.case) {
            const motherboards = allComponentsByCategory.motherboard || [];
            const hasBoardForThisCpu = motherboards.some(mb =>
                mb.socket_id === component.socket_id &&
                build.case.form_factor_support.includes(mb.form_factor)
            );
            if (!hasBoardForThisCpu) return false;
        }
    }

    if (category === "motherboard") {
        if (build.cpu && component.socket_id !== build.cpu.socket_id) {
            return false;
        }

        if (build.case &&
            !build.case.form_factor_support.includes(component.form_factor)) {
            return false;
        }
    }

    if (category === "case" && build.motherboard) {
        if (!component.form_factor_support.includes(build.motherboard.form_factor))
            return false;
    }

    if (category === "motherboard" && build.case) {
        if (!build.case.form_factor_support.includes(component.form_factor))
            return false;
    }

    if (category === "ram" && build.motherboard) {
        if (component.ram_type !== build.motherboard.ram_type) return false;
        if (component.size_gb > build.motherboard.max_ram) return false;
    }

    return true;
}


// Search

searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.toLowerCase();
    reloadAllCategories();
});

// Save

function saveBuild() {
    localStorage.setItem("pcBuild", JSON.stringify(build));
}

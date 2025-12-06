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

// Сборка пользователя: ключ — категория, значение — выбранный компонент
const build = {};

// Элементы интерфейса
const buildListElement = document.getElementById("buildList");
const totalPriceElement = document.getElementById("totalPrice");
const statusElement = document.getElementById("status");
const clearButton = document.getElementById("clearBuild");

// Создаем контейнеры для всех категорий заранее
document.addEventListener("DOMContentLoaded", () => {
    // Загружаем сборку из localStorage
    const savedBuild = localStorage.getItem("pcBuild");
    if (savedBuild) {
        Object.assign(build, JSON.parse(savedBuild));
    }

    // Создаем контейнеры категорий только один раз и загружаем компоненты
    Object.keys(categoryNames).forEach(cat => {
        const categoryBlock = document.createElement("div");
        categoryBlock.classList.add("category-block");
        categoryBlock.setAttribute("data-cat", cat);

        const title = document.createElement("h2");
        title.textContent = categoryNames[cat];
        categoryBlock.appendChild(title);

        const grid = document.createElement("div");
        grid.classList.add("grid");
        categoryBlock.appendChild(grid);

        container.appendChild(categoryBlock);

        // Загружаем компоненты категории
        loadCategory(cat);
    });

    // Отрисовываем текущую сборку
    renderBuild();
});




async function loadCategory(category) {
    try {
        const res = await fetch(`${window.location.origin}/api/components/${category}`);
        let components = await res.json();

        // Фильтрация по совместимости
        components = components.filter(component =>
            isComponentCompatible(category, component, build)
        );

        // 🔍 Фильтрация по поиску
        if (searchQuery.trim() !== "") {
            components = components.filter(c =>
                c.name.toLowerCase().includes(searchQuery)
            );
        }

        // Получаем уже существующий блок
        const categoryBlock = document.querySelector(`[data-cat="${category}"]`);
        const grid = categoryBlock.querySelector(".grid");

        // Очищаем старое содержимое
        grid.innerHTML = "";

        // Обновляем заголовок категории с индикатором
        const title = categoryBlock.querySelector("h2");
        if (build[category]) {
            title.textContent = `${categoryNames[category]} - ${build[category].name}`; // добавляем галочку
        } else {
            title.textContent = categoryNames[category];
        }

        components.forEach(component => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <h3>${component.name}</h3>
                <p>Цена: ${component.price} ₽</p>
                <button>Подробнее</button>
            `;

            card.querySelector("button").addEventListener("click", () => {
                showModal(component, category);
            });

            grid.appendChild(card);
        });

    } catch (err) {
        console.error(`Ошибка загрузки категории ${category}:`, err);
    }
}




function addToBuild(category, component) {
    // Добавляем или заменяем компонент в категории
    build[category] = component;

    renderBuild();
    saveBuild();

    // Перезагружаем категории с фильтром
    Object.keys(categoryNames).forEach(cat => loadCategory(cat));
}

function checkCompatibility(build) {
    let issues = [];

    // Проверка сокета CPU и материнской платы
    if (build.cpu && build.motherboard) {
        if (build.cpu.socket !== build.motherboard.socket) {
            issues.push(`Сокет CPU (${build.cpu.socket}) не совместим с материнской платой (${build.motherboard.socket})`);
        }
    }

    // Проверка форм-фактора материнской платы и корпуса
    if (build.motherboard && build.case) {
        if (!build.case.form_factor_support.includes(build.motherboard.form_factor)) {
            issues.push(`Форм-фактор материнской платы (${build.motherboard.form_factor}) не подходит для корпуса (${build.case.form_factor})`);
        }
    }

    // Проверка RAM (максимальная поддерживаемая память материнской платы)
    if (build.ram && build.motherboard) {
        if (build.ram.size_gb > build.motherboard.max_ram) {
            issues.push(`RAM (${build.ram.size_gb}GB) превышает максимальную поддерживаемую память материнской платы (${build.motherboard.max_ram}GB)`);
        }
    }

    // Проверка RAM (тип RAM и поддерживаемый тип материнской платы)
    if (build.ram && build.motherboard) {
        if (build.ram.ram_type !== build.motherboard.ram_type) {
            issues.push(`Тип RAM (${build.ram.ram_type}) не совместим с материнской платой (${build.motherboard.ram_type})`);
        }
    }
    // Можно добавить другие проверки:
    // GPU и корпус (длина GPU и место в корпусе)
    // PSU и суммарная потребляемая мощность комплектующих
    // Количество слотов RAM и материнской платы и т.д.

    return issues;
}

function renderBuild() {
    buildListElement.innerHTML = "";

    Object.keys(build).forEach(cat => {
        const item = build[cat];
        const li = document.createElement("li");
        li.textContent = `${categoryNames[cat] || cat}: ${item.name} - ${item.price} ₽`;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "X";
        removeBtn.style.marginLeft = "10px";
        removeBtn.addEventListener("click", () => {
            delete build[cat];
            renderBuild();
            saveBuild();

            // Перезагружаем категории с фильтром
            Object.keys(categoryNames).forEach(cat => loadCategory(cat));
        });

        li.appendChild(removeBtn);
        buildListElement.appendChild(li);
    });

    const totalPrice = Object.values(build).reduce((sum, item) => sum + item.price, 0);
    totalPriceElement.textContent = totalPrice;

    // Проверка совместимости
    const issues = checkCompatibility(build);
    if (issues.length === 0) {
        statusElement.textContent = "Все компоненты совместимы ✅";
        statusElement.style.color = "green";
    } else {
        statusElement.textContent = issues.join("; ");
        statusElement.style.color = "red";
    }
}


// Очистка всей сборки
clearButton.addEventListener("click", () => {
    for (let key in build) delete build[key];
    renderBuild();
    saveBuild();
    Object.keys(categoryNames).forEach(cat => loadCategory(cat));
});




// Модальное окно
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalDetails = document.getElementById("modalDetails");
const modalPrice = document.getElementById("modalPrice");
const modalAddButton = document.getElementById("modalAddButton");
const closeModal = document.getElementById("closeModal");

// Настраиваемые подписи для полей
const fieldLabels = {
    name: "Название",
    price: "Цена",
    socket: "Сокет процессора",
    form_factor: "Форм-фактор",
    max_ram: "Максимальная память (ГБ)",
    ram_type: "Тип памяти",
    length_mm: "Длина GPU",
    power_w: "Мощность блока питания",
    size: "Объём памяти (ГБ)",
    threads: "Количество потоков",
    cores: "Количество ядер",
    size_gb: "Объём накопителя (ГБ)",
    type: "Тип накопителя",
    frequency: "Частота (МГц)",
    vram: "Объём видеопамяти (ГБ)",
    wattage: "Мощность (Вт)",
    certificate: "Сертификат эффективности",
    "form_factor_support": "Поддерживаемые форм-факторы",
    "tower-type": "Тип корпуса",
    // и т.д.
    // можно добавить другие поля
};

const notification = document.getElementById("notification");

function showNotification(message, duration = 3000) {
    notification.textContent = message;
    notification.classList.add("show");

    // Скрываем через duration
    setTimeout(() => {
        notification.classList.remove("show");
    }, duration);
}

function showModal(component, category) {
    modalTitle.textContent = component.name;

    let details = "";
    for (let key in component) {
        if (key !== "id" && key !== "name" && key !== "price") {
            const label = fieldLabels[key] || key;
            details += `<strong>${label}:</strong> ${component[key]}<br>`;
        }
    }
    modalDetails.innerHTML = details;
    modalPrice.textContent = component.price;

    // Показываем модалку
    modal.classList.add("show");

    // Убираем старый обработчик кнопки
    modalAddButton.replaceWith(modalAddButton.cloneNode(true));
    const newButton = document.getElementById("modalAddButton");

    // Добавляем новый обработчик один раз
    newButton.addEventListener("click", () => {
        let message = "";

        // Проверяем, есть ли уже компонент в этой категории
        if (build[category]) {
            message = `${build[category].name} заменён на ${component.name} ✅`;
        } else {
            message = `${component.name} добавлен в сборку ✅`;
        }

        addToBuild(category, component);

        // Показываем уведомление
        showNotification(message);

        // Закрываем модалку
        modal.classList.remove("show");
    }, { once: true });
}

// Закрытие модалки по крестику
closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
});

// Закрытие модалки при клике по свободной области
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("show");
    }
});

// Закрытие модалки при нажатии Escape
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        modal.classList.remove("show");
    }
});

function isComponentCompatible(category, component, build) {

    // Если сборка пуста → показываем все компоненты
    if (Object.keys(build).length === 0) return true;

    // Проверяем совместимость CPU ↔ motherboard
    if (category === "motherboard" && build.cpu) {
        if (component.socket !== build.cpu.socket) return false;
    }
    if (category === "cpu" && build.motherboard) {
        if (component.socket !== build.motherboard.socket) return false;
    }

    // Case ↔ motherboard
    if (category === "case" && build.motherboard) {
        if (!component.form_factor_support.includes(build.motherboard.form_factor))
            return false;
    }
    if (category === "motherboard" && build.case) {
        if (!build.case.form_factor_support.includes(component.form_factor))
            return false;
    }

    // RAM type
    if (category === "ram" && build.motherboard) {
        if (component.ram_type !== build.motherboard.ram_type) return false;
    }
    if (category === "motherboard" && build.ram) {
        if (build.ram.ram_type !== component.ram_type) return false;
    }

    // RAM size
    if (category === "ram" && build.motherboard) {
        if (component.size_gb > build.motherboard.max_ram) return false;
    }

    return true;
}

const searchInput = document.getElementById("searchInput");

let searchQuery = "";

searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.toLowerCase();
    Object.keys(categoryNames).forEach(cat => loadCategory(cat));
});

function saveBuild() {
    localStorage.setItem("pcBuild", JSON.stringify(build));
}


document.addEventListener("DOMContentLoaded", () => {
    Object.keys(categoryNames).forEach(cat => loadCategory(cat));
});







const data = {};
const build = { cpu:null, motherboard:null, ram:null, gpu:null, storage:null, psu:null, case:null };

async function loadData() {
    const categories = ["cpu","motherboard","ram","gpu","storage","psu","case"];
    for (let c of categories) {
        const res = await fetch(`http://localhost:3000/api/components/${c}`);
        data[c] = await res.json();
    }
    renderComponents();
}

function renderComponents() {
    const container = document.getElementById('components');
    container.innerHTML = '';
    for (let category in data) {
        data[category].forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${item.name}</h3>
                <p>Цена: ${item.price}$</p>
                <button onclick="selectComponent('${category}', ${item.id})">Выбрать</button>
            `;
            container.appendChild(card);
        });
    }
}

async function selectComponent(category, id) {
    const res = await fetch(`http://localhost:3000/api/components/${category}`);
    const items = await res.json();
    build[category] = items.find(i => i.id === id);
    updateBuild();
}

function updateBuild() {
    const list = document.getElementById('buildList');
    const priceEl = document.getElementById('totalPrice');
    list.innerHTML = '';
    let total = 0;
    for (let key in build) {
        if (build[key]) {
            const li = document.createElement('li');
            li.textContent = `${build[key].name} — ${build[key].price}$`;
            list.appendChild(li);
            total += build[key].price;
        }
    }
    priceEl.textContent = total;
    checkCompatibility();
}

function checkCompatibility() {
    const status = document.getElementById('status');

    if(build.cpu && build.motherboard && build.cpu.socket !== build.motherboard.socket){
        status.textContent = '⚠️ CPU и материнская плата несовместимы!';
        status.style.color = 'red';
        return;
    }

    if(build.ram && build.motherboard && build.ram.type !== build.motherboard.ramType){
        status.textContent = '⚠️ Тип RAM не подходит к материнской плате!';
        status.style.color = 'red';
        return;
    }

    status.textContent = '✔ Всё совместимо';
    status.style.color = 'green';
}

loadData();

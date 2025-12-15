import { elements, state, getLocalISODate } from './store.js';
import { renderTasks } from './tasks.js'; // showConfirm uses renderTasks? No, deleteProject does.
// showConfirm takes a callback.

// === MOON LOGIC ===
export function getMoonPhase(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();
    let c = 0, e = 0, jd = 0, b = 0;
    if (month < 3) { year--; month += 12; }
    ++c; c = 365.25 * year; e = 30.6 * (month + 1);
    jd = c + e + day - 694039.09; jd /= 29.5305882;
    b = parseInt(jd); jd -= b; b = Math.round(jd * 8);
    if (b >= 8) b = 0;

    const detailsNova = {
        planting: 'A seiva desce para as raízes. ideal para plantas de raiz (cenoura, mandioca) e bulbos. Ótimo para adubação.',
        pruning: 'Melhor fase para podas de limpeza e renovação.',
        harvest: 'Colheita de raízes, madeira e bambu.'
    };
    const detailsCrescente = {
        planting: 'A seiva sobe. Plante tomate, pimentão, feijão, milho e frutíferas.',
        pruning: 'Poda de formação (estimula brotos). Evite podas drásticas.',
        harvest: 'Ervas medicinais e folhas.'
    };
    const detailsCheia = {
        planting: 'Seiva na copa. Plante folhas (alface) e flores. Regue bem.',
        pruning: 'NÃO indicada (risco de hemorragia). Apenas colheita de flores.',
        harvest: 'Frutas suculentas e grãos.'
    };
    const detailsMinguante = {
        planting: 'Força volta para raízes. Batata, mandioca e replantio de mudas.',
        pruning: 'Poda principal (frutificação). Cicatrização rápida.',
        harvest: 'Sementes (milho, feijão) para guardar e palha.'
    };

    const phases = [
        { name: 'Lua Nova', icon: '🌑', tip: 'Energia nas raízes. Tempo de planejar.', details: detailsNova },
        { name: 'Lua Crescente', icon: '🌒', tip: 'A seiva sobe. Tempo de plantar.', details: detailsCrescente },
        { name: 'Quarto Crescente', icon: '🌓', tip: 'A seiva sobe. Tempo de plantar.', details: detailsCrescente },
        { name: 'Crescente Gibosa', icon: '🌔', tip: 'Aceleração máxima.', details: detailsCrescente },
        { name: 'Lua Cheia', icon: '🌕', tip: 'Energia nas folhas/frutos.', details: detailsCheia },
        { name: 'Minguante Gibosa', icon: '🌖', tip: 'Diminuindo a força.', details: detailsMinguante },
        { name: 'Quarto Minguante', icon: '🌗', tip: 'Seiva descendo. Poda e raízes.', details: detailsMinguante },
        { name: 'Lua Minguante', icon: '🌘', tip: 'Repouso da terra.', details: detailsMinguante }
    ];
    return phases[b];
}

export function openMoonModal(phase) {
    elements.moonModalTitle.innerHTML = `${phase.icon} ${phase.name}`;
    elements.moonModalContent.innerHTML = `
        <p class="moon-detail-intro"><strong>Fase Atual:</strong> ${phase.name}</p>
        <div class="moon-detail-section">
            <div class="section-flex-header"><h4>🌱 No Plantio</h4></div>
            <p>${phase.details.planting}</p>
        </div>
        <div class="moon-detail-section">
            <div class="section-flex-header"><h4>✂️ Nas Podas</h4></div>
            <p>${phase.details.pruning}</p>
        </div>
        <div class="moon-detail-section">
            <div class="section-flex-header"><h4>🍯 Na Colheita</h4></div>
            <p>${phase.details.harvest}</p>
        </div>
    `;
    elements.moonModal.classList.add('visible');
}

// === GENERIC UI ===
export function showConfirm(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');
    const btnOk = document.getElementById('btnOkConfirm');
    const btnCancel = document.getElementById('btnCancelConfirm');

    titleEl.textContent = title;
    msgEl.textContent = message;

    modal.classList.add('visible');

    // Clean up previous listeners
    const newOk = btnOk.cloneNode(true);
    const newCancel = btnCancel.cloneNode(true);
    btnOk.parentNode.replaceChild(newOk, btnOk);
    btnCancel.parentNode.replaceChild(newCancel, btnCancel);

    newOk.addEventListener('click', () => {
        modal.classList.remove('visible');
        onConfirm();
    });

    newCancel.addEventListener('click', () => {
        modal.classList.remove('visible');
    });
}

export function toggleModal(show) {
    if (show) {
        if (!state.editingId) {
            elements.modal.querySelector('h2').textContent = 'Nova Tarefa';
            elements.taskForm.reset();
        }
        elements.modal.classList.add('visible');
    } else {
        elements.modal.classList.remove('visible');
        state.editingId = null;
    }
}

export function toggleProjectModal(show) {
    if (show) {
        elements.inputs.projStartDate.value = getLocalISODate(new Date());
        elements.projectModal.classList.add('visible');
    } else {
        elements.projectModal.classList.remove('visible');
    }
}

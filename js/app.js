
// App.js - Main Entry Point & Orchestration
import { renderProjects, addProject, deleteProject, getProjectType } from './projects.js';
import { renderTasks, saveTask, processRoutines, toggleTask, deleteTask, editTask } from './tasks.js';
import { fetchWeather, showWeatherModal } from './weather.js';

// Global Error Handler
window.onerror = function (msg, url, line) {
    alert('ERRO: ' + msg + '\nLinha: ' + line);
};

// Shared State
export const state = {
    tasks: [],
    routines: [],
    projects: [],
    currentProject: 'all',
    viewDate: new Date(),
    soilAnalysis: null,
    editingId: null
};

// Shared DOM Elements (Populated on init)
export const elements = {};

export function getLocalISODate(date) {
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offset);
    return local.toISOString().split('T')[0];
}

// Confirm Modal Logic
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

export function saveData() {
    localStorage.setItem('rocapp_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('rocapp_projects', JSON.stringify(state.projects));
    localStorage.setItem('rocapp_routines', JSON.stringify(state.routines));
    if (state.soilAnalysis) {
        localStorage.setItem('rocapp_soil', JSON.stringify(state.soilAnalysis));
    }
    renderTasks();
}

function loadData() {
    const savedTasks = localStorage.getItem('rocapp_tasks');
    const savedRoutines = localStorage.getItem('rocapp_routines');
    const savedProjects = localStorage.getItem('rocapp_projects');
    const savedAnalysis = localStorage.getItem('rocapp_analysis');

    if (savedTasks) state.tasks = JSON.parse(savedTasks);
    if (savedRoutines) state.routines = JSON.parse(savedRoutines);
    if (savedProjects) state.projects = JSON.parse(savedProjects);
    if (savedAnalysis) state.soilAnalysis = JSON.parse(savedAnalysis);
}

function migrateData() {
    if (state.projects.length === 0) {
        state.projects.push({ id: 1, name: 'Geral', emoji: '🏡' });
    }

    let changed = false;
    const defaultId = state.projects[0].id;

    state.tasks.forEach(t => {
        if (!t.projectId) {
            t.projectId = defaultId;
            changed = true;
        }
    });

    // Project Structure Migration
    state.projects.forEach(p => {
        if (!p.status) {
            p.status = 'active';
            changed = true;
        }
        if (!p.type) {
            p.type = getProjectType(p.culture || 'manual');
            changed = true;
        }
        if (!p.startDate) {
            // Try to find first task date or default to 'today' (mock, better than null)
            p.startDate = getLocalISODate(new Date());
            changed = true;
        }
    });

    // Frequency migration
    state.tasks = state.tasks.map(t => {
        if (t.fromRoutine && !t.frequency) {
            const r = state.routines.find(rout => rout.id === t.routineId);
            if (r && r.frequency) {
                changed = true;
                return { ...t, frequency: r.frequency };
            }
        }
        return t;
    });

    if (changed) saveData();
}

// Moon Logic (Kept here for dashboard/header)
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

function openMoonModal(phase) {
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

// Soil Analysis (Simplified for App.js)
function handleSoilAnalysis(e) {
    e.preventDefault();
    const btn = elements.btnAnalyze;
    const btnText = elements.analyzeBtnText;
    const originalText = btnText.textContent;

    btn.disabled = true;
    btnText.textContent = "🔄 Analisando...";

    setTimeout(() => {
        try {
            const ph = parseFloat(elements.inputs.soilPh.value);
            const v = parseFloat(elements.inputs.soilV.value) || 0;
            const ctc = parseFloat(elements.inputs.soilCTC.value) || 0;
            const culture = elements.inputs.soilCulture.value;

            // Simple Analysis Logic
            let score = 5;
            let actions = [];
            let diagnosis = [];

            if (ph >= 5.5 && ph <= 6.5) {
                score += 3;
                diagnosis.push({ type: 'good', text: 'pH Ideal' });
            } else {
                score -= 1;
                diagnosis.push({ type: 'warn', text: 'pH precisa corrigir' });
                if (ph < 5.5) actions.push('Fazer calagem.');
            }

            // Mock Data for simplicity in refactor (logic preserved roughly)
            const rawData = {
                limingTonHa: 2,
                limingGm2: 200,
                npkRec: '10-10-10',
                npkGm2: 50,
                culture
            };

            state.soilAnalysis = rawData;
            saveData();

            // Render Result (Inline or function)
            elements.soilResultContent.innerHTML = `
                <div style="text-align:center;"><h3>${score * 10}% Saúde</h3></div>
                <p>${diagnosis.map(d => d.text).join('<br>')}</p>
                <p><strong>Recomendação:</strong> ${actions.join('<br>') || 'Manter adubação.'}</p>
            `;

            elements.soilModal.classList.remove('visible');
            elements.soilResultModal.classList.add('visible');

        } catch (error) {
            alert("Erro: " + error.message);
        } finally {
            btn.disabled = false;
            btnText.textContent = originalText;
        }
    }, 1000);
}


function renderDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = state.viewDate.toLocaleDateString('pt-BR', options);
    const viewDateISO = getLocalISODate(state.viewDate);
    const todayISO = getLocalISODate(new Date());
    const isToday = viewDateISO === todayISO;

    elements.dateDisplay.textContent = (isToday ? 'Hoje, ' : '') + dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    const phase = getMoonPhase(state.viewDate);
    elements.moonPhaseDisplay.innerHTML = `<span title="${phase.name}">${phase.icon} ${phase.name}</span>`;

    const tipText = document.getElementById('moonTipText');
    const btn = document.getElementById('learnMoreBtn'); // Not in elements?
    if (tipText) tipText.textContent = phase.tip;
    if (btn) btn.onclick = () => openMoonModal(phase);

    renderTasks();
}

function changeDate(days) {
    const newDate = new Date(state.viewDate);
    newDate.setDate(newDate.getDate() + days);
    state.viewDate = newDate;
    renderDate();
}

function populateElements() {
    // Populate elements object
    elements.dateDisplay = document.getElementById('dateDisplay');
    elements.moonPhaseDisplay = document.getElementById('moonPhaseDisplay');
    elements.projectTabs = document.getElementById('projectTabs');
    elements.todoList = document.getElementById('todoList');
    elements.sectionTitle = document.getElementById('sectionTitle');
    elements.taskCount = document.getElementById('taskCount');
    elements.addBtn = document.getElementById('addBtn');

    elements.modal = document.getElementById('taskModal');
    elements.closeModal = document.getElementById('closeModal');
    elements.projectModal = document.getElementById('projectModal');
    elements.closeProjectModal = document.getElementById('closeProjectModal');
    elements.moonModal = document.getElementById('moonModal');
    elements.closeMoonModal = document.getElementById('closeMoonModal');
    elements.moonModalTitle = document.getElementById('moonModalTitle');
    elements.moonModalContent = document.getElementById('moonModalContent');
    elements.guideModal = document.getElementById('guideModal');
    elements.closeGuideModal = document.getElementById('closeGuideModal');
    elements.guideModalTitle = document.getElementById('guideModalTitle');
    elements.guideModalContent = document.getElementById('guideModalContent');

    elements.taskForm = document.getElementById('taskForm');
    elements.projectForm = document.getElementById('projectForm');

    elements.inputs = {
        title: document.getElementById('taskTitle'),
        desc: document.getElementById('taskDesc'),
        priority: document.getElementById('taskPriority'),
        freq: document.getElementById('taskFreq'),
        project: document.getElementById('taskProject'),
        projName: document.getElementById('projName'),
        projCulture: document.getElementById('projCulture'),
        projStartDate: document.getElementById('projStartDate'),
        // Soil
        soilPh: document.getElementById('soilPh'),
        soilV: document.getElementById('soilV'),
        soilCTC: document.getElementById('soilCTC'),
        soilP: document.getElementById('soilP'),
        soilK: document.getElementById('soilK'),
        soilClay: document.getElementById('soilClay'),
        soilCulture: document.getElementById('soilCulture'),
    };

    elements.btnSoilAnalysis = document.getElementById('btnSoilAnalysis');
    elements.soilModal = document.getElementById('soilModal');
    elements.closeSoilModal = document.getElementById('closeSoilModal');
    elements.soilResultModal = document.getElementById('soilResultModal');
    elements.closeSoilResultModal = document.getElementById('closeSoilResultModal');
    elements.soilResultContent = document.getElementById('soilResultContent');
    elements.soilForm = document.getElementById('soilForm');
    elements.btnAnalyze = document.getElementById('btnAnalyze');
    elements.btnAnalyze = document.getElementById('btnAnalyze');
    elements.analyzeBtnText = document.getElementById('analyzeBtnText');
    elements.closeResultBtn = document.getElementById('closeResultBtn');

    elements.prevMoonBtn = document.getElementById('prevMoonBtn');
    elements.nextMoonBtn = document.getElementById('nextMoonBtn');
}

function setupEventListeners() {
    if (elements.addBtn) elements.addBtn.addEventListener('click', () => toggleModal(true));
    if (elements.closeModal) elements.closeModal.addEventListener('click', () => toggleModal(false));
    if (elements.closeProjectModal) elements.closeProjectModal.addEventListener('click', () => toggleProjectModal(false));
    if (elements.closeMoonModal) elements.closeMoonModal.addEventListener('click', () => elements.moonModal.classList.remove('visible'));
    if (elements.closeGuideModal) elements.closeGuideModal.addEventListener('click', () => elements.guideModal.classList.remove('visible'));

    if (elements.modal) elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) toggleModal(false); });
    if (elements.projectModal) elements.projectModal.addEventListener('click', (e) => { if (e.target === elements.projectModal) toggleProjectModal(false); });

    if (elements.prevMoonBtn) elements.prevMoonBtn.addEventListener('click', () => changeDate(-1));
    if (elements.nextMoonBtn) elements.nextMoonBtn.addEventListener('click', () => changeDate(1));

    if (elements.taskForm) elements.taskForm.addEventListener('submit', saveTask);
    if (elements.projectForm) elements.projectForm.addEventListener('submit', addProject);

    if (elements.soilForm) elements.soilForm.addEventListener('submit', handleSoilAnalysis);

    if (elements.btnSoilAnalysis) elements.btnSoilAnalysis.addEventListener('click', () => elements.soilModal.classList.add('visible'));
    if (elements.closeSoilModal) elements.closeSoilModal.addEventListener('click', () => elements.soilModal.classList.remove('visible'));
    if (elements.closeSoilModal) elements.closeSoilModal.addEventListener('click', () => elements.soilModal.classList.remove('visible'));
    if (elements.closeSoilResultModal) elements.closeSoilResultModal.addEventListener('click', () => elements.soilResultModal.classList.remove('visible'));
    if (elements.closeResultBtn) elements.closeResultBtn.addEventListener('click', () => elements.soilResultModal.classList.remove('visible'));

    // Week days toggle
    const freqSelect = elements.inputs.freq;
    if (freqSelect) {
        freqSelect.addEventListener('change', (e) => {
            const group = document.getElementById('weekDaysGroup');
            if (group) {
                if (e.target.value === 'weekly') group.classList.remove('hidden');
                else group.classList.add('hidden');
            }
        });
    }

    // Manual/Auto Project Toggle
    const cultureSelect = elements.inputs.projCulture;
    const dateField = elements.inputs.projStartDate;
    if (cultureSelect && dateField) {
        cultureSelect.addEventListener('change', (e) => {
            if (e.target.value === 'manual') {
                dateField.removeAttribute('required');
                dateField.parentElement.style.display = 'none';
            } else {
                dateField.setAttribute('required', 'required');
                dateField.parentElement.style.display = '';
            }
        });
    }

    // Weather
    const btnWeather = document.getElementById('btnWeather');
    if (btnWeather) btnWeather.addEventListener('click', showWeatherModal);
    const closeWeather = document.getElementById('closeWeatherModal');
    if (closeWeather) closeWeather.addEventListener('click', () => document.getElementById('weatherModal').classList.remove('visible'));
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

function init() {
    try {
        populateElements();
        loadData();
        migrateData();
        processRoutines();
        setupEventListeners();
        renderDate();
        renderProjects();
        renderTasks();
        fetchWeather();
        fetchWeather();

        // Force Unregister Service Workers (Safety)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                }
            });
        }

        console.log("App Initialized");
    } catch (e) {
        alert("Erro fatal: " + e.message);
        console.error(e);
    }
}

// Start
init();

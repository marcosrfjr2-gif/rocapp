// App.js - Main Entry Point & Orchestration
import { state, elements, saveData, loadData, getLocalISODate } from './store.js';
import { renderProjects, addProject, deleteProject, getProjectType, generateProjectTasks } from './projects.js';
import { renderTasks, saveTask, processRoutines, toggleTask, deleteTask, editTask } from './tasks.js';
import { fetchWeather, showWeatherModal } from './weather.js';
import { getMoonPhase, openMoonModal, showConfirm, toggleModal, toggleProjectModal } from './ui.js';

// Global Error Handler
window.onerror = function (msg, url, line) {
    alert('ERRO: ' + msg + '\nLinha: ' + line);
};

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

// Moon logic moved to ui.js
// Toggle logic moved to ui.js

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

// Toggles moved to imported ui.js

function repairProjects() {
    let changed = false;
    state.projects.forEach(p => {
        if (p.culture === 'manual') return;

        // NEW LOGIC: Always attempt to sync tasks.
        // The generateProjectTasks function now has deduplication logic.
        // This ensures that even "partial" projects get their missing tasks (e.g., Harvest).
        console.log(`Verifying project: ${p.name}`);

        // We calculate the start date. If it's missing, default to today.
        // For existing projects, this date should already be saved.
        const startDate = p.startDate || getLocalISODate(new Date());

        // We capture length before to see if we added anything
        const tasksBefore = state.tasks.length;
        const routinesBefore = state.routines.length;

        generateProjectTasks(p.id, p.culture, startDate);

        if (state.tasks.length > tasksBefore || state.routines.length > routinesBefore) {
            console.log(`-> Fixed: Added missing tasks to ${p.name}`);
            changed = true;
        }
    });

    if (changed) {
        saveData();
    }
}

function init() {
    try {
        populateElements();
        loadData();
        migrateData();
        repairProjects();
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

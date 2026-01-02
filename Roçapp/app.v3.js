// App State
const state = {
    tasks: [],
    routines: [],
    projects: [], // { id, name, emoji }
    currentProject: 'all', // 'all' or projectId
    routines: [],
    projects: [], // { id, name, emoji }
    currentProject: 'all', // 'all' or projectId
    viewDate: new Date(), // Initialize with Today
    soilAnalysis: null // Stores latest analysis results { limingTonHa, npkRec, npkAmount, ... }
};

// DOM Elements
const elements = {
    dateDisplay: document.getElementById('dateDisplay'),
    moonPhaseDisplay: document.getElementById('moonPhaseDisplay'),
    moonTipDisplay: document.getElementById('moonTipDisplay'),
    prevMoonBtn: document.getElementById('prevMoonBtn'),
    nextMoonBtn: document.getElementById('nextMoonBtn'),

    // Lists & Containers
    projectTabs: document.getElementById('projectTabs'),
    todoList: document.getElementById('todoList'),
    sectionTitle: document.getElementById('sectionTitle'),
    taskCount: document.getElementById('taskCount'),

    // Buttons
    addBtn: document.getElementById('addBtn'),

    // Modals
    modal: document.getElementById('taskModal'), // Task Modal
    closeModal: document.getElementById('closeModal'),

    projectModal: document.getElementById('projectModal'),
    closeProjectModal: document.getElementById('closeProjectModal'),

    moonModal: document.getElementById('moonModal'),
    closeMoonModal: document.getElementById('closeMoonModal'),
    moonModalTitle: document.getElementById('moonModalTitle'),
    moonModalContent: document.getElementById('moonModalContent'),

    guideModal: document.getElementById('guideModal'),
    closeGuideModal: document.getElementById('closeGuideModal'),
    guideModalTitle: document.getElementById('guideModalTitle'),
    guideModalContent: document.getElementById('guideModalContent'),

    // Forms
    taskForm: document.getElementById('taskForm'),
    projectForm: document.getElementById('projectForm'),

    inputs: {
        title: document.getElementById('taskTitle'),
        desc: document.getElementById('taskDesc'),
        priority: document.getElementById('taskPriority'),
        freq: document.getElementById('taskFreq'),
        project: document.getElementById('taskProject'),

        // Project Form
        projName: document.getElementById('projName'),
        projCulture: document.getElementById('projCulture'),
        projStartDate: document.getElementById('projStartDate'),

        // Soil Form
        soilPh: document.getElementById('soilPh'),
        soilV: document.getElementById('soilV'),
        soilCTC: document.getElementById('soilCTC'),
        soilP: document.getElementById('soilP'),
        soilK: document.getElementById('soilK'),
        soilClay: document.getElementById('soilClay'),
        soilCulture: document.getElementById('soilCulture'),
    },
    // Soil Elements
    btnSoilAnalysis: document.getElementById('btnSoilAnalysis'),
    soilModal: document.getElementById('soilModal'),
    closeSoilModal: document.getElementById('closeSoilModal'),
    soilForm: document.getElementById('soilForm'),
    soilResultModal: document.getElementById('soilResultModal'),
    closeSoilResultModal: document.getElementById('closeSoilResultModal'),
    soilResultContent: document.getElementById('soilResultContent'),
    btnAnalyze: document.getElementById('btnAnalyze'),
    analyzeBtnText: document.getElementById('analyzeBtnText'),
};

let selectedEmoji = '🌱';

// Initialization
function init() {
    try {
        loadData();
        migrateData(); // Ensure defaults
        processRoutines();
        setupEventListeners();
        renderDate();
        renderProjects();
        renderTasks();
    } catch (e) {
        alert('ERRO ao Iniciar: ' + e.message);
        console.error(e);
    }
}

// Data Management
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

function saveData() {
    localStorage.setItem('rocapp_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('rocapp_routines', JSON.stringify(state.routines));
    localStorage.setItem('rocapp_projects', JSON.stringify(state.projects));
    if (state.soilAnalysis) localStorage.setItem('rocapp_analysis', JSON.stringify(state.soilAnalysis));
    renderTasks(); // Re-render tasks to reflect changes
}

function migrateData() {
    // 1. Ensure at least one project exists
    if (state.projects.length === 0) {
        const defaultProj = { id: 1, name: 'Geral', emoji: '🏡' };
        state.projects.push(defaultProj);
    }

    let changed = false;
    const defaultId = state.projects[0].id;

    // 2. Assign tasks without project to first project
    state.tasks.forEach(t => {
        if (!t.projectId) {
            t.projectId = defaultId;
            changed = true;
        }
    });

    // 3. Backfill Frequency for colors (Migration)
    state.tasks.forEach(t => {
        if (t.fromRoutine && !t.frequency) {
            const r = state.routines.find(rout => rout.id === t.routineId);
            if (r) {
                t.frequency = r.frequency;
                changed = true;
            }
        }
    });

    if (changed) saveData();
}

// Helper for Local Date String (YYYY-MM-DD)
// Fixes bug where late night usage (e.g. 22:00 Brazil) acts like tomorrow (UTC)
function getLocalISODate(date) {
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offset);
    return local.toISOString().split('T')[0];
}

// Routine Logic
function processRoutines() {
    // Generate tasks only for the next 7 days (keep it lightweight)
    const today = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(today.getDate() + 7);
    const limitStr = getLocalISODate(futureLimit);

    const todayStr = getLocalISODate(today);
    let changed = false;

    state.routines.forEach(routine => {
        if (!routine.nextRun) {
            routine.nextRun = routine.lastGenerated ? todayStr : todayStr;
        }
        if (!routine.projectId) routine.projectId = state.projects[0].id;

        let safety = 0;
        // Check against FUTURE limit
        while (routine.nextRun <= limitStr && safety < 100) {
            safety++;

            const alreadyExists = state.tasks.some(t =>
                t.fromRoutine &&
                t.routineId === routine.id &&
                t.date === routine.nextRun
            );

            if (!alreadyExists) {
                state.tasks.push({
                    id: Date.now() + Math.random(),
                    title: routine.title,
                    description: routine.description,
                    date: routine.nextRun,
                    priority: 'normal',
                    completed: false,
                    fromRoutine: true,
                    routineId: routine.id,
                    projectId: routine.projectId,
                    frequency: routine.frequency // Pass frequency for styling
                });
                changed = true;
            }

            // Calculate next date
            let currentRunDate = new Date(routine.nextRun + 'T12:00:00');

            if (routine.frequency === 'daily') {
                currentRunDate.setDate(currentRunDate.getDate() + 1);
            } else if (routine.frequency === 'weekly') {
                if (routine.daysOfWeek && routine.daysOfWeek.length > 0) {
                    let found = false;
                    // Find next requested day (max 7 day lookahead)
                    for (let i = 1; i <= 7; i++) {
                        currentRunDate.setDate(currentRunDate.getDate() + 1);
                        if (routine.daysOfWeek.includes(currentRunDate.getDay())) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) currentRunDate.setDate(currentRunDate.getDate() + 7);
                } else {
                    currentRunDate.setDate(currentRunDate.getDate() + 7);
                }
            } else if (routine.frequency === 'monthly') {
                currentRunDate.setMonth(currentRunDate.getMonth() + 1);
            } else if (routine.frequency === 'quarterly') {
                currentRunDate.setMonth(currentRunDate.getMonth() + 3);
            }
            routine.nextRun = currentRunDate.toISOString().split('T')[0];
            changed = true;
        }
    });

    if (changed) saveData();
}

// Render Functions

function renderProjects() {
    elements.projectTabs.innerHTML = '';

    // "Geral" Pill (All Projects)
    const allBtn = document.createElement('button');
    allBtn.className = `pill-btn ${state.currentProject === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'Geral';
    allBtn.onclick = () => { state.currentProject = 'all'; renderProjects(); renderTasks(); };
    elements.projectTabs.appendChild(allBtn);

    // Project Pills
    state.projects.filter(p => p.name !== 'Geral').forEach(p => {
        const btn = document.createElement('button');
        btn.className = `pill-btn ${state.currentProject === p.id ? 'active' : ''}`;

        // Inner HTML for text + delete icon
        btn.innerHTML = `
            ${p.emoji} ${p.name} 
            <span class="delete-project-btn" title="Apagar Projeto">&times;</span>
        `;

        btn.onclick = (e) => {
            state.currentProject = p.id;
            renderProjects();
            renderTasks();
        };

        // Delete Logic
        const deleteSpan = btn.querySelector('.delete-project-btn');
        deleteSpan.onclick = (e) => {
            e.stopPropagation(); // Don't switch tab
            deleteProject(p.id);
        };

        elements.projectTabs.appendChild(btn);
    });

    // Add Project Button
    const addBtn = document.createElement('button');
    addBtn.className = 'pill-btn add-project-btn';
    addBtn.textContent = '+ Novo';
    addBtn.onclick = () => toggleProjectModal(true);
    elements.projectTabs.appendChild(addBtn);

    // Update Modal Select
    updateProjectSelect();
}

function updateProjectSelect() {
    elements.inputs.project.innerHTML = '';
    state.projects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.emoji} ${p.name}`;
        if (state.currentProject !== 'all' && state.currentProject === p.id) {
            opt.selected = true;
        }
        elements.inputs.project.appendChild(opt);
    });
}

function renderTasks() {
    const viewDateStr = getLocalISODate(state.viewDate);
    const isProjectView = state.currentProject !== 'all';

    // Filter Logic
    const visibleTasks = state.tasks.filter(t => {
        // If specific Project: Match Project ID ONLY (Show full schedule)
        if (isProjectView) {
            return parseInt(t.projectId) === parseInt(state.currentProject);
        }
        // If Geral: Match Date Only (Today)
        else {
            return t.date === viewDateStr;
        }
    });

    elements.todoList.innerHTML = '';
    elements.taskCount.textContent = `${visibleTasks.filter(t => !t.completed).length} tarefas`;

    const todayStr = getLocalISODate(new Date());
    const isToday = viewDateStr === todayStr;

    if (!isProjectView) {
        const dateLabel = isToday ? '' : `(${state.viewDate.toLocaleDateString('pt-BR')})`;
        elements.sectionTitle.textContent = 'Geral - Hoje ' + dateLabel;
    } else {
        const proj = state.projects.find(p => p.id === state.currentProject);
        elements.sectionTitle.textContent = `${proj ? proj.name : 'Projeto'} - Todas as Tarefas`;
    }

    if (visibleTasks.length === 0) {
        elements.todoList.innerHTML = `<div class="empty-state"><p style="text-align:center; color:#888;">Nada por aqui.</p></div>`;
        return;
    }

    // Sort: 
    // 1. Incompleted First
    // 2. Date Ascending (so past/today/future are ordered in Project View)
    visibleTasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed - b.completed;
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return b.id - a.id;
    });

    visibleTasks.forEach(task => {
        const proj = state.projects.find(p => p.id === task.projectId) || state.projects[0];
        const el = document.createElement('div');

        // Add frequency class
        let freqClass = '';
        if (task.frequency) freqClass = `task-${task.frequency}`;

        el.className = `task-item ${task.completed ? 'task-done' : ''} ${freqClass}`;

        // Tags
        let tagsHtml = `<span class="project-tag">${proj.emoji} ${proj.name}</span>`;
        if (task.fromRoutine) tagsHtml += `<span class="tag-routine" style="font-size: 0.7rem;">🔄</span>`;
        if (task.isAutomated) tagsHtml += `<span class="tag-auto" style="font-size: 0.7rem; margin-left:4px; background:#E3F2FD; color:#1565C0; padding:2px 6px; border-radius:10px;">🤖 Auto</span>`;

        if (isProjectView) {
            // In Project View, show the task Date since we see all dates
            const tDate = new Date(task.date + 'T12:00:00'); // Safe parse
            tagsHtml += `<span style="font-size:0.75rem; color:#666; margin-left:6px;">📅 ${tDate.toLocaleDateString('pt-BR')}</span>`;
        }

        // Guide Button
        let guideBtnHtml = '';
        if (task.guideContent) {
            guideBtnHtml = `<button class="btn-learn-more-task" style="border:1px solid #2E7D32; color:#2E7D32; background:none; border-radius:15px; font-size:0.75rem; padding:2px 8px; margin-top:5px; cursor:pointer;">📖 Saiba Como</button>`;
        }

        el.innerHTML = `
            <div class="task-check ${task.completed ? 'checked' : ''}" role="checkbox"></div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                 <div style="margin-top:4px;">${tagsHtml}</div>
                ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                ${guideBtnHtml}
            </div>
            <div class="task-actions">
                <button class="edit-btn" style="border:none; background:none; color:#2E7D32; margin-right:8px;">✎</button>
                <button class="delete-btn" style="border:none; background:none; color:#ccc;">&times;</button>
            </div>
        `;
        el.querySelector('.task-check').addEventListener('click', (e) => { e.stopPropagation(); toggleTask(task.id); });
        el.querySelector('.edit-btn').addEventListener('click', (e) => { e.stopPropagation(); editTask(task.id); });
        el.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteTask(task.id); });

        // Bind Guide Button
        if (task.guideContent) {
            const gBtn = el.querySelector('.btn-learn-more-task');
            if (gBtn) gBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openAutoGuide(task.title, task.guideContent);
            });
        }

        elements.todoList.appendChild(el);
    });
}

function renderDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = state.viewDate.toLocaleDateString('pt-BR', options);

    // Check if viewDate is Today
    const viewDateISO = getLocalISODate(state.viewDate);
    const todayISO = getLocalISODate(new Date());
    const isToday = viewDateISO === todayISO;

    elements.dateDisplay.textContent = (isToday ? 'Hoje, ' : '') + dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    const phase = getMoonPhase(state.viewDate);
    elements.moonPhaseDisplay.innerHTML = `<span title="${phase.name}">${phase.icon} ${phase.name}</span>`;

    // Tip & Button
    const tipText = document.getElementById('moonTipText');
    const btn = document.getElementById('learnMoreBtn');

    if (tipText) tipText.textContent = phase.tip;

    if (btn) {
        // Remove old listeners involves cloning or simple onclick overwrite (safer here)
        btn.onclick = () => openMoonModal(phase);
    }

    // Re-render tasks because date changed
    renderTasks();
}

function changeDate(days) {
    const newDate = new Date(state.viewDate);
    newDate.setDate(newDate.getDate() + days);
    state.viewDate = newDate;
    renderDate();
}

// Unified Save Function (Create or Update)
function saveTask(e) {
    e.preventDefault();
    const title = elements.inputs.title.value;
    const desc = elements.inputs.desc.value;
    const priority = elements.inputs.priority.value;
    const freq = elements.inputs.freq.value;
    const projId = parseInt(elements.inputs.project.value);

    // Default to Today for calculation base
    const dateInput = getLocalISODate(new Date());

    // Collect Week Days
    let daysOfWeek = [];
    if (freq === 'weekly') {
        document.querySelectorAll('.week-days-selector input:checked').forEach(cb => {
            daysOfWeek.push(parseInt(cb.value));
        });
    }

    // EDIT MODE
    if (state.editingId) {
        // Loose equality to handle ID number vs string
        const taskIndex = state.tasks.findIndex(t => t.id == state.editingId);
        if (taskIndex > -1) {
            state.tasks[taskIndex].title = title;
            state.tasks[taskIndex].description = desc;
            state.tasks[taskIndex].priority = priority;
            // state.tasks[taskIndex].date = dateInput; // Don't change date on edit usually, but maybe we should? maintaining old date for now.
            state.tasks[taskIndex].projectId = projId;
        }
    }
    // CREATE MODE (Always Routine now)
    else {
        const newRoutine = {
            id: Date.now(),
            title,
            description: desc,
            frequency: freq,
            projectId: projId,
            nextRun: dateInput // Will be validated by processRoutines
        };
        if (freq === 'weekly' && daysOfWeek.length > 0) {
            newRoutine.daysOfWeek = daysOfWeek;
        }
        state.routines.push(newRoutine);
        processRoutines();
    }

    saveData();
    elements.taskForm.reset();
    toggleModal(false);

    renderTasks();
}

function editTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    state.editingId = id; // Set edit flag

    // Fill Form
    elements.inputs.title.value = task.title;
    elements.inputs.desc.value = task.description || '';
    // elements.inputs.date.value = task.date; // Removed
    elements.inputs.priority.value = task.priority;
    elements.inputs.project.value = task.projectId;
    // elements.inputs.freq.value = 'none'; // We are editing a generated task, let's leave freq as is or default

    // Reset and Hide Week Days in Edit Mode (since we only edit single task instance usually)
    const weekGroup = document.getElementById('weekDaysGroup');
    if (weekGroup) weekGroup.classList.add('hidden');
    document.querySelectorAll('.week-days-selector input').forEach(cb => cb.checked = false);
    elements.modal.querySelector('h2').textContent = 'Editar Tarefa';
    elements.modal.classList.add('visible');
}

// Helper for Emoji
function getEmojiForType(type) {
    const map = {
        pomar: 'Pomar',
        milho: 'Milho',
        feijao: 'Feijão',
        mandioca: 'Mandioca'
    };
    return map[type] || '🌱';
}

function getProjectNameForType(type) {
    const map = {
        galinhas_poedeiras: 'Galinhas Poedeiras',
        frangos_corte: 'Frangos de Corte',
        gado_leite: 'Gado de Leite',
        gado_corte: 'Gado de Corte',
        suinos: 'Suínos/Porcos',
        pomar: 'Pomar',
        milho: 'Milho',
        feijao: 'Feijão',
        mandioca: 'Mandioca'
    };
    return map[type] || 'Projeto';
}

function addProject(e) {
    e.preventDefault();
    try {
        const culture = elements.inputs.projCulture.value;
        const startDateVal = elements.inputs.projStartDate.value;
        const startDate = startDateVal ? new Date(startDateVal) : new Date();

        // Auto-Name Logic: "Gado de Leite #1", "Gado de Leite #2", etc.
        const baseName = getProjectNameForType(culture);
        const existingCount = state.projects.filter(p => p.name.startsWith(baseName)).length;
        const finalName = `${baseName} #${existingCount + 1}`;

        // Create Project
        const newProject = {
            id: Date.now(),
            name: finalName,
            emoji: getEmojiForType(culture)
        };
        state.projects.push(newProject);

        // Generate Tasks
        generateProjectTasks(newProject.id, culture, startDate);

        saveData();
        renderProjects();

        // Switch to new project
        state.currentProject = newProject.id;
        renderProjects();
        renderTasks();

        elements.projectForm.reset();
        toggleProjectModal(false);
    } catch (err) {
        alert('ERRO em addProject: ' + err.message);
        console.error(err);
    }
}

// ... (deleteProject is skipped in replacement unless I include it in range, but I can target specific functions)

// Simplified Project Templates
// ----------------------
// EXPANDED TEMPLATES
// ----------------------
const cropTemplates = {


    // 6. Pomar (Citros/Frutas em Geral)
    pomar: [
        { day: -60, title: 'Análise e Calagem', desc: 'Preparo Antecipado.', guide: '<h3>🧪 A Base de Tudo</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>📉 Correção de Acidez (Recomendada):</strong><br>Aplicar <b>{{CALC_GM2}}g/m²</b> (ou {{CALC_TON}} ton/ha) de Calcário.</div><p>O calcário demora 60 a 90 dias para reagir e tirar a acidez. Se deixar para aplicar no plantio, a planta não aproveita direito no começo.</p><ul><li>Espalhe o calcário em área total e incorpore (misture com a terra) se possível.</li></ul>' },
        { day: -30, title: 'Abertura de Covas', desc: 'Curas do Solo.', guide: '<h3>🕳️ Prepare a Casa da Árvore</h3><p>Frutífera vive anos no mesmo lugar. Capriche na cova.</p><ul><li><strong>Tamanho:</strong> 60x60x60cm.</li><li><strong>Adubação Antecipada:</strong> Misture o esterco, fosfato e calcário com a terra e encha a cova. Deixe "curtir" por 30 dias. Se plantar logo após adubar, o adubo quente pode queimar a raiz da muda nova.</li></ul>' },
        { day: 0, title: 'Plantio das Mudas', desc: 'Implantação.', guide: '<h3>🍊 Hora de Plantar</h3><div style="background:#fff3cd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação de Plantio:</strong><br>Use NPK <b>{{NPK_FORMULA}}</b>: <b>{{NPK_GM2}}g</b> por cova (misturado na terra).</div><p>Se já fez a cova há 30 dias, só abra um buraco pequeno para o torrão.</p><ul><li><strong>Enxerto:</strong> 5cm acima do solo (Sagrado!).</li><li><strong>Água:</strong> 20 litros por cova logo após o plantio para tirar bolsas de ar das raízes.</li></ul>' },
        { day: 15, type: 'routine', freq: 'monthly', title: 'Adubação de Manutenção', desc: 'Nutrição Mensal.', guide: '<h3>🔄 Manutenção Nutricional</h3><p>Frutíferas jovens precisam de "comida" todo mês para formar a copa.</p><ul><li><strong>O que usar:</strong> NPK 10-10-10 ou 20-05-20 (se já tiver fosfato na cova).</li><li><strong>Como aplicar:</strong> Em círculo, na projeção da copa (onde cai a gota de chuva da folha mais externa), nunca encostado no tronco.</li><li><strong>Dose:</strong> Aumente a dose conforme a planta cresce (comece com um copo de iogurte pequeno por planta).</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Coroamento', desc: 'Limpeza.', guide: '<h3>🌳 Coroamento</h3><p>Mantenha um círculo de 1m em volta do tronco "na terra nua".</p><ul><li>Isso evita que a roçadeira machuque o tronco (porta de entrada para fungos).</li><li>Ajuda a visualizar se tem formigas ou brocas atacando o colo da planta.</li></ul>' },
        { day: 7, type: 'routine', freq: 'weekly', title: 'Monitorar Formiga Cortadeira', desc: 'Sauvas.', guide: '<h3>🐜 O Inimigo nº 1</h3><p>Uma saúva adulta consome mais que um boi (proporcionalmente).</p><ul><li>Siga as trilhas até o olheiro.</li><li>Aplique isca granulada <strong>ao lado</strong> do caminho, nunca dentro do buraco (elas precisam carregar pra dentro).</li><li>Não aplique em dias de chuva ou chão molhado.</li></ul>' }
    ],

    // 7. Milho
    milho: [
        { day: -60, title: 'Calagem (Correção)', desc: 'Correção de Acidez.', guide: '<h3>📉 Suba o pH do Solo!</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Aplicação de Calcário:</strong><br>Dose: <b>{{CALC_GM2}}g/m²</b> (ou {{CALC_TON}} ton/ha).</div><p>Milho em terra ácida tem "raízes tóxicas" de alumínio e não bebe água.</p><ul><li>Aplique a lanço e gradeie para misturar até 20cm de profundidade.</li><li>Se for Plantio Direto, aplique na superfície (demora mais para descer).</li></ul>' },
        { day: -20, title: 'Dessecação (Mato)', desc: 'Limpeza da Área.', guide: '<h3>🍂 O "Vazio" antes do Plantio</h3><p>Não plante no meio do mato verde!</p><ul><li>As ervas daninhas competem por água e alelopatia (veneno químico) contra o milho bebê.</li><li>Aplique herbicida ou roce baixo 15-20 dias antes. O milho deve nascer em "terra limpa" ou palhada morta.</li></ul>' },
        { day: 0, title: 'Plantio do Milho', desc: 'Técnica de Semeadura.', guide: '<h3>🌽 Dia de Plantar</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação na Linha:</strong><br>Use NPK <b>{{NPK_FORMULA}}</b>.<br>Dose: <b>{{NPK_GM2}}g</b> por metro linear.</div><p>A calagem já deve ter sido feita. Agora é garantir o fósforo.</p><ul><li><strong>Velocidade:</strong> 4-5km/h. Calma!</li><li><strong>Profundidade:</strong> 3 a 5cm.</li><li><strong>Adubo:</strong> Ao lado e abaixo da semente para não "salgar" (queimar) a semente.</li></ul>' },
        { day: 15, type: 'routine', freq: 'weekly', title: 'Monitorar Lagarta', desc: 'Praga Chave.', guide: '<h3>🐛 Lagarta-do-Cartucho (Spodoptera)</h3><p>Praga mais destrutiva.</p><ul><li><strong>Dano:</strong> Come as folhas novas ainda enroladas no cartucho. Quando a folha abre, está toda furada. Também mata o ponto de crescimento.</li><li><strong>Monitoramento:</strong> Entre na roça e faça um "W". Olhe 20 plantas por ponto. Se achar 2 com lagarta ou cocô fresco, TEM que aplicar.</li><li><strong>Controle:</strong> Inseticidas fisiológicos (inibidores de quitina) ou Biológicos (Baculovírus/BT) funcionam melhor com lagartas pequenas (<1cm).</li></ul>' },
        { day: 30, title: 'Adubação de Cobertura (Manutenção)', desc: 'A Força do Nitrogênio.', guide: '<h3>✨ Ureia: O Motor do Milho</h3><p>Milho precisa de muito Nitrogênio para encher espiga.</p><ul><li><strong>Fase V4-V6:</strong> (4 a 6 folhas verdadeiras). É quando a planta define o tamanho da espiga.</li><li><strong>Aplicação:</strong> Jogue a ureia no cordão, a uns 10cm do pé.</li><li><strong>Perda:</strong> A ureia vira gás (amônia) se ficar no sol. Aplique antes da chuva ou enterre/cubra com terra.</li></ul>' }
    ],

    // 8. Feijão
    feijao: [
        { day: -60, title: 'Calagem', desc: 'Correção de Solo.', guide: '<h3>📉 Feijão Gosta de pH Alto</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Recomendação de Calcário:</strong><br>Aplicar <b>{{CALC_GM2}}g/m²</b>.</div><p>Feijão é planta de ciclo curto. Se a terra estiver ácida, ele não tem tempo de recuperar.</p><ul><li>Aplique 60 dias antes. O cálcio ajuda a fortalecer a parede da planta contra doenças.</li></ul>' },
        { day: -15, title: 'Dessecação', desc: 'Eliminar Concorrência.', guide: '<h3>🧹 Área Limpa</h3><p>Feijão "nasce fraco". Se tiver mato competindo nos primeiros 20 dias, você perde a lavoura.</p><ul><li>Faça a limpeza total da área 2 semanas antes.</li><li>Evite herbicidas residuais fortes que possam matar o feijão quando nascer.</li></ul>' },
        { day: 0, title: 'Plantio Feijão', desc: 'Sensibilidade.', guide: '<h3>🫘 Plantio Suave</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação NPK:</strong><br>Use <b>{{NPK_FORMULA}}</b>: <b>{{NPK_GM2}}g</b> por metro.</div><p>Solo destorroado é lei.</p><ul><li><strong>Profundidade:</strong> Rasa (3cm). Se enterrar muito, ele não tem força para sair.</li><li><strong>Inoculante:</strong> Misture Rhizobium na sombra (o sol mata a bactéria) e plante logo em seguida.</li></ul>' },
        { day: 10, type: 'routine', freq: 'weekly', title: 'Monitorar Pragas', desc: 'Vetores de Vírus.', guide: '<h3>🐞 Mosca Branca e Vaquinha</h3><ul><li><strong>Mosca Branca:</strong> Transmite o Mosaico Dourado (vírus que atrofia e amarela o feijoeiro). Se ver nuvens de mosquinhas brancas ao balançar a folha, controle imediatamente.</li><li><strong>Vaquinha:</strong> Come a folha, mas o pior é a larva dela que come a raiz.</li></ul>' },
        { day: 25, title: 'Adubação de Cobertura (Manutenção)', desc: 'Boost.', guide: '<h3>✨ Nitrogênio no Feijão</h3><p>Apesar de ser leguminosa, o feijão moderno precisa de um empurrão.</p><ul><li>Aplique uma dose leve de ureia (30-50kg/ha) aos 20-25 dias (terceira folha trifoliada).</li><li>Cuidado para não jogar dentro da folha ("copinho"), pois a ureia queima a planta.</li></ul>' }
    ],

    // 9. Mandioca
    mandioca: [
        { day: -60, title: 'Calagem', desc: 'Preparação.', guide: '<h3>📉 Mandioca Agradece Calagem</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Dose Recomendada:</strong><br>Aplicar <b>{{CALC_GM2}}g/m²</b>.</div><p>Muitos acham que mandioca dá em qualquer chão, mas ela dobra a produção em solo corrigido.</p>' },
        { day: -30, title: 'Aração/Gradagem', desc: 'Solo Fofo.', guide: '<h3>🚜 Solo Solto = Raiz Grossa</h3><p>Para a mandioca engrossar, a terra não pode estar compactada.</p><ul><li><strong>Aração:</strong> Profunda (20-30cm).</li><li><strong>Curvas de Nível:</strong> Mandioca sofre muito com erosão. Plante cortando as águas.</li></ul>' },
        { day: 0, title: 'Plantio (Manivas)', desc: 'Seleção da Muda.', guide: '<h3>🥔 Plantio da Mandioca</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Fósforo no Sulco:</strong><br>Se recomendado, use Super Simples no fundo do sulco.</div><ul><li><strong>Origem:</strong> Use o terço médio da planta mãe.</li><li><strong>Posição:</strong> Horizontal (a 5-10cm) facilita colheita.</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Capina (Crítico)', desc: 'Período Crítico.', guide: '<h3>🌿 Período Crítico de Competição (PCII)</h3><p>Dos 0 aos 100 dias, a mandioca <strong>não tolera sombra</strong>.</p><ul><li>Se o mato crescer mais que a mandioca nesse tempo, a produção cai 50% ou mais.</li><li>Mantenha a roça "no limpo" até a mandioca fechar a rua e fazer sombra no mato.</li></ul>' },
        { day: 60, type: 'routine', freq: 'quarterly', title: 'Adubação de Manutenção', desc: 'Nutrição.', guide: '<h3>💪 Força Pré-Amido</h3><p>Para garantir raízes cheias:</p><ul><li><strong>Potássio:</strong> Se o solo for fraco, aplique cloreto de potássio (60 dias após plantio) para ajudar a carregar o amido.</li><li><strong>Manutenção:</strong> Mantenha a área limpa e observe deficiências (folhas amarelas, crescimento lento).</li></ul>' },
        { day: 365, title: 'Ponto de Colheita', desc: 'Amido.', guide: '<h3>🥘 Ponto de Colheita</h3><p>Não tem data certa, depende do mercado e da chuva.</p><ul><li><strong>Teor de Amido:</strong> Se choveu muito e a planta brotou folha nova, ela "gastou" o amido da raiz. A mandioca fica "aguada" e não cozinha.</li><li><strong>Melhor hora:</strong> Na "dormência" da planta (época seca/inverno), quando ela está com pouca folha. A raiz está cheia de energia acumulada.</li></ul>' }
    ],

    // --- NOVAS CULTURAS (EXPANSÃO) ---

    // 10. Alface (Folhosas)
    alface: [
        { day: -10, title: 'Preparo do Canteiro', desc: 'Base.', guide: '<h3>🥬 Canteiro de Ouro</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação Rica em N:</strong><br>Misture muito esterco curtido (3 a 5kg/m²). Use <b>{{NPK_FORMULA}}</b> (<b>{{NPK_GM2}}g/m²</b>) espalhado.</div><p>Folha precisa de nitrogênio e matéria orgânica.</p><ul><li><strong>Canteiro:</strong> 20cm de altura para não empossar água (alface apodrece fácil).</li></ul>' },
        { day: 0, title: 'Transplantio', desc: 'Mudas.', guide: '<h3>🌱 Mudança de Casa</h3><p>Nunca plante a semente direto (é muito frágil).</p><ul><li><strong>Ponto ideal:</strong> Muda com 4 folhas definitivas.</li><li><strong>Espaçamento:</strong> 25x25cm ou 30x30cm. Se fechar muito, dá fungo (Míldio).</li><li><strong>Horário:</strong> Fins de tarde para o sol não murchar a muda na largada.</li></ul>' },
        { day: 20, type: 'routine', freq: 'weekly', title: 'Adubação de Cobertura (Manutenção)', desc: 'Nitrogênio (Boost).', guide: '<h3>✨ Explosão Verde</h3><p>A alface cresce muito rápido e precisa de manutenção constante.</p><ul><li><strong>Semanalmente:</strong> Aplique adubo nitrogenado (Ureia ou Sulfato de Amônio) diluído em água se possível, ou entre as plantas com cuidado.</li><li><strong>Cuidado:</strong> Não deixe cair nas folhas ("queima").</li><li>Alterne com adubos orgânicos líquidos (biofertilizantes) para dar brilho e sabor.</li></ul>' },
        { day: 45, title: 'Colheita', desc: 'Antes do Pendão.', guide: '<h3>🥗 Ponto de Colheita</h3><p>Colha antes do centro começar a subir (pendoar), senão fica amarga.</p><ul><li><strong>Horário:</strong> Colha bem cedo (antes do sol forte) para ela durar mais na geladeira ou na banca do mercado.</li></ul>' }
    ],

    // 11. Tomate (Frutos)
    tomate: [
        { day: -15, title: 'Calagem e Canteiro', desc: 'Preparo.', guide: '<h3>🍅 Tomate Exige Cálcio</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Fundo Preto (Podridão Apical):</strong><br>A falta de Cálcio (Calagem: {{CALC_GM2}}g/m²) faz o fundo do tomate ficar preto.<br>Aplique o calcário com antecedência!</div>' },
        { day: 0, title: 'Plantio', desc: 'Mudas.', guide: '<h3>🌱 Transplantio</h3><ul><li>Use mudas sadias. Enterre até a primeira folha para enraizar melhor.</li><li><strong>Adubo NPK:</strong> Rico em Potássio (K) e Fósforo (P). Use <b>{{NPK_GM2}}g</b> por cova.</li></ul>' },
        { day: 15, title: 'Estaqueamento (Tutor)', desc: 'Suporte.', guide: '<h3>🪵 Amarrio</h3><p>O tomateiro indeterminado cresce como trepadeira. Precisa de estaca ou fitilho.</p><ul><li>Amarre com folga ("em oito") para não enforcar o caule quando engrossar.</li></ul>' },
        { day: 20, type: 'routine', freq: 'weekly', title: 'Desbrota', desc: 'Tira-Chupão.', guide: '<h3>✂️ Cirurgia Semanal</h3><p>Remova os brotos laterais que nascem na axila das folhas ("chupões").</p><ul><li>Deixe apenas a haste principal subir.</li><li>Isso concentra força nos frutos e melhora a ventilação.</li></ul>' },
        { day: 30, type: 'routine', freq: 'weekly', title: 'Adubação de Manutenção (Fertirrigação)', desc: 'Produção Contínua.', guide: '<h3>🍅 Comida toda semana</h3><p>Tomate produz e cresce ao mesmo tempo.</p><ul><li><strong>Alternância:</strong> Uma semana NK (Nitrogênio e Potássio) para encher fruto, na outra Cálcio e Magnésio para evitar podridão.</li><li><strong>Boro:</strong> Aplique Calda Bordalesa ou adubo foliar com Boro a cada 15 dias para melhorar a florada.</li></ul>' }
    ],

    // 12. Cenoura (Raízes)
    cenoura: [
        { day: -5, title: 'Canteiro Profundo', desc: 'Solo Fofo.', guide: '<h3>🥕 O Segredo da Cenoura Reta</h3><p>Se a raiz achar terra dura ou pedra, ela entorta ou bifurca ("cenoura de pernas abertas").</p><ul><li>Revire a terra a 30cm de profundidade. Deixe muito fofo.</li><li><strong>Adubo P:</strong> O Fósforo é essencial. Use NPK <b>{{NPK_GM2}}g/m²</b>.</li></ul>' },
        { day: 0, title: 'Semeadura Direta', desc: 'Plantio.', guide: '<h3>🌱 Semeando</h3><p>Não se faz muda de cenoura (a raiz torta no transplante).</p><ul><li>Riscos de 1 a 2cm de profundidade.</li><li>Misture a semente com areia ou fubá para espalhar melhor (semente muito miúda).</li></ul>' },
        { day: 25, title: 'Desbaste (Raleio)', desc: 'Espaço.', guide: '<h3>✂️ A Escolha de Sofia</h3><p>Você vai ter que arrancar as plantinhas extras.</p><ul><li>Deixe uma cenoura a cada 5-8cm. Se ficarem grudadas, não engrossam.</li><li>Faça isso com o solo úmido para não abalar as vizinhas.</li></ul>' },
        { day: 40, type: 'routine', freq: 'monthly', title: 'Adubação de Cobertura (Potássio)', desc: 'Encher Raiz.', guide: '<h3>🥕 Doçura e Tamanho</h3><p>Cenoura precisa de Potássio para crescer a raiz.</p><ul><li>Evite excesso de Nitrogênio (Ureia) agora, senão ela dá muita folha e pouca cenoura.</li><li>Prefira cinzas de madeira ou Cloreto de Potássio entre as linhas.</li></ul>' }
    ],

    // 13. Café (Perene)
    cafe: [
        { day: -60, title: 'Análise e Correção', desc: 'Investimento.', guide: '<h3>☕ Café é Cultura de Precisão</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Calcário:</strong><br>Dose: <b>{{CALC_GM2}}g/m²</b>. Café não tolera alumínio tóxico.</div><p>Faça a correção em área total e no fundo do sulco.</p>' },
        { day: 0, title: 'Plantio', desc: 'Mudas.', guide: '<h3>🌱 Plantio do Café</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Fosfatagem:</strong><br>Use fonte rica em P (Super Simples ou NPK de plantio) misturado n terra da cova. <b>{{NPK_GM2}}g</b>.</div><ul><li><strong>Colo:</strong> Não enterre o colo da muda (região entre raiz e caule). Afogamento do colo mata a muda.</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Adubação Nitrogenada', desc: 'Crescimento.', guide: '<h3>✨ Nitrogênio Parcelado</h3><p>No primeiro ano, aplique N a cada 30-45 dias (nas chuvas) para formar a saia do cafeeiro.</p><p>Use sulfato de amônio ou ureia, sempre em solo úmido.</p>' },
        { day: 120, type: 'routine', freq: 'quarterly', title: 'Adubação de Manutenção (NPK)', desc: 'Estrutura.', guide: '<h3>☕ Adubo de Produção</h3><p>A partir do segundo ano, o café precisa de muito Potássio para encher o grão.</p><ul><li>Use NPK 20-05-20 ou similar fórmula cafeeira.</li><li>Em lavouras adultas, faça 3 ou 4 parcelas anuais (Setembro, Novembro, Janeiro, Março).</li></ul>' }
    ],



    // 17. Maracujá
    maracuja: [
        { day: -30, title: 'Preparo das Espaldeiras', desc: 'Cerca.', guide: '<h3>🏗️ A Sustentação</h3><p>Maracujá precisa de uma "cerca" (espaldeira) para subir.</p><ul><li>Mourões a cada 4-6 metros. Um fio de arame liso grosso a 1.80m de altura.</li><li>Se usar madeira verde, ela apodrece antes do maracujá morrer. Use madeira tratada.</li></ul>' },
        { day: 0, title: 'Plantio', desc: 'Mudas.', guide: '<h3>🌱 Plantio no Morro</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação:</strong><br>Use NPK <b>{{NPK_FORMULA}}</b>: <b>{{NPK_GM2}}g</b>/cova. Misture bem.</div>' },
        { day: 60, title: 'Tutoramento', desc: 'Subida.', guide: '<h3>🧗 Ensinando a Subir</h3><p>Conduza a planta com um barbante até o arame.</p><ul><li>Vá tirando todos os brotos laterais até ela chegar no arame lá em cima.</li><li>Quando chegar no arame, corte a ponta para ela soltar os braços laterais (cortina).</li></ul>' },
        { day: 100, title: 'Polinização Manual', desc: 'Mamangava.', guide: '<h3>🌼 O Segredo da Produção</h3><p>Se não tem abelha grande (Mamangava), não dá fruto.</p><ul><li><strong>Manual:</strong> Pegue o pólen de uma flor e passe na outra (com o dedo mesmo).</li><li>Faça isso à tarde (depois das 13h) quando a flor abre.</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Adubação de Manutenção', desc: 'Nutrição Mensal.', guide: '<h3>🔄 Manutenção do Maracujazeiro</h3><p>Planta de crescimento explosivo = Muita fome.</p><ul><li>Aplique NK (Nitrogênio e Potássio) todo mês na época de chuva.</li><li>Se faltar água ou comida, a folha amarela e o fruto murcha ("maracujá de gaveta").</li></ul>' }
    ],

    // 18. Ervas e Temperos (Genérico)
    ervas: [
        { day: 0, title: 'Plantio', desc: 'Vasos ou Canteiros.', guide: '<h3>🌿 Horta Medicinal/Temperos</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação Orgânica:</strong><br>Ervas preferem muito composto orgânico/húmus à adubação química forte.</div><ul><li><strong>Drenagem:</strong> Essencial. Alecrim e Hortelã odeiam raiz encharcada.</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Poda de Colheita', desc: 'Manutenção.', guide: '<h3>✂️ Pode sem dó</h3><p>Ervas precisam ser podadas para encher.</p><ul><li>Hortelã: Se não podar, invade tudo.</li><li>Manjericão: Corte as flores! Se deixar florir, a folha perde o cheiro e a planta morre (ciclo encerra).</li></ul>' },
        { day: 45, type: 'routine', freq: 'monthly', title: 'Adubação de Manutenção (Orgânica)', desc: 'Revitalização.', guide: '<h3>🍂 Terra Nova</h3><p>Em vasos, a terra "gasta" rápido.</p><ul><li>Todo mês coloque uma mãozada de húmus de minhoca ou esterco curtido no pé da planta.</li><li>Afofe a terra com um garfo velho para a raiz respirar.</li></ul>' }
    ],

    // 19. Cana
    cana: [
        { day: 0, title: 'Plantio (Toletes)', desc: 'Sulcos.', guide: '<h3>🎋 Cana Caiana/Forrageira</h3><ul><li>Sulcos profundos (20-30cm).</li><li>Coloque os toletes deitados, ponta com ponta.</li><li>Cubra com pouca terra (5cm) se for época seca, ou mais se for chuva.</li></ul>' },
        { day: 90, type: 'routine', freq: 'quarterly', title: 'Adubação de Manutenção', desc: 'Sacarose.', guide: '<h3>🎋 Doçura e Peso</h3><p>Cana é gramínea (igual milho) e gosta de Nitrogênio e Potássio.</p><ul><li>Jogue o adubo na linha (junto com a amontoa de terra).</li><li>Mantenha o canavial limpo até fechar a sombra.</li></ul>' },
        { day: 365, title: 'Corte', desc: 'Colheita.', guide: '<h3>🔪 Corte Rente</h3><p>Na hora de colher, corte rente ao chão.</p><ul><li>Se deixar toco alto, brota fraco e dá doença.</li><li>A cana rebate (brota de novo) por 3 a 5 anos.</li></ul>' }
    ],

    // Mapeamentos para Variedades Similares (Expansão Final)
    couve: [],
    rucula: [],
    cheiro_verde: [],

    manjericao: [],
    alecrim: [],
    hortela: [],

    pimentao: [],
    pepino: [],
    quiabo: [],
    abobora: [],
    morango: [],
    melancia: [],

    beterraba: [],
    batata_doce: [],

    vagem: [],

    banana: [],
    abacaxi: [],


};

// --- CLONING LOGIC ---
const clone = (from, nameChange) => {
    const fresh = JSON.parse(JSON.stringify(cropTemplates[from]));
    if (nameChange) {
        fresh.forEach(t => {
            // Regex to replace common base names in title and guide
            t.title = t.title.replace(/Alface|Tomate|Cenoura|Mandioca|Pomar|Frangos|Ovinos|Ervas/g, nameChange);
            if (t.guide) {
                t.guide = t.guide.replace(/Alface|Tomate|Cenoura|Mandioca|Pomar|Frangos|Ovinos|Ervas/g, nameChange);
            }
        });
    }
    return fresh;
};

// Map
cropTemplates.couve = clone('alface', 'Couve');
cropTemplates.rucula = clone('alface', 'Rúcula');
cropTemplates.cheiro_verde = clone('alface', 'Cheiro-Verde');

cropTemplates.manjericao = clone('ervas', 'Manjericão');
cropTemplates.alecrim = clone('ervas', 'Alecrim');
cropTemplates.hortela = clone('ervas', 'Hortelã');

cropTemplates.pimentao = clone('tomate', 'Pimentão');
cropTemplates.pepino = clone('tomate', 'Pepino'); // Tweak: Pepino also needs tutoring
cropTemplates.quiabo = clone('tomate', 'Quiabo');
cropTemplates.abobora = clone('tomate', 'Abóbora'); // Tweak: Abobora is crawling, but nutrition similar
cropTemplates.morango = clone('tomate', 'Morango'); // High fruit demand
cropTemplates.melancia = clone('tomate', 'Melancia');

cropTemplates.beterraba = clone('cenoura', 'Beterraba');
cropTemplates.batata_doce = clone('mandioca', 'Batata Doce');
cropTemplates.abacaxi = clone('mandioca', 'Abacaxi'); // Rustica, mudas

cropTemplates.vagem = clone('feijao', 'Vagem');

cropTemplates.banana = clone('pomar', 'Banana');



// Final check to prevent errors
Object.keys(cropTemplates).forEach(k => {
    if (!cropTemplates[k] || cropTemplates[k].length === 0) {
        // Fallback for any missed key to generic
        console.warn('Fallback template used for', k);
        cropTemplates[k] = clone('milho', 'Genérico');
    }
});


function generateProjectTasks(projectId, culture, startDate) {
    try {
        const template = cropTemplates[culture];
        if (!template) {
            // alert('ERRO: Template não encontrado para ' + culture);
            // Fallback for old projects or unknown types
            return;
        }

        let taskCount = 0;
        template.forEach(item => {
            // Calculate Date
            const itemDate = new Date(startDate);
            itemDate.setDate(itemDate.getDate() + item.day);
            const dateStr = getLocalISODate(itemDate);

            // ROUTINE
            if (item.type === 'routine') {
                state.routines.push({
                    id: Date.now() + Math.random(),
                    title: item.title,
                    description: item.desc,
                    frequency: item.freq,
                    projectId: projectId,
                    nextRun: dateStr,
                    guideContent: item.guide // Store guide for routine tasks
                });
            }
            // ONE-OFF TASK
            else {
                state.tasks.push({
                    id: Date.now() + Math.random(),
                    title: item.title,
                    description: item.desc,
                    date: dateStr,
                    priority: 'normal',
                    completed: false,
                    fromRoutine: false,
                    projectId: projectId,
                    frequency: 'none',
                    isAutomated: true,
                    guideContent: item.guide
                });
            }
            taskCount++;
        });

        // Trigger routine processing
        processRoutines();
        // alert('Geradas ' + taskCount + ' tarefas/rotinas para ' + culture); // DEBUG
    } catch (err) {
        alert('ERRO em generateProjectTasks: ' + err.message);
        console.error(err);
    }
}

function deleteProject(id) {
    if (!confirm('⚠️ Tem certeza que deseja apagar este projeto?\n\nIsso apagará TODAS as tarefas vinculadas a ele permanentemente.')) return;

    // 1. Remove Project
    state.projects = state.projects.filter(p => p.id !== id);

    // 2. Remove Linked Tasks
    // Use loose comparison because sometimes IDs can be strings/numbers mismatch during storage
    state.tasks = state.tasks.filter(t => parseInt(t.projectId) !== parseInt(id));

    // 3. Reset View if needed
    if (state.currentProject === id) {
        state.currentProject = 'all';
    }

    saveData();
    renderProjects();
    renderTasks();
}





function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) { task.completed = !task.completed; saveData(); }
}

function deleteTask(id) {
    if (confirm('Excluir tarefa?')) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveData();
    }
}

// Modals
function toggleModal(show) {
    if (show) {
        if (!state.editingId) {
            // New Task default setup
            // const currentISO = getLocalISODate(state.viewDate); // Removed
            // elements.inputs.date.value = currentISO; // Removed
            updateProjectSelect();
            elements.modal.querySelector('h2').textContent = 'Nova Tarefa';
            elements.taskForm.reset();
        }
        elements.modal.classList.add('visible');
    }
    else {
        elements.modal.classList.remove('visible');
        state.editingId = null; // Clear edit flag on close
    }
}

function toggleProjectModal(show) {
    if (show) {
        // Reset Date to Today
        elements.inputs.projStartDate.value = getLocalISODate(new Date());
        elements.projectModal.classList.add('visible');
    }
    else elements.projectModal.classList.remove('visible');
}

// Moon Helpers
function openMoonModal(phase) {
    elements.moonModalTitle.innerHTML = `${phase.icon} ${phase.name}`;
    elements.moonModalContent.innerHTML = getMoonContent(phase);
    // Bind buttons
    elements.moonModalContent.querySelectorAll('.btn-guide').forEach(btn => {
        btn.addEventListener('click', () => openGuideModal(btn.dataset.guide, phase));
    });
    elements.moonModal.classList.add('visible');
}

function getMoonContent(phase) {
    return `
        <p class="moon-detail-intro"><strong>Fase Atual:</strong> ${phase.name}</p>
        <div class="moon-detail-section">
            <div class="section-flex-header"><h4>🌱 No Plantio</h4><button class="btn-guide" data-guide="planting">(saiba como)</button></div>
            <p>${phase.details.planting}</p>
        </div>
        <div class="moon-detail-section">
            <div class="section-flex-header"><h4>✂️ Nas Podas</h4><button class="btn-guide" data-guide="pruning">(saiba como)</button></div>
            <p>${phase.details.pruning}</p>
        </div>
        <div class="moon-detail-section">
            <div class="section-flex-header"><h4>🍯 Na Colheita</h4><button class="btn-guide" data-guide="harvest">(saiba como)</button></div>
            <p>${phase.details.harvest}</p>
        </div>
    `;
}

function openGuideModal(type, phase) {
    renderGuideContent(type, phase);
}

// Old fullGuides removed. Using the detailed one below.

function renderGuideContent(type, phase) {
    let phaseKey = 'nova';
    if (phase.name.includes('Crescente')) phaseKey = 'crescente';
    else if (phase.name.includes('Cheia')) phaseKey = 'cheia';
    else if (phase.name.includes('Minguante')) phaseKey = 'minguante';

    elements.guideModalTitle.textContent = 'Guia Rápido';
    elements.guideModalContent.innerHTML = fullGuides[type][phaseKey] || '<p>Sem detalhes.</p>';
    elements.guideModal.classList.add('visible');
}

function openAutoGuide(title, content) {
    let finalContent = content;

    // Inject Soil Data
    if (state.soilAnalysis) {
        const d = state.soilAnalysis;
        finalContent = finalContent.replace(/{{CALC_GM2}}/g, d.limingGm2);
        finalContent = finalContent.replace(/{{CALC_TON}}/g, d.limingTonHa.toFixed(2));
        finalContent = finalContent.replace(/{{NPK_FORMULA}}/g, d.npkRec || '10-10-10');
        finalContent = finalContent.replace(/{{NPK_GM2}}/g, d.npkGm2);
    } else {
        // Fallback if no analysis
        finalContent = finalContent.replace(/{{CALC_GM2}}/g, '200 (Genérico)');
        finalContent = finalContent.replace(/{{CALC_TON}}/g, '2.0 (Genérico)');
        finalContent = finalContent.replace(/{{NPK_FORMULA}}/g, '10-10-10');
        finalContent = finalContent.replace(/{{NPK_GM2}}/g, '50 (Genérico)');

        finalContent = `<div style="background:#fff3cd; color:#856404; padding:10px; border-radius:5px; margin-bottom:15px; font-size:0.9rem;">⚠️ <strong>Atenção:</strong> Você ainda não fez uma Análise de Solo. Os valores abaixo são genéricos!</div>` + finalContent;
    }

    elements.guideModalTitle.textContent = title;
    elements.guideModalContent.innerHTML = finalContent;
    elements.guideModal.classList.add('visible');
}

function getMoonPhase(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let c = 0, e = 0, jd = 0, b = 0;
    if (month < 3) { year--; month += 12; }
    ++c; c = 365.25 * year; e = 30.6 * (month + 1);
    jd = c + e + day - 694039.09; jd /= 29.5305882;
    b = parseInt(jd); jd -= b; b = Math.round(jd * 8);
    if (b >= 8) b = 0;

    const detailsNova = {
        planting: 'A seiva desce para as raízes. ideal para plantas de raiz (cenoura, mandioca) e bulbos.',
        pruning: 'Melhor fase para podas de limpeza. A planta sente menos e cicatriza bem.',
        harvest: 'Colheita de raízes, madeira para construção (dura mais) e bambu.'
    };
    const detailsCrescente = {
        planting: 'A seiva começa a subir. Plante tomate, pimentão, feijão e tudo que dá fruto acima da terra.',
        pruning: 'Poda de formação. Estimula o crescimento rápido dos ramos laterais.',
        harvest: 'Ervas medicinais (os óleos estão subindo) e folhas para chá.'
    };
    const detailsCheia = {
        planting: 'Seiva na copa! Plante flores e hortaliças folhosas (alface, couve). Evite estacas agora.',
        pruning: 'Evite podas drásticas! A planta perde muita seiva e pode enfraquecer.',
        harvest: 'Frutas suculentas e grãos. Tudo está mais cheio de água e sabor.'
    };
    const detailsMinguante = {
        planting: 'Força volta para a terra. Bom para raízes e replantio de mudas (menos estresse).',
        pruning: 'Poda de produção e rejuvenescimento. O galho crescerá com mais força depois.',
        harvest: 'Milho, feijão e sementes para guardar. Secam melhor e livre de carunchos.'
    };

    const phases = [
        { name: 'Lua Nova', icon: '🌑', tip: 'Energia nas raízes. Tempo de planejar.', details: detailsNova },
        { name: 'Lua Crescente', icon: '🌒', tip: 'A seiva sobe. Tempo de plantar e acelerar.', details: detailsCrescente },
        { name: 'Quarto Crescente', icon: '🌓', tip: 'A seiva sobe. Tempo de plantar e acelerar.', details: detailsCrescente },
        { name: 'Crescente Gibosa', icon: '🌔', tip: 'Aceleração máxima. Cuidado com pragas.', details: detailsCrescente },
        { name: 'Lua Cheia', icon: '🌕', tip: 'Energia nas folhas/frutos. Colheita farta.', details: detailsCheia },
        { name: 'Minguante Gibosa', icon: '🌖', tip: 'Diminuindo a força. Hora de finalizar.', details: detailsMinguante },
        { name: 'Quarto Minguante', icon: '🌗', tip: 'Seiva descendo. Poda e raízes.', details: detailsMinguante },
        { name: 'Lua Minguante', icon: '🌘', tip: 'Repouso da terra. Limpeza e raízes.', details: detailsMinguante }
    ];
    return phases[b];
}

// Soil Analysis Logic (Simulated AI)
function handleSoilAnalysis(e) {
    e.preventDefault();

    // Loading State
    const btn = elements.btnAnalyze;
    const btnText = elements.analyzeBtnText;
    const originalText = btnText.textContent;

    btn.disabled = true;
    btnText.textContent = "🔄 Analisando dados...";
    btn.style.opacity = "0.7";

    // Simulate Processing Delay
    setTimeout(() => {
        try {
            const ph = parseFloat(elements.inputs.soilPh.value);
            const v = parseFloat(elements.inputs.soilV.value) || 0;
            const ctc = parseFloat(elements.inputs.soilCTC.value) || 0;
            const p = parseFloat(elements.inputs.soilP.value) || 0;
            const k = parseFloat(elements.inputs.soilK.value) || 0;
            const clay = parseFloat(elements.inputs.soilClay.value) || 0;
            const culture = elements.inputs.soilCulture.value;

            const result = analyzeSoil(ph, v, ctc, p, k, clay, culture);

            // Save Result to State
            state.soilAnalysis = result.data; // .data contains raw numbers for injection
            saveData();

            renderSoilResult(result);

            elements.soilModal.classList.remove('visible');
            elements.soilResultModal.classList.add('visible');
            // elements.soilForm.reset(); // Keep values for correction if needed?

        } catch (error) {
            alert("Erro na análise: " + error.message);
        } finally {
            btn.disabled = false;
            btnText.textContent = originalText;
            btn.style.opacity = "1";
        }
    }, 1500); // 1.5s delay for "AI effect"
}

function analyzeSoil(ph, v, ctc, p, k, clay, culture) {
    let diagnosis = [];
    let actions = [];
    let score = 0; // 0 to 10 health score

    // Target V% based on culture
    let targetV = 60;
    // Basic Needs
    let needLiming = false;
    let limingTonHa = 0;

    // Culture Settings
    // Defaults for simplified logic
    let targetP = 12; // mg/dm3 (Medium fertility threshold)
    let targetK = 0.3; // cmolc/dm3

    if (culture === 'milho' || culture === 'feijao' || culture === 'cafe') {
        targetV = 70;
        targetP = 15;
    } else if (culture === 'hortalicas') {
        targetV = 80;
        targetP = 30; // Veg needs more P
    }

    // 1. pH & Liming Analysis
    if (ph < 5.5) {
        diagnosis.push({ type: 'bad', text: 'Acidez Elevada (pH < 5.5)' });
        score += 2;
        needLiming = true;
    } else if (ph < 6.0) {
        diagnosis.push({ type: 'warn', text: 'Acidez Moderada' });
        score += 6;
        if (v < targetV) needLiming = true;
    } else if (ph >= 6.0 && ph <= 7.0) {
        diagnosis.push({ type: 'good', text: 'pH Ideal' });
        score += 10;
    } else {
        diagnosis.push({ type: 'warn', text: 'Alcalinidade (> 7.0)' });
        score += 5;
    }

    // Liming Calculation: NC (t/ha) = (V2 - V1) x CTC / 100
    if (needLiming && ctc > 0) {
        // If current V is less than target
        if (v < targetV) {
            limingTonHa = ((targetV - v) * ctc) / 100;
            // PRNT correction? Assuming PRNT 80% for Dolomitic usually
            // Formula is usually for PRNT 100. Let's start raw or assume user buys commercial.
            // Let's standard to PRNT 100 for theoretical, but outputting practical often implies adjustments.
            // Keeping it simple: Raw Ton/ha is the standard recommendation base.

            const gPerM2 = limingTonHa * 100; // 1 t/ha = 100 g/m2

            actions.push(`<strong>Calagem Necessária:</strong> Aplicar <strong>${limingTonHa.toFixed(2)} ton/ha</strong> de Calcário Dolomítico.`);
            actions.push(`🔍 Em pequenas áreas: <strong>${Math.round(gPerM2)}g por m²</strong>.`);
        } else {
            actions.push(`Apesar do pH, a saturação (V%) está boa. Calagem de manutenção apenas se pH < 5.5.`);
        }
    } else if (needLiming && ctc === 0) {
        actions.push('⚠️ Faltou o valor de CTC para calcular a quantidade exata de calcário.');
        score -= 2;
    }

    // 2. NPK (Adubação)
    let npkRec = "";
    let npkAmount = 0; // g/m2

    // Simple Texture check
    if (clay > 0) {
        if (clay < 15) diagnosis.push({ type: 'warn', text: 'Solo Arenoso (parcele a adubação)' });
    }

    // P Logic
    let pStatus = 'ok';
    if (p < targetP * 0.5) pStatus = 'low';
    else if (p > targetP * 1.5) pStatus = 'high';

    // K Logic
    let kStatus = 'ok';
    if (k < targetK * 0.5) kStatus = 'low';

    // Recommendation Logic (Simplified)
    if (pStatus === 'low' || kStatus === 'low') {
        diagnosis.push({ type: 'bad', text: 'Baixa Fertilidade (P ou K baixos)' });
        if (culture === 'hortalicas') {
            npkRec = "4-14-8";
            npkAmount = 200; // g/m2 high dose
        } else {
            npkRec = "4-14-8";
            npkAmount = 80; // g/m2 std dose
        }
    } else if (pStatus === 'ok' && kStatus === 'ok') {
        diagnosis.push({ type: 'good', text: 'Fertilidade Equilibrada' });
        npkRec = "10-10-10";
        npkAmount = (culture === 'hortalicas') ? 100 : 50; // Maintenance
    } else {
        diagnosis.push({ type: 'good', text: 'Alta Fertilidade' });
        npkRec = "10-10-10";
        npkAmount = 30; // Low maintenance
    }

    // Formatting NPK Action
    if (npkRec) {
        actions.push(`<strong>Adubação (${culture}):</strong> Aplicar NPK <strong>${npkRec}</strong>.`);
        actions.push(`📦 Quantidade: <strong>${npkAmount}g por m²</strong> (ou ${npkAmount * 10} kg/ha).`);
        if (culture === 'milho' || culture === 'hortalicas') {
            actions.push(`🌿 Cobertura: Aplicar Ureia (Nitrogênio) após 30-40 dias (20g/m²).`);
        }
    }

    // Generate Final Text
    // Return both formatted display data and raw data for templating
    const rawData = {
        limingTonHa,
        limingGm2: Math.round(limingTonHa * 100),
        npkRec,
        npkGm2: npkAmount,
        culture
    };

    return { diagnosis, actions, score: Math.min(10, score), data: rawData };
}

function renderSoilResult(result) {
    const container = elements.soilResultContent;

    let html = `<div style="text-align:center; margin-bottom: 20px;">
        <div style="font-size: 3rem; color: ${result.score > 7 ? '#2E7D32' : (result.score > 4 ? '#F57C00' : '#D32F2F')}">${result.score * 10}%</div>
        <p style="color:#666; margin:0;">Saúde do Solo</p>
    </div>`;

    html += `<div class="diagnosis-section"><div class="diagnosis-label">Diagnóstico</div>`;
    result.diagnosis.forEach(d => {
        html += `<div class="diagnosis-value val-${d.type}">• ${d.text}</div>`;
    });
    html += `</div>`;

    if (result.actions.length > 0) {
        html += `<div class="diagnosis-section"><div class="diagnosis-label">Recomendações</div>`;
        result.actions.forEach(a => {
            html += `<p style="margin: 5px 0;">👉 ${a}</p>`;
        });
        html += `</div>`;
    } else {
        html += `<div class="diagnosis-section"><p style="color:#2E7D32;">✨ Seu solo está excelente! Mantenha a adubação de manutenção.</p></div>`;
    }

    container.innerHTML = html;
}

const fullGuides = {
    planting: {
        nova: `
            <h3>🌱 Plantio na Lua Nova</h3>
            <p><strong>Foco: Raízes e Resistência</strong></p>
            <p>A gravidade da Lua soma-se à do Sol, puxando a seiva para baixo (para as raízes). A luz lunar é mínima, induzindo o repouso vegetativo.</p>
            <ul>
                <li><strong>O que plantar:</strong> Cenoura, beterraba, nabo, rabanete, alho, cebola.</li>
                <li><strong>O que evitar:</strong> Alfaces e couves (podem espigar rápido demais).</li>
                <li><strong>Dica de Ouro:</strong> É o melhor momento para adubar a terra! O adubo desce rápido e incorpora bem no solo.</li>
            </ul>`,
        crescente: `
            <h3>🌱 Plantio na Lua Crescente</h3>
            <p><strong>Foco: Crescimento Vegetativo</strong></p>
            <p>A luz da lua aumenta, estimulando a fotossíntese noturna. A seiva começa a fluir vigorosamente do caule para as folhas.</p>
            <ul>
                <li><strong>O que plantar:</strong> Tomate, pimentão, jiló, quiabo, abóbora, feijão-vagem, milho verde.</li>
                <li><strong>Destaque:</strong> Tudo que cresce acima do solo e tem ciclo curto vai adorar essa fase.</li>
                <li><strong>Cuidado:</strong> As ervas daninhas também crescem rápido agora. Fique de olho na capina!</li>
            </ul>`,
        cheia: `
            <h3>🌱 Plantio na Lua Cheia</h3>
            <p><strong>Foco: Folhas e Vitalidade</strong></p>
            <p>O pico da luminosidade lunar ativa o crescimento máximo das folhas. A seiva está toda concentrada na copa das plantas.</p>
            <ul>
                <li><strong>O que plantar:</strong> Hortaliças folhosas (alface, rúcula, agrião, couve), flores e repolho.</li>
                <li><strong>Transplantes:</strong> Ótima época para mudar vasos de lugar ou transplantar mudas jovens.</li>
                <li><strong>Atenção:</strong> As plantas absorvem mais água. Regue bem!</li>
            </ul>`,
        minguante: `
            <h3>🌱 Plantio na Lua Minguante</h3>
            <p><strong>Foco: Raízes e Tubérculos</strong></p>
            <p>A luz diminui, e a planta começa a "recolher" energias para as raízes novamente. É uma fase de consolidação.</p>
            <ul>
                <li><strong>O que plantar:</strong> Batata, batata-doce, inhame, mandioca, gengibre.</li>
                <li><strong>Árvores:</strong> Bom momento para plantar árvores frutíferas, pois elas criarão raízes fortes antes de crescer.</li>
                <li><strong>Germinação:</strong> Mais lenta, porém as plantas nascem mais rústicas e resistentes à seca.</li>
            </ul>`
    },
    pruning: {
        nova: `
            <h3>✂️ Poda na Lua Nova</h3>
            <p><strong>Limpeza e Formação</strong></p>
            <p>Com a seiva nas raízes, ao cortar os galhos, a planta "sangra" muito pouco. O risco de entrar doenças pelos cortes é mínimo.</p>
            <ul>
                <li><strong>Ideal para:</strong> Poda drástica de renovação em árvores velhas.</li>
                <li><strong>Limpeza:</strong> Retire galhos secos e doentes agora.</li>
                <li><strong>Resultado:</strong> A planta brotará com vigor renovado na próxima lua crescente.</li>
            </ul>`,
        crescente: `
            <h3>✂️ Poda na Lua Crescente</h3>
            <p><strong>Estimulante (Cuidado!)</strong></p>
            <p>A seiva está subindo com força. Se você podar agora, a planta vai rebrotar muito rápido, focando em folhas e ramos novos.</p>
            <ul>
                <li><strong>Use para:</strong> Cercas vivas que você quer fechar rápido.</li>
                <li><strong>Evite em:</strong> Frutíferas, pois pode diminuir a produção de frutos em favor de folhas.</li>
            </ul>`,
        cheia: `
            <h3>✂️ Poda na Lua Cheia</h3>
            <p><strong>🚫 Não Recomendada</strong></p>
            <p>A planta está "cheia" de seiva nas pontas. Podar agora causa hemorragia de nutrientes e deixa feridas abertas para fungos.</p>
            <ul>
                <li><strong>Exceção:</strong> Apenas se for colher flores para arranjos (duram mais).</li>
                <li><strong>Risco:</strong> A planta pode enfraquecer e atrair insetos.</li>
            </ul>`,
        minguante: `
            <h3>✂️ Poda na Lua Minguante</h3>
            <p><strong>A Poda Real</strong></p>
            <p>O momento clássico da poda agrícola. A seiva está descendo, então a planta sente pouco o corte e não desperdiça energia.</p>
            <ul>
                <li><strong>Ideal para:</strong> Frutíferas (limão, laranja, manga), café e madeira.</li>
                <li><strong>Bambu:</strong> Corte bambu apenas na minguante (sem água e sem amido), assim o caruncho não come.</li>
                <li><strong>Cicatrização:</strong> Perfeita e rápida.</li>
            </ul>`
    },
    harvest: {
        nova: `
            <h3>🍯 Colheita na Lua Nova</h3>
            <p><strong>Durabilidade</strong></p>
            <p>Produtos com menor teor de água, alta concentração de minerais.</p>
            <ul>
                <li><strong>Colher:</strong> Madeiras para construção (não apodrece, cupim não gosta).</li>
                <li><strong>Grãos:</strong> Milho e feijão para semente (alta taxa de germinação futura).</li>
            </ul>`,
        crescente: `
            <h3>🍯 Colheita na Lua Crescente</h3>
            <p><strong>Consumo Rápido</strong></p>
            <ul>
                <li><strong>Colher:</strong> Tomates e pimentões para consumo na semana.</li>
                <li><strong>Medicinais:</strong> Ervas colhidas de manhã na crescente têm óleos essenciais Potentes.</li>
            </ul>`,
        cheia: `
            <h3>🍯 Colheita na Lua Cheia</h3>
            <p><strong>Sabor e Suco</strong></p>
            <p>As frutas estão inchadas, doces e suculentas.</p>
            <ul>
                <li><strong>Colher:</strong> Frutas para comer na hora ou fazer suco/geleia.</li>
                <li><strong>Não guarde:</strong> Elas apodrecem mais rápido por causa da água em excesso.</li>
            </ul>`,
        minguante: `
            <h3>🍯 Colheita na Lua Minguante</h3>
            <p><strong>Estocagem e Secagem</strong></p>
            <p>A água "saiu" do fruto/grão. Ideal para armazenar por meses.</p>
            <ul>
                <li><strong>Colher:</strong> Feijão, arroz, milho, abóbora madura, raízes (mandioca cozinha melhor pois tem menos água).</li>
                <li><strong>Palha:</strong> Colher palha e capim para secar.</li>
            </ul>`
    }
};

// Event Listeners
function setupEventListeners() {
    if (elements.addBtn) elements.addBtn.addEventListener('click', () => toggleModal(true));
    if (elements.closeModal) elements.closeModal.addEventListener('click', () => toggleModal(false));
    if (elements.closeProjectModal) elements.closeProjectModal.addEventListener('click', () => toggleProjectModal(false));
    if (elements.closeMoonModal) elements.closeMoonModal.addEventListener('click', () => elements.moonModal.classList.remove('visible'));
    if (elements.closeGuideModal) elements.closeGuideModal.addEventListener('click', () => elements.guideModal.classList.remove('visible'));

    // Outside clicks
    if (elements.modal) elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) toggleModal(false); });
    if (elements.projectModal) elements.projectModal.addEventListener('click', (e) => { if (e.target === elements.projectModal) toggleProjectModal(false); });

    if (elements.prevMoonBtn) elements.prevMoonBtn.addEventListener('click', () => changeDate(-1));
    if (elements.nextMoonBtn) elements.nextMoonBtn.addEventListener('click', () => changeDate(1));

    // Toggle Week Days
    const freqSelect = document.getElementById('taskFreq');
    if (freqSelect) {
        freqSelect.addEventListener('change', (e) => {
            const group = document.getElementById('weekDaysGroup');
            if (group) {
                if (e.target.value === 'weekly') {
                    group.classList.remove('hidden');
                } else {
                    group.classList.add('hidden');
                }
            }
        });
    }

    if (elements.taskForm) elements.taskForm.addEventListener('submit', saveTask);
    if (elements.projectForm) elements.projectForm.addEventListener('submit', addProject);

    // Soil Analysis Listeners
    if (elements.btnSoilAnalysis) elements.btnSoilAnalysis.addEventListener('click', () => {
        elements.soilModal.classList.add('visible');
    });
    if (elements.closeSoilModal) elements.closeSoilModal.addEventListener('click', () => {
        elements.soilModal.classList.remove('visible');
    });
    if (elements.closeSoilResultModal) elements.closeSoilResultModal.addEventListener('click', () => {
        elements.soilResultModal.classList.remove('visible');
    });
    if (elements.soilForm) elements.soilForm.addEventListener('submit', handleSoilAnalysis);

    // Emoji Selection
    document.querySelectorAll('.emoji-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            document.querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedEmoji = e.target.textContent;
        });
    });
}

init();

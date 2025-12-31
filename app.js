// App State
const state = {
    tasks: [],
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
let weatherData = null; // Store weather data globally
let forecastData = null; // Store hourly forecast

// Weather Function
async function fetchWeather() {
    const weatherBtnText = document.getElementById('weatherBtnText');

    try {
        // Get user's location
        if (!navigator.geolocation) {
            if (weatherBtnText) weatherBtnText.textContent = 'Clima (Indisponível)';
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // OpenWeatherMap API (free tier)
            const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // Public demo key

            // Current weather
            const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`;
            // Hourly forecast (for rainfall)
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`;

            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(currentUrl),
                fetch(forecastUrl)
            ]);

            const currentData = await currentResponse.json();
            const hourlyData = await forecastResponse.json();

            if (currentData.main && currentData.weather) {
                weatherData = currentData; // Store globally
                forecastData = hourlyData; // Store forecast

                const temp = Math.round(currentData.main.temp);
                const city = currentData.name;
                const icon = currentData.weather[0].icon;

                // Calculate total rain in next 24h
                let totalRain = 0;
                if (hourlyData.list) {
                    // Sum rain from next 8 entries (24 hours, 3h intervals)
                    for (let i = 0; i < Math.min(8, hourlyData.list.length); i++) {
                        if (hourlyData.list[i].rain && hourlyData.list[i].rain['3h']) {
                            totalRain += hourlyData.list[i].rain['3h'];
                        }
                    }
                }

                // Update button text with icon and rain info
                if (weatherBtnText) {
                    const iconImg = `<img src="https://openweathermap.org/img/wn/${icon}.png" style="width:24px; height:24px; vertical-align:middle; margin-right:4px;">`;
                    const rainInfo = totalRain > 0 ? `🌧️ ${totalRain.toFixed(1)}mm` : '☀️ Sem chuva';
                    weatherBtnText.innerHTML = `${iconImg}${temp}°C | ${rainInfo}`;
                }
            }
        }, (error) => {
            if (weatherBtnText) weatherBtnText.textContent = 'Clima (Localização negada)';
        });
    } catch (error) {
        if (weatherBtnText) weatherBtnText.textContent = 'Clima (Erro)';
        console.error('Weather error:', error);
    }
}

function showWeatherModal() {
    if (!weatherData) {
        alert('Dados do clima ainda não foram carregados. Aguarde um momento.');
        return;
    }

    const data = weatherData;

    // Main info
    document.getElementById('weatherModalTemp').innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" style="width:80px; vertical-align:middle;"> ${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherModalDesc').textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    document.getElementById('weatherModalLocation').textContent = `${data.name}, ${data.sys.country}`;

    // Detailed info
    document.getElementById('weatherHumidity').textContent = `${data.main.humidity}%`;
    document.getElementById('weatherFeelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('weatherWind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('weatherPressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('weatherVisibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('weatherClouds').textContent = `${data.clouds.all}%`;

    // Current rain
    const currentRain = data.rain ? (data.rain['1h'] || 0) : 0;
    document.getElementById('weatherRainNow').textContent = `${currentRain.toFixed(1)} mm/h`;

    // Sunrise/Sunset
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    document.getElementById('weatherSunrise').textContent = sunrise.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('weatherSunset').textContent = sunset.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Render hourly rainfall chart
    renderRainfallChart();

    // Show modal
    document.getElementById('weatherModal').classList.add('visible');
}

function renderRainfallChart() {
    const container = document.getElementById('rainfallChart');
    if (!forecastData || !forecastData.list) {
        container.innerHTML = '<p style="text-align:center; color:#999;">Dados de previsão não disponíveis</p>';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

    // Show next 24 hours (8 entries x 3h each)
    const entries = forecastData.list.slice(0, 8);

    entries.forEach(entry => {
        const time = new Date(entry.dt * 1000);
        const timeStr = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const rain = entry.rain ? (entry.rain['3h'] || 0) : 0;
        const maxRain = 10; // mm for scale
        const barWidth = Math.min((rain / maxRain) * 100, 100);

        html += `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="min-width: 50px; font-size: 0.85rem; color: #666;">${timeStr}</div>
                <div style="flex: 1; background: #e0e0e0; height: 24px; border-radius: 4px; position: relative; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #42A5F5, #1976D2); height: 100%; width: ${barWidth}%; transition: width 0.3s;"></div>
                    <div style="position: absolute; top: 50%; left: 8px; transform: translateY(-50%); font-size: 0.75rem; font-weight: bold; color: ${barWidth > 30 ? 'white' : '#333'};">
                        ${rain.toFixed(1)} mm
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

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
        fetchWeather(); // Load weather data
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

        // Inner HTML for text + delete icon (Replaced by explicit elements for safety)
        btn.textContent = `${p.emoji} ${p.name} `;
        const deleteSpan = document.createElement('span');
        deleteSpan.className = 'delete-project-btn';
        deleteSpan.innerHTML = '&times;';
        deleteSpan.title = 'Apagar Projeto';

        deleteSpan.onclick = (e) => {
            e.stopPropagation(); // Don't switch tab
            // Safe Confirm Pattern
            setTimeout(() => {
                deleteProject(p.id);
            }, 10);
        };

        btn.appendChild(deleteSpan);

        btn.onclick = (e) => {
            // Only switch if we didn't click the delete button (double safety)
            if (e.target !== deleteSpan) {
                state.currentProject = p.id;
                renderProjects();
                renderTasks();
            }
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

        // PLANTING SUGGESTION LOGIC
        if (proj.culture && !task.completed) {
            const isPlanting = ['plantio', 'semeadura', 'transplantio', 'mudança'].some(key => task.title.toLowerCase().includes(key));

            if (isPlanting) {
                const bestPhase = getBestMoonForCrop(proj.culture);
                const currentPhase = getMoonPhase(new Date()); // Today

                // If today is NOT the best phase, find next
                if (!currentPhase.name.includes(bestPhase.replace('Lua ', '')) && currentPhase.name !== bestPhase) {
                    // Find next occurence
                    let tempDate = new Date();
                    let foundNext = false;
                    let attempts = 0;
                    while (!foundNext && attempts < 45) {
                        tempDate.setDate(tempDate.getDate() + 1);
                        const p = getMoonPhase(tempDate);
                        if (p.name.includes(bestPhase.replace('Lua ', '')) || p.name === bestPhase) {
                            foundNext = true;
                        }
                        attempts++;
                    }

                    if (foundNext) {
                        const sugDate = getLocalISODate(tempDate);
                        const niceDate = tempDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
                        guideBtnHtml += `<button onclick="applyReschedule(${task.id}, '${sugDate}')" 
                            style="background:#FFF3E0; color:#E65100; border:1px solid #FFCC80; font-size:0.75rem; padding:4px 8px; border-radius:4px; margin-top:5px; margin-left:5px; cursor:pointer;"
                            title="Clique para mudar a data do plantio e ajustar o cronograma">
                            💡 Mudar p/ <b>${niceDate}</b> (${bestPhase})
                         </button>`;
                    }
                } else {
                    guideBtnHtml += `<div style="background:#E8F5E9; color:#2E7D32; font-size:0.75rem; padding:4px 8px; border-radius:4px; margin-top:5px; display:inline-block; margin-left:5px;">
                            ✨ Lua Atual Ideal!
                         </div>`;
                }
            }
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
                <button class="edit-btn" title="Editar">✎</button>
                <button class="delete-btn" title="Excluir">&times;</button>
            </div>
        `;
        el.querySelector('.task-check').addEventListener('click', (e) => { e.stopPropagation(); toggleTask(task.id); });
        el.querySelector('.edit-btn').addEventListener('click', (e) => { e.stopPropagation(); editTask(task.id); });
        el.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

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
        galinhas_poedeiras: '🐔',
        frangos_corte: '🍗',
        gado_leite: '🥛',
        gado_corte: '🥩',
        suinos: '🐖',
        pomar: '🍊',
        milho: '🌽',
        feijao: '🫘',
        mandioca: '🥔',
        banana: '🍌',
        coqueiro: '🥥'
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
        vagem: 'Vagem',
        mandioca: 'Mandioca',
        banana: 'Banana',
        coqueiro: 'Coqueiro',
        // Novas Culturas
        alface: 'Alface',
        couve: 'Couve',
        rucula: 'Rúcula',
        cheiro_verde: 'Cheiro-Verde',
        manjericao: 'Manjericão',
        alecrim: 'Alecrim',
        hortela: 'Hortelã',
        tomate: 'Tomate',
        pimentao: 'Pimentão',
        pepino: 'Pepino',
        quiabo: 'Quiabo',
        abobora: 'Abóbora',
        morango: 'Morango',
        melancia: 'Melancia',
        cenoura: 'Cenoura',
        beterraba: 'Beterraba',
        batata_doce: 'Batata Doce',
        maracuja: 'Maracujá',
        abacaxi: 'Abacaxi',
        cafe: 'Café',
        cana: 'Cana-de-Açúcar',
        codornas: 'Codornas',
        patos: 'Patos',
        ovinos: 'Ovelhas',
        caprinos: 'Cabras',
        tilapias: 'Tilápias',
        abelhas: 'Abelhas'
    };
    return map[type] || 'Projeto';
}

function addProject(e) {
    e.preventDefault();
    try {
        console.log('[addProject] Starting...');
        const culture = elements.inputs.projCulture.value;
        const soilManagementDateVal = elements.inputs.projStartDate.value;
        console.log('[addProject] Culture:', culture, 'Date:', soilManagementDateVal);

        // Ensure we have a string YYYY-MM-DD for soil management start
        let soilManagementDateStr = soilManagementDateVal;
        if (!soilManagementDateStr) {
            soilManagementDateStr = getLocalISODate(new Date());
        }

        console.log('[addProject] Calculating prep days...');
        // Calculate prep days (most negative day in template)
        const template = cropTemplates[culture];
        let prepDays = 0;
        if (template) {
            const days = template.map(t => t.day);
            const minDay = Math.min(0, ...days);
            prepDays = Math.abs(minDay);
        }
        console.log('[addProject] Prep days:', prepDays);

        // Calculate actual planting date (Day 0) = soilManagementDate + prepDays
        const soilDate = new Date(soilManagementDateStr + 'T12:00:00');
        soilDate.setDate(soilDate.getDate() + prepDays);
        const plantingDateStr = getLocalISODate(soilDate);
        console.log('[addProject] Planting date:', plantingDateStr);

        // Auto-Name Logic: "Gado de Leite #1", "Gado de Leite #2", etc.
        const baseName = getProjectNameForType(culture);
        const existingCount = state.projects.filter(p => p.name.startsWith(baseName)).length;
        const finalName = `${baseName} #${existingCount + 1}`;
        console.log('[addProject] Project name:', finalName);

        // Create Project
        const newProject = {
            id: Date.now(),
            name: finalName,
            emoji: getEmojiForType(culture),
            culture: culture // Save culture for future reference
        };
        state.projects.push(newProject);
        console.log('[addProject] Project created, ID:', newProject.id);

        // Generate Tasks (Pass PLANTING DATE as Day 0)
        console.log('[addProject] Calling generateProjectTasks...');
        generateProjectTasks(newProject.id, culture, plantingDateStr);
        console.log('[addProject] Tasks generated successfully');

        saveData();
        renderProjects();

        // Switch to new project
        state.currentProject = newProject.id;
        renderProjects();
        renderTasks();

        elements.projectForm.reset();
        toggleProjectModal(false);
        console.log('[addProject] Completed successfully');
    } catch (err) {
        console.error('[addProject] ERROR:', err);
        console.error('[addProject] Stack:', err.stack);
        alert('ERRO em addProject: ' + err.message + '\n\nVeja o console (F12) para mais detalhes.');
    }
}

// ... (deleteProject is skipped in replacement unless I include it in range, but I can target specific functions)

// Simplified Project Templates
// ----------------------
// EXPANDED TEMPLATES
// ----------------------
const cropTemplates = {
    // 1. Galinhas Poedeiras
    galinhas_poedeiras: [
        {
            day: -2,
            title: 'Limpeza do Galinheiro',
            desc: 'Desinfecção profunda e preparo da cama.',
            guide: `
                <h3>🧼 Higiene e Biosseguridade (Detalhado)</h3>
                <p>A preparação do ambiente é 50% do sucesso.</p>
                <h4>1. Limpeza Seca e Úmida</h4>
                <ul>
                    <li>Retire toda a matéria orgânica (fezes, penas, pó) varrendo bem.</li>
                    <li>Lave teto, paredes e chão com detergente neutro para remover a gordura/biofilme.</li>
                </ul>
                <h4>2. Desinfecção</h4>
                <ul>
                    <li><strong>Cal:</strong> Faça a caiação das paredes (pintura com cal virgem). O cal mata bactérias e piolhos pelo pH alto. Receita: 1kg de cal para 4L de água + garrafa de cola branca (para fixar).</li>
                    <li><strong>Química:</strong> Use amônia quaternária ou iodo (diluição conforme rótulo) no chão e equipamentos.</li>
                </ul>
                <h4>3. A Cama (Piso)</h4>
                <ul>
                    <li>Use <strong>Maravalha</strong> (serragem grossa) ou casca de arroz.</li>
                    <li><strong>Altura:</strong> Mínimo de 8 a 10cm. Se for muito fina, fica úmida rápido e gera calos nos pés das aves (pododermatite).</li>
                </ul>
            `
        },
        {
            day: 0,
            title: 'Chegada das Pintainhas',
            desc: 'Aclimatação Crítica.',
            guide: `
                <h3>🐤 Recepção de Pintainhas de 1 Dia</h3>
                <p>Este é o momento mais frágil da vida da ave.</p>
                
                <h4>1. Hidratação (Primeiras 4h)</h4>
                <p>pintinhos viajam e chegam desidratados. <strong>Não dê ração nas primeiras 2-4 horas, só água!</strong></p>
                <ul>
                    <li><strong>Soro Caseiro:</strong> 1 litro de água + 2 colheres rasas de açúcar (energia). Evite água gelada! Temperatura ambiente (24°C).</li>
                </ul>

                <h4>2. Aquecimento (Círculo de Proteção)</h4>
                <p>Elas não regulam a própria temperatura.</p>
                <ul>
                    <li><strong>Temperatura Alvo:</strong> 32°C a 34°C na altura do pintinho.</li>
                    <li><strong>Comportamento:</strong>
                        <br>✅ Espalhados e piando pouco: Conforto.
                        <br>❄️ Amontoados no centro/lâmpada: Frio (Abaixe a lâmpada!).
                        <br>🔥 Afastados nas bordas e ofegantes: Calor (Erga a lâmpada!).
                    </li>
                </ul>
            `
        },
        {
            day: 0,
            type: 'routine',
            freq: 'daily',
            title: 'Tratos (Galinhas)',
            desc: 'Manejo Diário Essencial.',
            guide: `
                <h3>🔄 Rotina de Ouro (Diária)</h3>
                <h4>1. Água: O Nutriente Esquecido</h4>
                <p>Galinha bebe o dobro do que come. Água suja = Coccidiose e Salmonela.</p>
                <ul>
                    <li>Lave os bebedouros com bucha/escova todo dia de manhã.</li>
                    <li>Água fresca estimula o consumo de ração no calor.</li>
                </ul>
                <h4>2. Ração</h4>
                <ul>
                    <li>Nunca deixe faltar, mas não deixe sobrar e fermentar (azedar).</li>
                    <li>mexa na ração nos comedouros 2x ao dia para estimular a curiosidade delas.</li>
                </ul>
                <h4>3. Observação Tácita</h4>
                <p>Qualquer ave encolhida, com penas arrepiadas ou olhos fechados deve ser separada (hospital) imediatamente.</p>
            `
        },
        {
            day: 120,
            title: 'Estimulação de Luz',
            desc: 'Programa de Luz para Postura.',
            guide: `
                <h3>💡 A Ciência da Luz e dos Ovos</h3>
                <p>A galinha precisa de "dia longo" para ovular. É a luz entrando no olho que ativa a hipófise para produzir ovos.</p>
                <ul>
                    <li><strong>Meta:</strong> Chegar a 16 ou 17 horas de luz totais (Sol + Artificial) no pico de postura.</li>
                    <li><strong>Como fazer:</strong> Aumente 30 minutos por semana a partir da 18ª semana de vida.</li>
                    <li><strong>Regra Mortal:</strong> NUNCA diminua a luz durante a fase de produção (ex: lâmpada queimada por dias). Isso faz elas entrarem em muda (pararem de pôr).</li>
                </ul>
            `
        },
        {
            day: 140,
            type: 'routine',
            freq: 'daily',
            title: 'Coleta de Ovos',
            desc: 'Procedimento de Coleta.',
            guide: `
                <h3>🥚 Coleta Profissional</h3>
                <h4>Frequência</h4>
                <p>Pelo menos 2 ou 3 vezes ao dia (10h, 13h, 16h). Ovos deixados no ninho podem ser bicados, sujos ou "chocados" pelo calor.</p>
                
                <h4>Limpeza</h4>
                <ul>
                    <li><strong>Ovos Limpos:</strong> Guarde direto. Não lave! A casca tem uma película ("cutícula") que impede bactérias.</li>
                    <li><strong>Ovos Sujos:</strong> Limpe com uma lixa fina ou pano seco. Se precisar lavar, use água morna (mais quente que o ovo) e sanitizante próprio, e seque imediatamente.</li>
                </ul>
            `
        }
    ],

    // 2. Frangos de Corte
    frangos_corte: [
        {
            day: -3,
            title: 'Vazio Sanitário',
            desc: 'Protocolo de Limpeza.',
            guide: `
                <h3>🚫 O Poder do Vazio Sanitário</h3>
                <p>O vazio sanitário é o tempo entre a retirada de um lote e a entrada do outro. É a única forma de quebrar ciclos de vírus.</p>
                <ul>
                    <li><strong>Tempo Mínimo:</strong> 10 dias com o galpão limpo e vazio.</li>
                    <li><strong>Procedimento:</strong> Retirar toda a cama antiga (venda para adubo, longe do galpão). Varrer, lavar com detergente, desinfetar com glutaraldeído ou iodo, e caiar.</li>
                    <li><strong>Controle de Roedores:</strong> É no vazio que os ratos procuram comida. Use iscas nas áreas externas.</li>
                </ul>
            `
        },
        {
            day: 0,
            title: 'Alojamento',
            desc: 'Recepção.',
            guide: `
                <h3>🐤 Start Perfeito</h3>
                <p>O peso do frango aos 7 dias define o peso de abate. Um erro hoje custa caro no dia 45.</p>
                <ul>
                    <li><strong>Papel no Chão:</strong> Cubra 30% da área (sob os bebedouros e comedouros) com papel pardo/jornal e jogue ração em cima. Eles aprendem a comer pelo barulho do bico no papel.</li>
                    <li><strong>Temperatura de Chão:</strong> A cama deve estar quente (30°C+). Se a perna do pinto esfriar, ele não anda, não come e morre. Ligue aquecedores 4h antes de eles chegarem.</li>
                </ul>
            `
        },
        {
            day: 0,
            type: 'routine',
            freq: 'daily',
            title: 'Tratos (Corte)',
            desc: 'Manejo de Cama e Ar.',
            guide: `
                <h3>🔄 Manejo de Ambiência</h3>
                <h4>Cama (Piso)</h4>
                <p>Cama úmida ("cascão") libera amônia, que queima o pulmão do frango e causa ascite (barriga d'água).</p>
                <ul>
                    <li><strong>Ação:</strong> Revire a cama todo dia, especiamente perto dos bebedouros. Retire partes molhadas e reponha maravalha seca.</li>
                </ul>
                <h4>Ventilação</h4>
                <p>Frango de corte gera muito calor. Abra cortinas durante o dia (com cuidado com vento direto em pintinhos) para renovar o ar.</p>
            `
        },
        {
            day: 7,
            type: 'routine',
            freq: 'weekly',
            title: 'Pesagem',
            desc: 'Controle de Conversão.',
            guide: `
                <h3>⚖️ Metas de Peso (Referência Cobb/Ross)</h3>
                <p>Pese 5% das aves (escolha aleatória, pegue aves de vários pontos, não só os bonitos).</p>
                <ul>
                    <li><strong>Dia 7:</strong> Meta ~180-200g (4x o peso inicial).</li>
                    <li><strong>Dia 14:</strong> Meta ~450-500g.</li>
                    <li><strong>Dia 21:</strong> Meta ~900-1000g.</li>
                </ul>
                <p>Se estiver abaixo, revise: Temperatura noturna, qualidade da ração ou acesso à água (bebedouros suficientes?).</p>
            `
        },
        { day: 45, title: 'Abate', desc: 'Retirada.', guide: '<h3>🍗 Jejum Pré-Abate</h3><p>Para evitar contaminação da carne com fezes no abate:</p><ul><li>Retire a ração 6 a 8 horas antes de pegar as aves.</li><li>MANTENHA A ÁGUA! Se tirar a água, eles desidratam e a carne fica ruim, além de ser dificil depenar.</li><li>Capture com calma, segurando pelas duas pernas, nunca pelas asas (gera hematomas).</li></ul>' }
    ],

    // 3. Gado de Leite
    gado_leite: [
        {
            day: 0,
            title: 'Início do Controle',
            desc: 'Identificação e Histórico.',
            guide: `
                <h3>🥛 Gestão do Rebanho</h3>
                <p>Vaca sem nome/número não se gerencia.</p>
                <ul>
                    <li><strong>Brincos:</strong> Identifique todas. Anote data de parto provável.</li>
                    <li><strong>Escore Corporal (ECC):</strong> Avalie se estão magras ou gordas. Vaca muito magra não emprenha e não dá leite. (Meta ECC 3.0 a 3.5).</li>
                </ul>
            `
        },
        {
            day: 0,
            type: 'routine',
            freq: 'daily',
            title: 'Ordenha',
            desc: 'Procedimento Padrão.',
            guide: `
                <h3>🥛 O Ritual da Ordenha (Higiene Absoluta)</h3>
                <p>Mastite se pega na ordenha errada.</p>
                <ol>
                    <li><strong>Teste da Caneca:</strong> Jatos iniciais no fundo preto para ver grumos (mastite clínica).</li>
                    <li><strong>Pré-Dipping:</strong> Mergulhar tetos em solução de iodo/clorexidina. Esperar 30s (tempo de matar bactéria).</li>
                    <li><strong>Secagem:</strong> Papel toalha descartável (1 folha por teto!). Pano sujo espalha doença.</li>
                    <li><strong>Ordenha:</strong> Colocar ordenhadeira ou ordenhar manual. Não deixar a ordenhadeira "chupando" teto vazio (sobreordenha machuca).</li>
                    <li><strong>Pós-Dipping:</strong> Iodo glicerinado para selar o canal do teto.</li>
                    <li><strong>Em pé:</strong> Dê comida logo após a ordenha para a vaca ficar em pé por 30min até o teto fechar.</li>
                </ol>
            `
        },
        {
            day: 15,
            type: 'routine',
            freq: 'monthly',
            title: 'Controle de Carrapatos',
            desc: 'Estratégia.',
            guide: `
                <h3>🪰 Guerra aos Carrapatos</h3>
                <p>Carrapato transmite Tristeza Parasitária Bovina (Babesia/Anaplasma), que mata.</p>
                <ul>
                    <li><strong>Quando tratar:</strong> Quando ver muitos carrapatos pequenos ("uvas passas" já caíram e botaram ovos).</li>
                    <li><strong>Rodízio de Princípios:</strong> Não use o mesmo veneno para sempre. Alterne (Amitraz, Piretróides, Fipronil) a cada ano ou quando falhar.</li>
                    <li><strong>Cuidado com o Leite:</strong> Verifique a CARENÇA do remédio. Maioria dos "Pour-on" proíbe consumo do leite por dias.</li>
                </ul>
            `
        },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Teste de Mastite (CMT)', desc: 'Diagnóstico.', guide: '<h3>🦠 California Mastitis Test (CMT)</h3><p>Detecta mastite sub-clínica (onde o leite parece normal mas a vaca produz menos).</p><ul><li>Misture o leite com reagente na raquete.</li><li>Se formar gel/gosma: Positivo.</li><li>Trate vacas positivas ou seque o quarto afetado se crônico.</li></ul>' }
    ],

    // 4. Gado de Corte
    gado_corte: [
        { day: 0, title: 'Entrada no Pasto', desc: 'Manejo de Entrada.', guide: '<h3>🐂 Recepção de Gado</h3><p>Gado estressado não engorda.</p><ul><li>Hidratação e Sal Mineral à vontade na chegada.</li><li>Deixe descansarem 1 dia antes de vacinar ou marcar.</li><li><strong>Lotação:</strong> Ajuste o número de bois para o tamanho do pasto. Pasto rapado = prejuízo ("boi sanfona").</li></ul>' },
        {
            day: 1,
            type: 'routine',
            freq: 'daily',
            title: 'Ronda do Pasto',
            desc: 'Inspeção Detalhada.',
            guide: `
                <h3>👀 O Olho do Dono (Ronda)</h3>
                <p>Não é só olhar se o boi tá vivo.</p>
                <ul>
                    <li><strong>Cocho de Sal:</strong> Nunca pode estar vazio. Boi sem mineral não converte capim em carne. Limpe se tiver água de chuva ou folhas.</li>
                    <li><strong>Bebedouro:</strong> Lave periodicamente. Boi bebe 40-70 litros/dia. Água suja diminui consumo.</li>
                    <li><strong>Fezes:</strong> Fezes muito duras e secas = Capim muito seco/pouca proteína. (Precisa de Sal Proteinado? Urea?).</li>
                </ul>
            `
        },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Pesagem de Controle', desc: 'GND.', guide: '<h3>⚖️ Ganho Médio Diário (GMD)</h3><p>Pese sempre no mesmo horário (de preferência de manhã, em jejum).</p><ul><li><strong>Meta Águas:</strong> 700g a 1kg/dia.</li><li><strong>Meta Seca:</strong> Manter peso ou ganho leve (na recria).</li><li>Se não bater a meta: Avalie altura do pasto e parasitas.</li></ul>' },
        { day: 60, title: 'Vermifugação', desc: 'Sanidade.', guide: '<h3>💉 Calendário Sanitário Básico</h3><ul><li><strong>Aftosa:</strong> Obrigatória (maio/nov).</li><li><strong>Brucelose:</strong> Fêmeas (3-8 meses).</li><li><strong>Clostridioses (Carbúnculo):</strong> Matam subitamente o maior bezerro. Vacine todo ano.</li><li><strong>Vermífugo:</strong> Estratégico na entrada da seca (maio) para limpar o gado quando o pasto piora.</li></ul>' }
    ],

    // 5. Suínos
    suinos: [
        {
            day: 0,
            title: 'Nascimento/Entrada',
            desc: 'Cuidados Neonatais.',
            guide: `
                <h3>🐖 Manejo do Leitão (Dia 0)</h3>
                <p>Leitão nasce sem imunidade e com pouca energia.</p>
                <ol>
                    <li><strong>Secagem:</strong> Seque com papel toalha ou pó secante (evita hipotermia).</li>
                    <li><strong>Colostro:</strong> Garanta que mamem na primeira hora. O colostro é o único remédio deles.</li>
                    <li><strong>Umbigo:</strong> Corte a 3cm e mergulhe em iodo 10%. Porta de entrada de bactérias.</li>
                    <li><strong>Aquecimento:</strong> Leitão precisa de 32°C. A porca precisa de 20°C. Use o "escamoteador" (caixa aquecida onde só o leitão entra).</li>
                </ol>
            `
        },
        { day: 3, title: 'Aplicação de Ferro', desc: 'Prevenção de Anemia.', guide: '<h3>💉 Ferro Dextrano</h3><p>O leite da porca é pobre em ferro e o leitão cresce muito rápido.</p><ul><li><strong>Sintoma de falta:</strong> Leitão pálido ("papel"), pelo áspero, crescimento lento (refugo).</li><li><strong>Dose:</strong> 1ml ou 2ml (confira bula) intramuscular profundo no pescoço (atrás da orelha).</li></ul>' },
        { day: 0, type: 'routine', freq: 'daily', title: 'Limpeza das Baias', desc: 'Higiene.', guide: '<h3>🧹 Lavagem Estratégica</h3><p>Suíno defeca em local úmido e dorme em local seco.</p><ul><li>Aproveite esse instinto: mantenha a área de dormir sempre seca.</li><li>Remova fezes diariamente para evitar gases tóxicos e moscas.</li></ul>' }
    ],

    // 6. Pomar (Citros/Frutas em Geral)
    pomar: [
        { day: -60, title: 'Análise e Calagem', desc: 'Preparo Antecipado.', guide: '<h3>🧪 A Base de Tudo</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>📉 Correção de Acidez (Recomendada):</strong><br>Aplicar <b>{{CALC_GM2}}g/m²</b> (ou {{CALC_TON}} ton/ha) de Calcário.</div><p>O calcário demora 60 a 90 dias para reagir e tirar a acidez. Se deixar para aplicar no plantio, a planta não aproveita direito no começo.</p><ul><li>Espalhe o calcário em área total e incorpore (misture com a terra) se possível.</li></ul>' },
        { day: -30, title: 'Abertura de Covas', desc: 'Curas do Solo.', guide: '<h3>🕳️ Prepare a Casa da Árvore</h3><p>Frutífera vive anos no mesmo lugar. Capriche na cova.</p><ul><li><strong>Tamanho:</strong> 60x60x60cm.</li><li><strong>Adubação Antecipada:</strong> Misture o esterco, fosfato e calcário com a terra e encha a cova. Deixe "curtir" por 30 dias. Se plantar logo após adubar, o adubo quente pode queimar a raiz da muda nova.</li></ul>' },
        { day: 0, title: 'Plantio das Mudas', desc: 'Implantação.', guide: '<h3>🍊 Hora de Plantar</h3><div style="background:#fff3cd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação de Plantio:</strong><br>Use NPK <b>{{NPK_FORMULA}}</b>: <b>{{NPK_GM2}}g</b> por cova (misturado na terra).</div><p>Se já fez a cova há 30 dias, só abra um buraco pequeno para o torrão.</p><ul><li><strong>Enxerto:</strong> 5cm acima do solo (Sagrado!).</li><li><strong>Água:</strong> 20 litros por cova logo após o plantio para tirar bolsas de ar das raízes.</li></ul>' },
        { day: 15, type: 'routine', freq: 'monthly', title: 'Adubação e Coroamento', desc: 'Nutrição.', guide: '<h3>🌳 Coroamento e Nutrição</h3><p>Mantenha um círculo de 1m em volta do tronco "na terra nua".</p><ul><li>Isso evita que a roçadeira machuque o tronco (porta de entrada para fungos).</li><li>Adube na projeção da copa (onde acaba a sombra), não no tronco. É lá que estão as raízes finas que comem.</li></ul>' },
        { day: 7, type: 'routine', freq: 'weekly', title: 'Monitorar Formiga Cortadeira', desc: 'Sauvas.', guide: '<h3>🐜 O Inimigo nº 1</h3><p>Uma saúva adulta consome mais que um boi (proporcionalmente).</p><ul><li>Siga as trilhas até o olheiro.</li><li>Aplique isca granulada <strong>ao lado</strong> do caminho, nunca dentro do buraco (elas precisam carregar pra dentro).</li><li>Não aplique em dias de chuva ou chão molhado.</li></ul>' }
    ],

    // 7. Milho
    milho: [
        { day: -60, title: 'Calagem (Correção)', desc: 'Correção de Acidez.', guide: '<h3>📉 Suba o pH do Solo!</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Aplicação de Calcário:</strong><br>Dose: <b>{{CALC_GM2}}g/m²</b> (ou {{CALC_TON}} ton/ha).</div><p>Milho em terra ácida tem "raízes tóxicas" de alumínio e não bebe água.</p><ul><li>Aplique a lanço e gradeie para misturar até 20cm de profundidade.</li><li>Se for Plantio Direto, aplique na superfície (demora mais para descer).</li></ul>' },
        { day: -20, title: 'Dessecação (Mato)', desc: 'Limpeza da Área.', guide: '<h3>🍂 O "Vazio" antes do Plantio</h3><p>Não plante no meio do mato verde!</p><ul><li>As ervas daninhas competem por água e alelopatia (veneno químico) contra o milho bebê.</li><li>Aplique herbicida ou roce baixo 15-20 dias antes. O milho deve nascer em "terra limpa" ou palhada morta.</li></ul>' },
        { day: 0, title: 'Plantio do Milho', desc: 'Técnica de Semeadura.', guide: '<h3>🌽 Dia de Plantar</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação na Linha:</strong><br>Use NPK <b>{{NPK_FORMULA}}</b>.<br>Dose: <b>{{NPK_GM2}}g</b> por metro linear.</div><p>A calagem já deve ter sido feita. Agora é garantir o fósforo.</p><ul><li><strong>Velocidade:</strong> 4-5km/h. Calma!</li><li><strong>Profundidade:</strong> 3 a 5cm.</li><li><strong>Adubo:</strong> Ao lado e abaixo da semente para não "salgar" (queimar) a semente.</li></ul>' },
        { day: 15, type: 'routine', freq: 'weekly', title: 'Monitorar Lagarta', desc: 'Praga Chave.', guide: '<h3>🐛 Lagarta-do-Cartucho (Spodoptera)</h3><p>Praga mais destrutiva.</p><ul><li><strong>Dano:</strong> Come as folhas novas ainda enroladas no cartucho. Quando a folha abre, está toda furada. Também mata o ponto de crescimento.</li><li><strong>Monitoramento:</strong> Entre na roça e faça um "W". Olhe 20 plantas por ponto. Se achar 2 com lagarta ou cocô fresco, TEM que aplicar.</li><li><strong>Controle:</strong> Inseticidas fisiológicos (inibidores de quitina) ou Biológicos (Baculovírus/BT) funcionam melhor com lagartas pequenas (<1cm).</li></ul>' },
        { day: 30, title: 'Adubo de Cobertura', desc: 'A Força do Nitrogênio.', guide: '<h3>✨ Ureia: O Motor do Milho</h3><p>Milho precisa de muito Nitrogênio para encher espiga.</p><ul><li><strong>Fase V4-V6:</strong> (4 a 6 folhas verdadeiras). É quando a planta define o tamanho da espiga.</li><li><strong>Aplicação:</strong> Jogue a ureia no cordão, a uns 10cm do pé.</li><li><strong>Perda:</strong> A ureia vira gás (amônia) se ficar no sol. Aplique antes da chuva ou enterre/cubra com terra.</li></ul>' }
    ],

    // 8. Feijão
    feijao: [
        { day: -60, title: 'Calagem', desc: 'Correção de Solo.', guide: '<h3>📉 Feijão Gosta de pH Alto</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Recomendação de Calcário:</strong><br>Aplicar <b>{{CALC_GM2}}g/m²</b>.</div><p>Feijão é planta de ciclo curto. Se a terra estiver ácida, ele não tem tempo de recuperar.</p><ul><li>Aplique 60 dias antes. O cálcio ajuda a fortalecer a parede da planta contra doenças.</li></ul>' },
        { day: -15, title: 'Dessecação', desc: 'Eliminar Concorrência.', guide: '<h3>🧹 Área Limpa</h3><p>Feijão "nasce fraco". Se tiver mato competindo nos primeiros 20 dias, você perde a lavoura.</p><ul><li>Faça a limpeza total da área 2 semanas antes.</li><li>Evite herbicidas residuais fortes que possam matar o feijão quando nascer.</li></ul>' },
        { day: 0, title: 'Plantio Feijão', desc: 'Sensibilidade.', guide: '<h3>🫘 Plantio Suave</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação NPK:</strong><br>Use <b>{{NPK_FORMULA}}</b>: <b>{{NPK_GM2}}g</b> por metro.</div><p>Solo destorroado é lei.</p><ul><li><strong>Profundidade:</strong> Rasa (3cm). Se enterrar muito, ele não tem força para sair.</li><li><strong>Inoculante:</strong> Misture Rhizobium na sombra (o sol mata a bactéria) e plante logo em seguida.</li></ul>' },
        { day: 10, type: 'routine', freq: 'weekly', title: 'Monitorar Pragas', desc: 'Vetores de Vírus.', guide: '<h3>🐞 Mosca Branca e Vaquinha</h3><ul><li><strong>Mosca Branca:</strong> Transmite o Mosaico Dourado (vírus que atrofia e amarela o feijoeiro). Se ver nuvens de mosquinhas brancas ao balançar a folha, controle imediatamente.</li><li><strong>Vaquinha:</strong> Come a folha, mas o pior é a larva dela que come a raiz.</li></ul>' },
        { day: 25, title: 'Cobertura Nitrogenada', desc: 'Boost.', guide: '<h3>✨ Nitrogênio no Feijão</h3><p>Apesar de ser leguminosa, o feijão moderno precisa de um empurrão.</p><ul><li>Aplique uma dose leve de ureia (30-50kg/ha) aos 20-25 dias (terceira folha trifoliada).</li><li>Cuidado para não jogar dentro da folha ("copinho"), pois a ureia queima a planta.</li></ul>' }
    ],

    // 9. Mandioca
    mandioca: [
        { day: -60, title: 'Calagem', desc: 'Preparação.', guide: '<h3>📉 Mandioca Agradece Calagem</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Dose Recomendada:</strong><br>Aplicar <b>{{CALC_GM2}}g/m²</b>.</div><p>Muitos acham que mandioca dá em qualquer chão, mas ela dobra a produção em solo corrigido.</p>' },
        { day: -30, title: 'Aração/Gradagem', desc: 'Solo Fofo.', guide: '<h3>🚜 Solo Solto = Raiz Grossa</h3><p>Para a mandioca engrossar, a terra não pode estar compactada.</p><ul><li><strong>Aração:</strong> Profunda (20-30cm).</li><li><strong>Curvas de Nível:</strong> Mandioca sofre muito com erosão. Plante cortando as águas.</li></ul>' },
        { day: 0, title: 'Plantio (Manivas)', desc: 'Seleção da Muda.', guide: '<h3>🥔 Plantio da Mandioca</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Fósforo no Sulco:</strong><br>Se recomendado, use Super Simples no fundo do sulco.</div><ul><li><strong>Origem:</strong> Use o terço médio da planta mãe.</li><li><strong>Posição:</strong> Horizontal (a 5-10cm) facilita colheita.</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Capina (Crítico)', desc: 'Período Crítico.', guide: '<h3>🌿 Período Crítico de Competição (PCII)</h3><p>Dos 0 aos 100 dias, a mandioca <strong>não tolera sombra</strong>.</p><ul><li>Se o mato crescer mais que a mandioca nesse tempo, a produção cai 50% ou mais.</li><li>Mantenha a roça "no limpo" até a mandioca fechar a rua e fazer sombra no mato.</li></ul>' },
        { day: 60, title: 'Adubação de Cobertura', desc: 'Engrossar Raízes.', guide: '<h3>🥔 Potássio é Vida</h3><p>A mandioca extrai muito potássio do solo.</p><ul><li><strong>Quando:</strong> Aos 45-60 dias (após a primeira capina).</li><li><strong>O que usar:</strong> NPK 20-00-20 ou Cloreto de Potássio + Ureia.</li><li><strong>Aplicação:</strong> Em filete contínuo ou covetas laterais, longe do caule para não queimar.</li></ul>' },
        { day: 365, title: 'Ponto de Colheita', desc: 'Amido.', guide: '<h3>🥘 Ponto de Colheita</h3><p>Não tem data certa, depende do mercado e da chuva.</p><ul><li><strong>Teor de Amido:</strong> Se choveu muito e a planta brotou folha nova, ela "gastou" o amido da raiz. A mandioca fica "aguada" e não cozinha.</li><li><strong>Melhor hora:</strong> Na "dormência" da planta (época seca/inverno), quando ela está com pouca folha. A raiz está cheia de energia acumulada.</li></ul>' }
    ],

    // --- NOVAS CULTURAS (EXPANSÃO) ---

    // 10. Alface (Folhosas)
    alface: [
        { day: -10, title: 'Preparo do Canteiro', desc: 'Base.', guide: '<h3>🥬 Canteiro de Ouro</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Adubação Rica em N:</strong><br>Misture muito esterco curtido (3 a 5kg/m²). Use <b>{{NPK_FORMULA}}</b> (<b>{{NPK_GM2}}g/m²</b>) espalhado.</div><p>Folha precisa de nitrogênio e matéria orgânica.</p><ul><li><strong>Canteiro:</strong> 20cm de altura para não empossar água (alface apodrece fácil).</li></ul>' },
        { day: 0, title: 'Transplantio', desc: 'Mudas.', guide: '<h3>🌱 Mudança de Casa</h3><p>Nunca plante a semente direto (é muito frágil).</p><ul><li><strong>Ponto ideal:</strong> Muda com 4 folhas definitivas.</li><li><strong>Espaçamento:</strong> 25x25cm ou 30x30cm. Se fechar muito, dá fungo (Míldio).</li><li><strong>Horário:</strong> Fins de tarde para o sol não murchar a muda na largada.</li></ul>' },
        { day: 20, title: 'Cobertura', desc: 'Nitrogênio.', guide: '<h3>✨ Explosão Verde</h3><p>A alface cresce muito rápido.</p><ul><li>Aplique adubo nitrogenado (Ureia ou Sulfato de Amônio) entre as plantas.</li><li>Cuidado para não "algodão doce" (queimar as folhas com o adubo).</li></ul>' },
        { day: 45, title: 'Colheita', desc: 'Antes do Pendão.', guide: '<h3>🥗 Ponto de Colheita</h3><p>Colha antes do centro começar a subir (pendoar), senão fica amarga.</p>' }
    ],

    // 11. Tomate (Frutos)
    tomate: [
        { day: -15, title: 'Calagem e Canteiro', desc: 'Preparo.', guide: '<h3>🍅 Tomate Exige Cálcio</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Fundo Preto (Podridão Apical):</strong><br>A falta de Cálcio (Calagem: {{CALC_GM2}}g/m²) faz o fundo do tomate ficar preto.<br>Aplique o calcário com antecedência!</div>' },
        { day: 0, title: 'Plantio', desc: 'Mudas.', guide: '<h3>🌱 Transplantio</h3><ul><li>Use mudas sadias. Enterre até a primeira folha para enraizar melhor.</li><li><strong>Adubo NPK:</strong> Rico em Potássio (K) e Fósforo (P). Use <b>{{NPK_GM2}}g</b> por cova.</li></ul>' },
        { day: 15, title: 'Estaqueamento (Tutor)', desc: 'Suporte.', guide: '<h3>🪵 Amarrio</h3><p>O tomateiro indeterminado cresce como trepadeira. Precisa de estaca ou fitilho.</p><ul><li>Amarre com folga ("em oito") para não enforcar o caule quando engrossar.</li></ul>' },
        { day: 25, title: 'Adubação de Cobertura 1', desc: 'Crescimento.', guide: '<h3>✨ Força no Talo</h3><p>Primeira cobertura rico em Nitrogênio e Potássio.</p><ul><li>Use NPK 20-00-20 (ou Sulfato de Amônio + Cloreto).</li><li>5 a 10g por planta. Longe do caule!</li></ul>' },
        { day: 50, title: 'Adubação de Cobertura 2', desc: 'Florada.', guide: '<h3>🌼 Doação de Frutos</h3><p>Na florada/início da frutificação, a planta demanda muito Potássio.</p><ul><li>Aumente a dose de Potássio (K). NPK 12-06-12 ou similar.</li></ul>' },
        { day: 20, type: 'routine', freq: 'weekly', title: 'Desbrota', desc: 'Tira-Chupão.', guide: '<h3>✂️ Cirurgia Semanal</h3><p>Remova os brotos laterais que nascem na axila das folhas ("chupões").</p><ul><li>Deixe apenas a haste principal subir.</li><li>Isso concentra força nos frutos e melhora a ventilação.</li></ul>' }
    ],

    // 12. Cenoura (Raízes)
    cenoura: [
        { day: -5, title: 'Canteiro Profundo', desc: 'Solo Fofo.', guide: '<h3>🥕 O Segredo da Cenoura Reta</h3><p>Se a raiz achar terra dura ou pedra, ela entorta ou bifurca ("cenoura de pernas abertas").</p><ul><li>Revire a terra a 30cm de profundidade. Deixe muito fofo.</li><li><strong>Adubo P:</strong> O Fósforo é essencial. Use NPK <b>{{NPK_GM2}}g/m²</b>.</li></ul>' },
        { day: 0, title: 'Semeadura Direta', desc: 'Plantio.', guide: '<h3>🌱 Semeando</h3><p>Não se faz muda de cenoura (a raiz torta no transplante).</p><ul><li>Riscos de 1 a 2cm de profundidade.</li><li>Misture a semente com areia ou fubá para espalhar melhor (semente muito miúda).</li></ul>' },
        { day: 25, title: 'Desbaste (Raleio)', desc: 'Espaço.', guide: '<h3>✂️ A Escolha de Sofia</h3><p>Você vai ter que arrancar as plantinhas extras.</p><ul><li>Deixe uma cenoura a cada 5-8cm. Se ficarem grudadas, não engrossam.</li><li>Faça isso com o solo úmido para não abalar as vizinhas.</li></ul>' }
    ],

    // 13. Café (Perene)
    cafe: [
        { day: -60, title: 'Análise e Correção', desc: 'Investimento.', guide: '<h3>☕ Café é Cultura de Precisão</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Calcário:</strong><br>Dose: <b>{{CALC_GM2}}g/m²</b>. Café não tolera alumínio tóxico.</div><p>Faça a correção em área total e no fundo do sulco.</p>' },
        { day: 0, title: 'Plantio', desc: 'Mudas.', guide: '<h3>🌱 Plantio do Café</h3><div style="background:#e3f2fd; padding:10px; border-radius:8px; margin:10px 0;"><strong>🧪 Fosfatagem:</strong><br>Use fonte rica em P (Super Simples ou NPK de plantio) misturado n terra da cova. <b>{{NPK_GM2}}g</b>.</div><ul><li><strong>Colo:</strong> Não enterre o colo da muda (região entre raiz e caule). Afogamento do colo mata a muda.</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Adubação Nitrogenada', desc: 'Crescimento.', guide: '<h3>✨ Nitrogênio Parcelado</h3><p>No primeiro ano, aplique N a cada 30-45 dias (nas chuvas) para formar a saia do cafeeiro.</p>' }
    ],

    // 14. Banana
    banana: [
        { day: -60, title: 'Preparo da Área', desc: 'Limpeza e Calagem.', guide: '<h3>🍌 Bananeira Gosta de Terra Boa</h3><p>Banana é exigente em nutrientes e não tolera acidez alta.</p><ul><li><strong>Calagem:</strong> Aplicar calcário 60 dias antes para pH 6.0-6.5.</li><li><strong>Drenagem:</strong> Banana não tolera encharcamento. Evite baixadas que acumulam água.</li></ul>' },
        { day: -30, title: 'Abertura de Covas', desc: 'Preparo.', guide: '<h3>🕳️ Covas Generosas</h3><p>Bananeira tem raízes superficiais mas precisa de espaço.</p><ul><li><strong>Tamanho:</strong> 40x40x40cm.</li><li><strong>Espaçamento:</strong> 3x3m (variedades altas) ou 2x2m (anãs).</li><li><strong>Adubação de Base:</strong> Misture 20L de esterco curtido + 200g de superfosfato na cova.</li></ul>' },
        { day: 0, title: 'Plantio da Muda', desc: 'Implantação.', guide: '<h3>🌱 Plantio</h3><p>Use mudas tipo "chifrinho" (20-30cm) de bananeiras sadias.</p><ul><li>Plante no centro da cova, sem enterrar o rizoma muito fundo.</li><li>Regue bem após o plantio (20L de água).</li></ul>' },
        { day: 30, title: 'Adubação de Cobertura 1', desc: 'Nitrogênio.', guide: '<h3>✨ Primeira Cobertura</h3><p>Banana precisa de muito Nitrogênio para crescer rápido.</p><ul><li>Aplique 100g de Ureia em círculo ao redor da planta (30cm do pseudocaule).</li><li>Cubra levemente com terra.</li></ul>' },
        { day: 60, title: 'Adubação de Cobertura 2', desc: 'NPK.', guide: '<h3>🌿 Segunda Cobertura</h3><p>Agora a planta precisa de equilíbrio.</p><ul><li>Use NPK 20-05-20: 150g por planta.</li><li>Banana extrai muito Potássio do solo.</li></ul>' },
        { day: 90, title: 'Desbaste de Perfilhos', desc: 'Família Controlada.', guide: '<h3>✂️ Controle da Touceira</h3><p>Bananeira gera muitos "filhos". Deixe apenas 3 por touceira.</p><ul><li><strong>Mãe:</strong> A planta que está produzindo.</li><li><strong>Filha:</strong> A que vai produzir depois.</li><li><strong>Neta:</strong> A reserva.</li><li>Elimine os outros com facão (corte rente ao chão).</li></ul>' },
        { day: 120, type: 'routine', freq: 'monthly', title: 'Adubação Mensal', desc: 'Manutenção.', guide: '<h3>🔄 Adubação Contínua</h3><p>A partir do 4º mês, adube mensalmente.</p><ul><li>NPK 20-05-20: 200g/planta/mês.</li><li>Aumente para 300g quando aparecer o cacho.</li></ul>' },
        { day: 270, title: 'Florescimento', desc: 'Cacho Aparecendo.', guide: '<h3>🌺 Nasceu o Cacho!</h3><p>Entre 9-12 meses, a bananeira emite a inflorescência.</p><ul><li><strong>Coração:</strong> A flor roxa no final do cacho pode ser cortada após as pencas se formarem (economiza energia).</li><li><strong>Ensacamento:</strong> Proteja o cacho com saco plástico azul para evitar pragas e melhorar a cor.</li></ul>' },
        { day: 360, title: 'Colheita', desc: 'Ponto de Corte.', guide: '<h3>🍌 Hora de Colher</h3><p>Banana leva 12-15 meses do plantio até a primeira colheita.</p><ul><li><strong>Ponto:</strong> Quando os frutos estão "cheios" (quinas arredondadas), ainda verdes.</li><li>Corte o cacho inteiro com facão.</li><li>Deixe amadurecer em local sombreado e ventilado.</li></ul>' }
    ],

    // 15. Coqueiro
    coqueiro: [
        { day: -90, title: 'Análise de Solo', desc: 'Preparo Antecipado.', guide: '<h3>🥥 Coqueiro é Investimento de Longo Prazo</h3><p>Coqueiro vive 60+ anos. Prepare bem o solo.</p><ul><li><strong>pH Ideal:</strong> 5.5-6.5.</li><li><strong>Calagem:</strong> Aplicar 90 dias antes se pH < 5.5.</li><li><strong>Drenagem:</strong> Essencial. Coqueiro não tolera raiz encharcada.</li></ul>' },
        { day: -60, title: 'Abertura de Covas', desc: 'Covas Profundas.', guide: '<h3>🕳️ Cova de Coqueiro</h3><p>Coqueiro tem raízes profundas nos primeiros anos.</p><ul><li><strong>Tamanho:</strong> 80x80x80cm (cova grande!).</li><li><strong>Espaçamento:</strong> 7x7m (Anão) ou 9x9m (Gigante).</li><li><strong>Adubação de Base:</strong> 40L de esterco + 500g de superfosfato + 200g de FTE (micronutrientes).</li></ul>' },
        { day: 0, title: 'Plantio da Muda', desc: 'Implantação.', guide: '<h3>🌴 Plantio</h3><p>Use mudas com 6-8 meses, já com 4-6 folhas.</p><ul><li>Plante no nível do solo (não enterre o colo).</li><li><strong>Tutoramento:</strong> Amarre a muda a uma estaca para evitar tombar com vento.</li><li>Regue abundantemente (40L).</li></ul>' },
        { day: 30, title: 'Adubação de Formação 1', desc: 'Nitrogênio.', guide: '<h3>✨ Primeira Cobertura</h3><p>Nos primeiros 2 anos, o foco é crescimento vegetativo.</p><ul><li>Aplique 200g de Ureia em círculo (50cm do caule).</li><li>Não deixe o adubo encostar no tronco.</li></ul>' },
        { day: 60, type: 'routine', freq: 'monthly', title: 'Adubação Mensal (Ano 1-2)', desc: 'Crescimento.', guide: '<h3>🔄 Adubação de Formação</h3><p>Nos primeiros 2 anos, adube mensalmente.</p><ul><li><strong>Fórmula:</strong> NPK 20-05-20 ou similar.</li><li><strong>Dose:</strong> 200g/mês no 1º ano, 400g/mês no 2º ano.</li><li><strong>Micronutrientes:</strong> Aplique FTE BR-12 (50g) a cada 6 meses.</li></ul>' },
        { day: 180, title: 'Controle de Pragas', desc: 'Anel Vermelho.', guide: '<h3>🪲 Broca-do-Olho (Rhynchophorus)</h3><p>A principal praga do coqueiro.</p><ul><li><strong>Prevenção:</strong> Evite ferir o palmito. Não deixe restos de poda acumulados.</li><li><strong>Armadilha:</strong> Use pedaços de cana ou estipe de coqueiro velho como isca com inseticida.</li></ul>' },
        { day: 730, title: 'Início da Produção', desc: 'Primeiros Cocos.', guide: '<h3>🥥 Primeira Floração</h3><p>Coqueiro Anão começa a produzir com 2-3 anos. Gigante com 5-7 anos.</p><ul><li><strong>Adubação de Produção:</strong> Aumente a dose de Potássio (K). Use NPK 16-04-24.</li><li><strong>Dose:</strong> 1-2 kg/planta/ano, dividido em 4 aplicações.</li></ul>' },
        { day: 1095, title: 'Produção Plena', desc: 'Maturidade.', guide: '<h3>🌴 Coqueiro Adulto</h3><p>Com 3+ anos, o coqueiro atinge produção estável.</p><ul><li><strong>Produção:</strong> Anão: 100-150 cocos/ano. Gigante: 60-80 cocos/ano.</li><li><strong>Colheita:</strong> Coco verde aos 6-7 meses. Coco seco aos 11-12 meses.</li><li><strong>Adubação:</strong> Mantenha NPK 16-04-24 (2kg/planta/ano) + Esterco (40L/ano).</li></ul>' }
    ],

    // --- DETALHAMENTO ESPECÍFICO (SEM CLONES GENÉRICOS) ---


    // 20. Couve (Brásicas)
    couve: [
        { day: -10, title: 'Preparo com Calcário', desc: 'Indispensável.', guide: '<h3>🥬 Couve Ama Cálcio</h3><p>Sem calcário, a borda da folha queima e dá pulgão fácil.</p><ul><li>Use <b>{{CALC_GM2}}g/m²</b>.</li><li>Incorpore bem matéria orgânica.</li></ul>' },
        { day: 0, title: 'Plantio das Mudas', desc: 'Espaçamento.', guide: '<h3>🌱 Espaço para Crescer</h3><p>Couve cresce muito.</p><ul><li><strong>Espaçamento:</strong> 50cm a 80cm entre plantas.</li><li>Enterre até as primeiras folhas para firmar o talo.</li></ul>' },
        { day: 15, title: 'Controle de Pulgão', desc: 'Praga nº 1.', guide: '<h3>🐞 O Terror da Couve</h3><p>Pulgão cinzento ama couve.</p><ul><li><strong>Receita:</strong> Calda de sabão de coco + fumo ou óleo de neem.</li><li>Aplique no final da tarde, focando debaixo da folha.</li></ul>' },
        { day: 30, type: 'routine', freq: 'weekly', title: 'Colheita e Limpeza', desc: 'De Baixo pra Cima.', guide: '<h3>✂️ Colheita Certa</h3><p>Colha as folhas de baixo para cima.</p><ul><li>Elimine folhas amarelas (dreno de energia).</li><li>Mantenha o caule limpo.</li></ul>' }
    ],

    // 21. Rúcula
    rucula: [
        { day: 0, title: 'Semeadura Direta', desc: 'Não transplantar.', guide: '<h3>🌱 Direto na Terra</h3><p>Rúcula não gosta de transplante (espiga rápido).</p><ul><li>Faça sulcos rasos (1cm).</li><li>Semeie "pitadas" a cada 10cm.</li><li>Cobre rapidíssimo (30-40 dias).</li></ul>' },
        { day: 20, title: 'Adubação Nitrogenada', desc: 'Vigor.', guide: '<h3>✨ Folhas Tenras</h3><p>Use adubo rico em N (Esterco líquido ou Ureia diluída) para a folha crescer rápido e não ficar picante demais/dura.</p>' }
    ],

    // 22. Cheiro-Verde (Cebolinha/Salsa)
    cheiro_verde: [
        { day: 0, title: 'Plantio Misto', desc: 'Consórcio.', guide: '<h3>🌿 O Duelo</h3><ul><li><strong>Salsa:</strong> Demora a nascer (até 20 dias). Deixe de molho na água por 1 dia antes.</li><li><strong>Cebolinha:</strong> Nasce rápido. Pode plantar por mudas (touceiras) ou semente.</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Corte e Rebrote', desc: 'Colheita.', guide: '<h3>✂️ Colheita Contínua</h3><ul><li><strong>Cebolinha:</strong> Corte a 2 dedos do chão. Ela rebrota.</li><li><strong>Salsa:</strong> Tire as folhas de fora. Não corte o "olho" central.</li></ul>' }
    ],

    // 23. Manjericão/Ervas
    manjericao: [
        { day: 0, title: 'Plantio', desc: 'Sol Pleno.', guide: '<h3>🌿 O Rei da Horta</h3><p>Gosta de sol e água, mas odeia frio.</p><ul><li>Adube com muito composto orgânico.</li></ul>' },
        { day: 45, type: 'routine', freq: 'weekly', title: 'Poda de Flores', desc: 'Segredo do Sabor.', guide: '<h3>✂️ Não Deixe Florir!</h3><p>Se o manjericão soltar o pendão floral, as folhas ficam amargas e pequenas.</p><ul><li>Corte as pontas (flores) toda semana. Isso força ele a soltar mais folhas laterais e virar uma moita linda.</li></ul>' }
    ],
    alecrim: [
        { day: 0, title: 'Plantio em Local Seco', desc: 'Rústico.', guide: '<h3>🌿 Alecrim Odeia Pé Molhado</h3><p>Origem mediterrânea.</p><ul><li>Misture areia na terra se for argilosa.</li><li>Quase não precisa de adubo químico. Excesso de Nitrogênio mata o alecrim.</li></ul>' }
    ],
    hortela: [
        { day: 0, title: 'Plantio Controlado', desc: 'Invasora.', guide: '<h3>🌿 A Invasora</h3><p>A raiz da hortelã anda por baixo da terra e invade tudo.</p><ul><li><strong>Dica:</strong> Plante dentro de um balde sem fundo enterrado no canteiro, ou em vasos/bacias separadas.</li><li>Gosta de terra úmida sempre.</li></ul>' }
    ],

    // 24. Pimentão
    pimentao: [
        { day: 0, title: 'Transplante', desc: 'Sensível.', guide: '<h3>🫑 Primo Rico do Tomate</h3><p>Exige solo muito fértil (Adubação: {{NPK_GM2}}g/cova).</p><ul><li>Cuidado com o colo da planta (não enterrar demais).</li></ul>' },
        { day: 30, title: 'Tutoramento', desc: 'Peso.', guide: '<h3>🪵 Precisa de Apoio</h3><p>O galho quebra fácil com o peso / vento.</p><ul><li>Passe fitilho ou use estacas (meia-estaca).</li><li><strong>Queima de Sol:</strong> As folhas protegem os frutos. Se podar demais, o sol queima o pimentão (mancha branca).</li></ul>' }
    ],

    // 25. Pepino
    pepino: [
        { day: 0, title: 'Semeadura', desc: 'Cova.', guide: '<h3>🥒 Crescimento Explosivo</h3><p>Ciclo muito rápido (45-50 dias colhendo).</p><ul><li>Adubação pesada na cova.</li></ul>' },
        { day: 20, title: 'Condução Vertical', desc: 'Rede/Tutor.', guide: '<h3>🕸️ Subindo a Rede</h3><p>Pepino no chão dá doença e fica torto (enrola).</p><ul><li>Use rede de tutoramento ou fitilho vertical.</li><li>Tire os brotos (desbrota) até o 4º nó (perto do chão) para ventilar.</li></ul>' },
        { day: 15, type: 'routine', freq: 'weekly', title: 'Vigilância Oídio', desc: 'Pó Branco.', guide: '<h3>⚪ Oídio (Míldio)</h3><p>Aquele pó branco nas folhas.</p><ul><li>Pepino pega muito fácil.</li><li>Use leite cru (10%) ou calda bordalesa preventiva.</li></ul>' }
    ],

    // 26. Quiabo
    quiabo: [
        { day: 0, title: 'Plantio Solar', desc: 'Calor.', guide: '<h3>☀️ Quiabo Ama Calor</h3><p>Não adianta plantar no frio.</p><ul><li>Sementes duras: Deixe na água morna por 1 noite para germinar rápido.</li></ul>' },
        { day: 45, type: 'routine', freq: 'daily', title: 'Colheita Diária', desc: 'Ponto de Colheita.', guide: '<h3>🔪 Não Deixe Passar</h3><p>Quiabo cresce milímetros por hora.</p><ul><li><strong>Ponto:</strong> Quebre a pontinha. Se estalar, tá bom. Se dobrar, tá fibroso (duro).</li><li>Colha todo dia ou dia sim/dia não. Se ficar velho no pé, a planta para de produzir novos.</li></ul>' }
    ],

    // 27. Abóbora/Melancia
    abobora: [
        { day: 0, title: 'Covas Distantes', desc: 'Espaço.', guide: '<h3>🎃 A Gigante</h3><p>Abóbora precisa de espaço (ramas de 5m+).</p><ul><li><strong>Espaçamento:</strong> 3x3m ou 4x4m entre covas.</li><li><strong>Adubo:</strong> Coloque todo o adubo na cova (é lá que a boca está). O resto a raiz busca.</li></ul>' },
        { day: 40, title: 'Penteado das Ramas', desc: 'Organização.', guide: '<h3>🌿 Direcionando</h3><p>Jogue as ramas para dentro da roça, não deixe invadir a estrada.</p><ul><li><strong>Polinização:</strong> Flores amarelas grandes precisam de abelhas. Não aplique inseticida de manhã (hora da abelha).</li></ul>' }
    ],
    melancia: [
        { day: 0, title: 'Plantio', desc: 'Sensibilidade.', guide: '<h3>🍉 Melancia é Melindrosa</h3><p>Muito sensível a fungos nas folhas.</p><ul><li>Não molhe as folhas! Use gotejamento se possível.</li><li><strong>Fundo Preto:</strong> Falta de Cálcio também afeta melancia. Use a calagem certa ({{CALC_GM2}}g/m²).</li></ul>' },
        { day: 45, title: 'Raleio de Frutos', desc: 'Qualidade.', guide: '<h3>✂️ Menos é Mais</h3><p>Se deixar todas, ficam pequenas e sem doce.</p><ul><li>Deixe apenas 2 ou 3 frutas por planta.</li><li>O sol deve bater nas folhas, não na fruta (queima). A fruta fica protegida debaixo da rama.</li></ul>' }
    ],

    // 28. Morango
    morango: [
        { day: -15, title: 'Canteiro Alto + Mulching', desc: 'Plástico.', guide: '<h3>🍓 Cama de Lorde</h3><p>Morango não pode tocar na terra (apodrece).</p><ul><li>Faça canteiros altos (30cm).</li><li>Cubra com plástico preto (Mulching) ou muita palha.</li><li>Fure o plástico e plante a muda.</li></ul>' },
        { day: 0, title: 'Plantio', desc: 'Coroa.', guide: '<h3>🌱 Coroa de Fora</h3><p>Não enterre o miolo (coroa) da muda, senão ela morre. Deixe o miolo aparecendo.</p>' },
        { day: 30, type: 'routine', freq: 'weekly', title: 'Limpeza e Estolão', desc: 'Poda.', guide: '<h3>✂️ Tira-Tudo</h3><ul><li><strong>Estolões:</strong> Aqueles "cipós" que a planta solta para fazer muda nova. CORTE TUDO se quer fruta. O estolão rouba força.</li><li><strong>Folhas velhas:</strong> Tire as folhas secas/doentes de baixo sem dó.</li></ul>' }
    ],

    // 29. Raízes Específicas
    beterraba: [
        { day: 0, title: 'Semeadura', desc: 'Glomérulo.', guide: '<h3>🌱 Uma semente = Várias plantas</h3><p>A "semente" da beterraba é um coquinho com 3 ou 4 sementes dentro.</p><ul><li>Vai nascer muita junta. Prepare-se para o desbaste.</li><li>Gosta de boro (Bórax). Se faltar, fica com o coração preto e duro.</li></ul>' },
        { day: 25, title: 'Desbaste', desc: 'Espaçamento.', guide: '<h3>✂️ Um Corpo, Um Lugar</h3><p>Deixe apenas uma planta a cada 10cm.</p>' }
    ],
    batata_doce: [
        { day: 0, title: 'Plantio de Ramas', desc: 'Leiras.', guide: '<h3>🍠 Plantio Rústico</h3><p>Não se planta batata, se planta o ramo (rama).</p><ul><li>Faça leiras (camalhões) altas de terra fofa.</li><li>Corte pontas de ramas com 30-40cm.</li><li>Enterre o meio da rama, deixando as pontas de fora.</li></ul>' },
        { day: 60, title: 'Amontoa', desc: 'Rachadura.', guide: '<h3>🚜 Cobrir Rachaduras</h3><p>A batata cresce e empurra a terra. Se aparecer rachadura e o sol bater na batata, atrai broca (bichinho).</p><ul><li>Chegue terra nos pés (amontoa) para fechar as frestas.</li></ul>' }
    ],

    // 30. Abacaxi
    abacaxi: [
        { day: 0, title: 'Plantio de Mudas', desc: 'Filhotes.', guide: '<h3>🍍 O Rei demora 18 meses</h3><p>Use mudas do tipo "filhote" (que saem na base do fruto) ou "rebentão".</p><ul><li><strong>Cura:</strong> Deixe as mudas no sol por 1 semana viradas para baixo (para matar fungos da base).</li><li><strong>Plantio:</strong> Espaçamento largo (90x30cm) pois espeta muito na colheita.</li></ul>' },
        { day: 300, title: 'Indução Floral (Opcional)', desc: 'Carbureto.', guide: '<h3>🌺 Forçar Florada</h3><p>Para colher todos iguais.</p><ul><li>Aos 10-12 meses (planta grande), aplica-se carbureto (etileno) no "olho" da planta à noite para ela florescer.</li><li>Sem isso, cada um dá numa época.</li></ul>' }
    ],

    // 31. Vagem
    vagem: [
        { day: 0, title: 'Plantio Tutorado', desc: 'Trepadeira.', guide: '<h3>🫘 Feijão de Metro?</h3><p>A maioria das vagens comerciais são trepadeiras.</p><ul><li>Precisa de cerca cruzada (tipo X) ou tutor vertical.</li><li>Ciclo rápido (60 dias colhendo).</li></ul>' },
        { day: 50, type: 'routine', freq: 'weekly', title: 'Colheita Frequente', desc: 'Não deixe granar.', guide: '<h3>✂️ Colha Cedo</h3><p>Se o grão inchar (granar), a vagem fica fibrosa e ruim de mercado.</p><ul><li>Colha a cada 2 ou 3 dias.</li></ul>' }
    ],

    // 33. Pecuária Menor Específica
    caprinos: [
        { day: 0, title: 'Manejo Alimentar', desc: 'Ramoneio.', guide: '<h3>🐐 Cabra não é Ovelha</h3><p>A cabra gosta de comer "o que está no alto" (folhas de arbustos), não só pasto baixo.</p><ul><li>Permita acesso a arbustos ou forneça ramos (Amora, Leucena).</li><li><strong>Casco:</strong> Sofre muito com umidade. Mantenha local seco.</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Vermifugação (Famacha)', desc: 'Controle.', guide: '<h3>👁️ Olho nela</h3><p>A cabra é muito sensível a verme. Use o método FAMACHA (cor da mucosa do olho) todo mês.</p>' }
    ],
    codornas: [
        { day: 0, title: 'Ambiente Protegido', desc: 'Vento e Frio.', guide: '<h3>🐦 Sensíveis</h3><p>Codorna morre fácil com vento encanado.</p><ul><li>Gaiolas fechadas ou viveiro protegido.</li><li><strong>Proteína:</strong> Precisam de ração forte (22-24% proteína), mais que galinha.</li></ul>' },
        { day: 40, title: 'Início Postura', desc: 'Luz.', guide: '<h3>💡 Luz = Ovo</h3><p>Codorna precisa de 14h-16h de luz por dia para botar bem.</p><ul><li>Complete o dia com lâmpada até as 21h.</li></ul>' }
    ],
    patos: [
        { day: 0, title: 'Piscina?', desc: 'Água.', guide: '<h3>🦆 Aves Aquáticas</h3><p>Não *precisam* de lago para viver, mas precisam molhar a cabeça.</p><ul><li>Bebedouro tem que ser fundo o suficiente para ele enfiar o bico e lavar os olhos.</li><li>São muito rústicos e resistentes a doenças.</li></ul>' }
    ]
};





function deleteProject(id) {
    if (!confirm('⚠️ Tem certeza que deseja apagar este projeto?\n\nIsso apagará TODAS as tarefas vinculadas a ele permanentemente.')) return;

    // 1. Remove Project
    state.projects = state.projects.filter(p => p.id !== id);

    // 2. Remove Linked Tasks
    // Use loose comparison because sometimes IDs can be strings/numbers mismatch during storage
    state.tasks = state.tasks.filter(t => parseInt(t.projectId) !== parseInt(id));

    // 3. Remove Linked Routines
    state.routines = state.routines.filter(r => parseInt(r.projectId) !== parseInt(id));

    // 4. Reset View if needed
    if (state.currentProject === id) {
        state.currentProject = 'all';
    }

    saveData();
    renderProjects();
    renderTasks();
}



function generateProjectTasks(projectId, culture, startDate) {
    const template = cropTemplates[culture];
    if (!template) return;

    template.forEach(item => {
        // Calculate Date
        // Force T12:00:00 to avoid Timezone "Yesterday" bug
        const itemDate = new Date(startDate + 'T12:00:00');
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
    });

    // Trigger routine processing to generate first instances of routines immediately if applicable
    processRoutines();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) { task.completed = !task.completed; saveData(); }
}

function deleteTask(id) {
    setTimeout(() => {
        if (confirm('Excluir tarefa?')) {
            state.tasks = state.tasks.filter(t => t.id !== id);
            saveData();
            renderTasks(); // Ensure re-render
        }
    }, 10);
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



function getBestMoonForCrop(culture) {
    let targetPhase = 'Lua Crescente'; // Default
    const lower = culture.toLowerCase();

    // Mapping Logic based on biological focus
    if (['cenoura', 'beterraba', 'alho', 'cebola', 'rabanete'].some(c => lower.includes(c))) {
        targetPhase = 'Lua Nova'; // Root establishing
    }
    else if (['mandioca', 'batata_doce', 'inhame', 'gengibre', 'batata'].some(c => lower.includes(c))) {
        targetPhase = 'Lua Minguante'; // Root thickening/storage
    }
    else if (['alface', 'couve', 'rucula', 'agriao', 'repolho', 'cheiro_verde', 'manjericao', 'hortela'].some(c => lower.includes(c))) {
        targetPhase = 'Lua Cheia'; // Leaf growth
    }
    else if (['tomate', 'pimentao', 'quiabo', 'abobora', 'feijao', 'milho', 'vagem', 'pepino', 'melancia', 'morango', 'frangos', 'gado'].some(c => lower.includes(c))) {
        targetPhase = 'Lua Crescente'; // Above ground / Growth
    }
    else if (['galinhas_poedeiras', 'suinos', 'cafe', 'pomar', 'banana', 'coqueiro'].some(c => lower.includes(c))) {
        targetPhase = 'Lua Nova'; // Long term / structural
    }
    return targetPhase;
}


function applyReschedule(taskId, newDateStr) {
    const task = state.tasks.find(t => t.id == taskId);
    if (!task) return;

    if (!confirm(`Deseja alterar esta tarefa para ${newDateStr}?\nIsso vai ajustar automaticamente todas as tarefas futuras deste projeto.`)) {
        return;
    }

    const oldDate = new Date(task.date + 'T12:00:00');
    const newDate = new Date(newDateStr + 'T12:00:00');

    // Difference in milliseconds
    const diffTime = newDate - oldDate;
    // Difference in days (approx)
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return;

    // Update this task and all future tasks
    let count = 0;
    state.tasks.forEach(t => {
        if (t.projectId === task.projectId) {
            const tDate = new Date(t.date + 'T12:00:00');

            // Logic: Move the specific task, AND any task that is on or after the OLD date
            // (If we use > oldDate, we might miss tasks on the same day if order matters, but >= catches same day tasks)
            // But we don't want to double move the current task if we check ID.

            let shouldMove = false;

            if (t.id === task.id) {
                shouldMove = true;
            } else if (tDate >= oldDate) {
                shouldMove = true;
            }

            if (shouldMove) {
                // Apply difference
                const nextDate = new Date(tDate);
                nextDate.setDate(nextDate.getDate() + diffDays);
                t.date = getLocalISODate(nextDate);
                count++;
            }
        }
    });

    saveData();
    renderTasks();
    alert(`${count} tarefas foram reagendadas!`);
}

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

    // Weather Listeners
    const btnWeather = document.getElementById('btnWeather');
    const closeWeatherModal = document.getElementById('closeWeatherModal');
    if (btnWeather) btnWeather.addEventListener('click', showWeatherModal);
    if (closeWeatherModal) closeWeatherModal.addEventListener('click', () => {
        document.getElementById('weatherModal').classList.remove('visible');
    });

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

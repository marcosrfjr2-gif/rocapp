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
        coqueiro: '🥥',
        consorcio_milpa: '🌽',
        consorcio_aromatico: '🍅',
        consorcio_canteiro: '🥗'
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
        abelhas: 'Abelhas',
        consorcio_milpa: 'Milpa (Milho/Feijão/Abóbora)',
        consorcio_aromatico: 'Tomate + Manjericão',
        consorcio_canteiro: 'Alface + Cenoura'
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
            title: 'Limpeza e Desinfecção do Galinheiro',
            desc: 'Preparação profunda para saúde das aves.',
            guide: `<h3>🧼 Higiene e Biosseguridade Total</h3><p>A preparação rigorosa do ambiente antes da chegada das aves é o pilar central para o sucesso da sua criação, representando 50% do sucesso sanitário. Comece com uma limpeza seca, retirando toda a matéria orgânica como fezes, penas e poeira acumulada. Em seguida, realize a lavagem de teto, paredes e chão com detergente neutro para remover a gordura/biofilme gorduroso onde as bactérias se escondem. Após secar, faça a <b>caiação das paredes</b> usando uma mistura de 1kg de cal virgem para 4L de água, adicionando cola branca para fixar melhor; o pH alto do cal elimina ácaros e piolhos. Por fim, instale uma cama de <b>maravalha ou casca de arroz</b> com no mínimo 10cm de altura. Uma cama muito fina torna-se úmida rapidamente, causando calos nos pés das aves (pododermatite) e liberando amônia prejudicial ao sistema respiratório.</p>`
        },
        {
            day: 0,
            title: 'Chegada das Pintainhas: Primeiros Cuidados',
            desc: 'Aclimatação crucial para evitar mortalidade.',
            guide: `<h3>🐤 Recepção Técnica de Pintainhas</h3><p>O primeiro dia de vida é o momento mais crítico e frágil. Pintinhos de um dia viajam longas distâncias e chegam desidratados, portanto, foque na hidratação imediata. <b>Não forneça ração nas primeiras 2 a 4 horas</b>; ofereça apenas água fresca (24°C) com soro caseiro (1L de água para 2 colheres rasas de açúcar) para repor energia rapidamente. O aquecimento é vital, pois elas não regulam a própria temperatura corporal. Mantenha o círculo de proteção entre 32°C e 34°C na altura dos animais. Observe o comportamento: se estiverem amontoados sob a lâmpada, estão com frio; se estiverem longe e ofegantes, estão com calor. O conforto térmico garante que elas comecem a comer logo e desenvolvam o sistema imunológico de forma robusta e equilibrada.</p>`
        },
        {
            day: 0,
            type: 'routine',
            freq: 'daily',
            title: 'Manejo Diário: Água e Ração',
            desc: 'Nutrição e limpeza constante.',
            guide: `<h3>🔄 Rotina de Ouro do Criador</h3><p>O manejo diário é o que separa o amador do profissional. Uma galinha consome o dobro de água em relação à ração, e a água suja é a principal via de transmissão para doenças como Coccidiose e Salmonela. Lave os bebedouros com escova e água limpa todas as manhãs, sem exceção; água fresca no calor estimula o consumo de ração e mantém a postura estável. Quanto à ração, ela deve ser balanceada conforme a idade; mexa o alimento nos comedouros pelo menos duas vezes ao dia para despertar a curiosidade das aves. Fique atento à observação tácita: qualquer ave que se mostre encolhida, com penas arrepiadas ou olhos fechados deve ser isolada imediatamente em um "hospital" para evitar o contágio do lote inteiro.</p>`
        },
        {
            day: 120,
            title: 'Início do Programa de Luz',
            desc: 'Estimulação hormonal para postura.',
            guide: `<h3>💡 A Ciência da Luz na Produção de Ovos</h3><p>A galinha é um animal fotoperiódico, o que significa que seu sistema reprodutivo é ativado pela duração do dia. A luz captada pelos olhos estimula a hipófise para liberar os hormônios necessários para a ovulação. Para garantir uma produção alta e constante, você deve fornecer um total de 16 a 17 horas de luz por dia (combinando luz natural do sol e luz artificial). Comece a aumentar 30 minutos de luz artificial por semana a partir da 18ª semana de vida das aves até atingir a meta. **Regra de Ouro:** Nunca diminua a quantidade de horas de luz durante a fase de postura, pois isso sinaliza para a ave que o "inverno" chegou, induzindo-a a entrar em muda (troca de penas) e paralisar totalmente a produção de ovos.</p>`
        },
        {
            day: 140,
            type: 'routine',
            freq: 'daily',
            title: 'Coleta e Manejo de Ovos',
            desc: 'Garantindo qualidade e limpeza.',
            guide: `<h3>🥚 Coleta e Higienização Profissional</h3><p>A coleta eficiente minimiza perdas por quebra e sujeira. Realize a coleta pelo menos 3 vezes ao dia (preferencialmente às 10h, 13h e 16h) para evitar que os ovos sejam bicados ou fiquem excessivamente sujos no ninho. Ovos deixados no calor podem sofrer deterioração da qualidade interna rapidamente. **Atenção:** Nunca lave ovos com água fria; a casca possui uma película protetora chamada "cutícula" que impede a entrada de bactérias. Se o ovo estiver sujo, use uma lixa fina para limpeza a seco ou um pano levemente umedecido com sanitizante específico. Ovos limpos devem ser armazenados com a ponta fina para baixo em local fresco. A higiene do ninho, com troca frequente da maravalha seca, é o segredo para ovos de primeira linha e alta durabilidade.</p>`
        }
    ],

    // 2. Frangos de Corte
    frangos_corte: [
        {
            day: -3,
            title: 'Protocolo de Vazio Sanitário',
            desc: 'Quebra de ciclo de doenças.',
            guide: `<h3>🚫 O Poder do Vazio Sanitário Eficaz</h3><p>O vazio sanitário é a técnica mais barata e eficiente para prevenir doenças em frangos de corte. Consiste no período em que o galpão deve permanecer totalmente limpo e vazio entre a retirada de um lote e a entrada do próximo. O tempo mínimo recomendado é de 10 a 14 dias. Durante este intervalo, remova toda a cama antiga (que deve ser levada para longe para servir de adubo) e realize a lavagem completa com detergente industrial para remover biofilmes. A desinfecção com iodo ou amônia quaternária, seguida pela caiação de todas as superfícies com cal virgem, elimina vírus e bactérias remanescentes. Lembre-se: negligenciar o vazio sanitário causa uma queda progressiva no desempenho dos lotes futuros, aumentando os custos com medicamentos e diminuindo a rentabilidade.</p>`
        },
        {
            day: 0,
            title: 'Alojamento e Start Perfeito',
            desc: 'Foco no peso da primeira semana.',
            guide: `<h3>🐤 Recepção Técnica dos Pintinhos</h3><p>O desempenho final do frango de corte (dia 45) é definido pela sua performance na primeira semana de vida. O pintinho deve quadruplicar de peso nos primeiros 7 dias. Para isso, prepare papel pardo no chão cobrindo 30% da área sob os bebedouros e distribua ração pré-inicial sobre ele para estimular o consumo pelo barulho do biqueio. A temperatura da cama é fundamental: deve estar entre 30°C e 32°C quando os animais chegarem. Ligue os aquecedores 4 horas antes do alojamento. Se a perninha do pinto esfriar devido ao chão gelado, ele ficará letárgico, não comerá o suficiente e o lote ficará desuniforme (refugo). Verifique sempre o "papo": após 24h, 100% dos pintinhos devem estar com o papo cheio e macio.</p>`
        },
        {
            day: 0,
            type: 'routine',
            freq: 'daily',
            title: 'Manejo de Ambiência e Cama',
            desc: 'Ar limpo e piso seco.',
            guide: `<h3>🔄 Manejo de Ambiência e Saúde Respiratória</h3><p>O frango de corte moderno tem um crescimento acelerado que exige oxigenação perfeita. Uma cama úmida e compactada (o famoso "cascão") libera amônia, um gás tóxico que queima os tecidos do pulmão e dos olhos, abrindo porta para doenças respiratórias irreversíveis e ascite (barriga d’água). Revire a cama diariamente com um ancinho, retirando áreas mofadas e repondo maravalha seca nos pontos críticos (perto dos bebedouros). Controle a ventilação através das cortinas: abra-as para renovar o ar, mas evite ventos diretos frios sobre os animais jovens. O ar dentro do galpão deve ser "respirável" para você; se seus olhos arderem, as aves já estão sofrendo danos graves. Um ambiente seco e bem ventilado é o segredo de uma conversão alimentar superior.</p>`
        },
        {
            day: 7,
            type: 'routine',
            freq: 'weekly',
            title: 'Controle de Pesagem e Conversão',
            desc: 'Monitorando o lucro semanal.',
            guide: `<h3>⚖️ Metas de Peso e Eficiência Alimentar</h3><p>Pese regularmente uma amostra de pelo menos 5% do seu lote para garantir que os animais estão seguindo a curva de crescimento das linhagens modernas (como Cobb ou Ross). A primeira pesagem ocorre aos 7 dias, onde a meta é atingir cerca de 200g. Se o peso estiver abaixo do esperado, revise imediatamente a qualidade da ração (proteína bruta), a temperatura ambiente durante a noite e a disponibilidade de bebedouros. Galpões superlotados ou com poucos comedouros geram competição excessiva e desuniformidade no lote. Use os dados de pesagem para calcular a Conversão Alimentar (quantidade de ração consumida dividida pelo peso ganho). Cada grama de ração economizada por meio de uma boa gestão de ambiência representa mais dinheiro no seu bolso ao final do ciclo de 45 dias.</p>`
        },
        {
            day: 45,
            title: 'Abate e Procedimentos Pré-Abate',
            desc: 'Garantindo carne de qualidade.',
            guide: `<h3>🍗 Jejum e Captura para Abate</h3><p>O preparo correto para o abate evita contaminações e hematomas na carcaça. Realize o jejum hídrico e alimentar de 6 a 8 horas antes da captura; isso garante que o trato digestivo esteja vazio, o que é fundamental para evitar o rompimento de intestinos e vesícula biliar durante o processamento, contaminando a carne com fezes ou bile amarga. **Atenção:** Mantenha sempre a oferta de água fresca até o momento da carga, pois a desidratação torna a retirada das penas difícil e prejudica a textura da carne. Capture as aves com extrema paciência e silêncio, segurando-as sempre pelas pernas e nunca pelas asas ou pescoço, para evitar hematomas e fraturas que deprecia o valor do produto final. Transporte em caixas limpas e ventiladas no horário mais fresco do dia.</p>`
        }
    ],

    // 3. Gado de Leite
    gado_leite: [
        {
            day: 0,
            title: 'Início do Controle e Gestão',
            desc: 'Identificação e escore corporal.',
            guide: `<h3>🥛 Gestão Profissional do Rebanho Leiteiro</h3><p>Vaca sem identificação é apenas um custo invisível; você não pode gerenciar o que não mede. Comece numerando ou nomeando cada animal com brincos ou marcas legíveis. Registre rigorosamente as datas de parto, pois o ciclo do leite depende inteiramente de uma gestação bem-sucedida por ano. Avalie o <b>Escore de Condição Corporal (ECC)</b> regularmente: vacas muito magras (ECC abaixo de 2.5) dificilmente entrarão no cio e terão baixa persistência de lactação, enquanto vacas gordas demais (ECC acima de 4.0) terão partos difíceis e doenças metabólicas como cetose. A meta para um rebanho saudável e rentável é manter o ECC entre 3.0 e 3.5. O acompanhamento individualizado permite ajustar a dieta de cada vaca, garantindo que as altas produtoras recebam o suporte nutricional necessário sem desperdício de ração nas demais.</p>`
        },
        {
            day: 0,
            type: 'routine',
            freq: 'daily',
            title: 'Rotina de Ordenha Higiênica',
            desc: 'Prevenção de mastite e qualidade.',
            guide: `<h3>🥛 O Ritual da Ordenha: Saúde e Rendimento</h3><p>A ordenha é o momento de colher o fruto do seu trabalho, mas também é o maior risco para a saúde do úbere. A mastite é a doença mais cara na pecuária de leite e 90% dos casos ocorrem por falhas na ordenha. Siga este protocolo severo: 1. <b>Teste da Caneca de Fundo Preto</b> para identificar mastite clínica (grumos). 2. <b>Pré-Dipping</b>: use solução sanitizante em todos os tetos e aguarde 30 segundos (tempo de ação). 3. <b>Secagem</b>: use papel toalha descartável, uma folha por teto; pano de tecido espalha bactérias de uma teta para outra. 4. Coloque a ordenhadeira ou ordenhe manualmente com suavidade. 5. <b>Pós-Dipping</b>: essencial para fechar o canal do teto que permanece aberto por 30 minutos pós-ordenha. Ofereça comida fresca logo após para que a vaca permaneça em pé até o esfíncter fechar, evitando que bactérias do chão entrem no úbere.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'monthly',
            title: 'Controle Estratégico de Parasitas',
            desc: 'Combate a carrapatos e moscas.',
            guide: `<h3>🪰 Guerra Inteligente Contra Carrapatos</h3><p>O carrapato africano e a mosca-dos-chifres sugam o lucro do produtor na forma de sangue, estresse e doenças. O carrapato transmite o "Complexo Tristeza Parasitária Bovina", que causa febre alta e pode matar uma vaca de alta produção em poucos dias. Não aplique veneno por impulso; trate quando visualizar os primeiros focos para quebrar o ciclo reprodutivo no pasto. Faça o rodízio de princípios ativos (Piretróides, Amitraz, etc.) para evitar que os parasitas criem resistência genética aos produtos. **Atenção Vital:** Verifique sempre o período de carência do medicamento no rótulo. Muitos produtos "Pour-on" ou injetáveis proíbem o consumo do leite por até 15 dias após a aplicação; entregar leite com resíduo de defensivo químico é crime e pode resultar no descarte automático de toda a carga de um caminhão tanque.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Diagnóstico de Mastite Subclínica',
            desc: 'Teste CMT na linha de leite.',
            guide: `<h3>🦠 CMT: Enxergando a Doença Invisível</h3><p>A mastite subclínica é perversa porque o leite parece normal a olho nu, mas a contagem de células somáticas (CCS) está alta e a produção caiu até 20%. O teste <b>California Mastitis Test (CMT)</b> é sua ferramenta diária de diagnóstico no campo. Misture uma pequena quantidade do leite de cada quarto com o reagente específico na raquete; a formação de um gel ou gosma indica inflamação. Se o teste der positivo, separe o leite desse animal (uso doméstico ou descarte) e consulte um veterinário para tratamento com antibióticos intramamários específicos. Manter vacas com mastite subclínica no rebanho principal contamina as demais vacas sadias através das mãos do ordenador ou do conjunto de ordenheiras, transformando um caso isolado em um surto generalizado que destruirá a qualidade do seu leite e sua bonificação no laticínio.</p>`
        },
        {
            day: 60,
            type: 'routine',
            freq: 'monthly',
            title: 'Nutrição: Cochos e Bebedouros',
            desc: 'Higiene e suplementação.',
            guide: `<h3>🧼 Água Limpa: O Nutriente do Leite</h3><p>Muitos produtores investem em ração cara e esquecem que o leite é 87% água. Uma vaca de alta produção pode beber até 120 litros de água por dia. Se o bebedouro estiver sujo, com lodo ou com cheiro de urina, o animal beberá muito menos e, consequentemente, a produção de leite cairá imediatamente. Lave os bebedouros semanalmente com escova e hipoclorito se necessário. Da mesma forma, limpe os cochos de ração, removendo restos de silagem ou concentrado que fermentaram ou pegaram chuva; o alimento azedo causa distúrbios digestivos e rejeição do animal. Para a adubação da pastagem do gado de leite, considere a aplicação de nitrogenados após a saída dos animais do piquete, aproveitando a umidade para que o capim rebrote com força e alta proteína, reduzindo seus custos com ração no cocho.</p>`
        }
    ],

    // 4. Gado de Corte
    gado_corte: [
        {
            day: 0,
            title: 'Recepção e Adaptação do Lote',
            desc: 'Manejo de entrada e estresse.',
            guide: `<h3>🐂 Recepção Estratégica de Gado de Corte</h3><p>A chegada do gado ao novo pasto é o momento de maior estresse, o que pode causar perda de peso e queda na imunidade. Garanta hidratação abundante e acesso imediato a sal mineral de qualidade. Deixe os animais descansarem por pelo menos 24 horas antes de qualquer manejo invasivo como vacinação ou marcação. Avalie a lotação do pasto: um erro comum é colocar animais demais em áreas pequenas, o que resulta no "pasto rapado"; o gado comerá a ponta do capim onde está a energia e, se for forçado a comer o talo, perderá peso (efeito boi sanfona). A regra é manter a altura do capim ideal para cada espécie (ex: Brachiaria deve ter saída com 15-20cm) para garantir o rebrote vigoroso e a nutrição constante do rebanho.</p>`
        },
        {
            day: 1,
            type: 'routine',
            freq: 'daily',
            title: 'Ronda Sanitária e Nutricional',
            desc: 'Olho do dono e limpeza de cochos.',
            guide: `<h3>👀 O Olho do Dono: Ronda Diária Detalhada</h3><p>Fazer a ronda não é apenas verificar se os animais estão vivos; é observar o comportamento alimentar e a saúde geral. Verifique os cochos de sal mineral: eles nunca devem ficar vazios, pois o boi sem mineralização não consegue converter o capim em carne eficientemente. Limpe os cochos se houver acúmulo de água da chuva ou folhas secas que podem azedar o suplemento. Observe as fezes: se estiverem muito duras e secas, o capim está com fibra demais e pouca proteína, indicando a necessidade de um sal proteinado ou ureia para ajudar na digestão. Água limpa é fundamental; lave os bebedouros periodicamente para evitar o lodo e odores que reduzem o consumo hídrico, essencial para o metabolismo de ganho de peso.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Pesagem de Controle e GMD',
            desc: 'Monitorando o ganho de peso diário.',
            guide: `<h3>⚖️ Gestão do Ganho Médio Diário (GMD)</h3><p>O lucro na pecuária de corte está no tempo de permanência do boi no pasto. Pese uma amostra do lote mensalmente, sempre no mesmo horário (de preferência pela manhã, em jejum) para evitar variações de "enchimento" do estômago. A meta nas águas deve ser entre 700g e 1kg por dia, enquanto na seca o objetivo é manter o peso ou ter um ganho leve. Se o lote não atingir a meta, avalie imediatamente a altura do pasto (falta de massa) ou a carga de verminoses. Animais que não ganham peso estão "comendo o seu lucro". Use esses dados de pesagem para decidir o momento exato da nutrição suplementar ou do descarte de animais que não performam bem dentro da genética do seu plantel.</p>`
        },
        {
            day: 60,
            title: 'Manejo Sanitário: Vacinas e Vermífugos',
            desc: 'Proteção contra doenças fatais.',
            guide: `<h3>💉 Calendário Sanitário e Proteção Total</h3><p>A sanidade é o seguro do seu investimento. Siga rigorosamente o calendário oficial para febre aftosa (geralmente maio e novembro) e brucelose para fêmeas jovens. As clostridioses (como o carbúnculo) são assassinas silenciosas que matam os animais mais saudáveis e pesados subitamente; vacine anualmente todo o rebanho. A vermifugação estratégica deve ser feita na entrada da seca (maio) para "limpar" o organismo do animal quando a qualidade do pasto cai, permitindo que ele aproveite melhor a forragem fibrosa. Utilize vermífugos de amplo espectro mas alterne os princípios ativos a cada ciclo para evitar resistência parasitária. Um gado livre de parasitas internos e externos tem uma conversão alimentar até 15% superior aos animais infestados.</p>`
        },
        {
            day: 90,
            type: 'routine',
            freq: 'monthly',
            title: 'Manejo de Pastagem Rotacionada',
            desc: 'Maximizando a oferta de capim.',
            guide: `<h3>🌿 A Ciência do Pasto Rotacionado</h3><p>O segredo para engordar boi rápido é manejar o capim como uma cultura agrícola. Não permita que o animal coma a "gema" de crescimento do capim (fundo do talo). Troque o lote de piquete assim que atingirem a altura de saída recomendada; isso preserva o sistema radicular e permite que o capim rebrote com muita força e nutrientes assim que cair a primeira chuva. Para melhorar a produtividade, considere a adubação de cobertura com ureia ou NPK nos canteiros de maior valor, especialmente se o solo estiver deficiente. Lembre-se que aplicar <b>{{CALC_GM2}}g/m²</b> de calcário na reforma do pasto é essencial para que as raízes cresçam profundamente e o gado tenha comida de qualidade por mais tempo durante o ano.</p>`
        }
    ],

    // 5. Suínos
    suinos: [
        {
            day: 0,
            title: 'Manejo de Recém-Nascidos (Dia 0)',
            desc: 'Cuidados neonatais e colostro.',
            guide: `<h3>🐖 Proteção e Vigor do Leitão</h3><p>O leitão nasce praticamente sem imunidade e com pouquíssima reserva de energia. O momento do parto define a sobrevivência do lote. Seque cada animal imediatamente com papel toalha ou pó secante para evitar a hipotermia, que é a maior causa de mortes nas primeiras horas. Garanta que todos mamem o colostro na primeira hora de vida, pois este é o único meio de transmitir anticorpos da porca para o filhote. Realize o corte e a desinfecção do umbigo mergulhando-o em Iodo a 10% para fechar essa porta de entrada de bactérias. O controle térmico é decisivo: leitões precisam de um ambiente a 32°C (use o escamoteador aquecido), enquanto a porca prefere 20°C. Essa diferença exige atenção constante para o conforto de ambos.</p>`
        },
        {
            day: 3,
            title: 'Prevenção de Anemia Ferropriva',
            desc: 'Aplicação de ferro dextrano.',
            guide: `<h3>💉 Vitalidade: A Importância do Ferro</h3><p>O suíno é o animal que cresce mais rápido entre as criações domésticas, dobrando de peso em poucos dias. Infelizmente, o leite da porca é naturalmente pobre em ferro e o leitão nasce com reservas mínimas. Se você não aplicar o <b>Ferro Dextrano</b> até o 3º dia de vida, o animal desenvolverá anemia ferropriva, ficando pálido, com pelos ásperos e crescimento muito lento (o famoso "refugo"). Aplique a dose recomendada (geralmente 1ml ou 2ml) via intramuscular profunda no pescoço, logo atrás da orelha. Leitões anêmicos são porta aberta para diarreias e infecções pulmonares que dizimam a leitegada. Este manejo simples é o que garante que os animais entrem na fase de creche com vigor e peso comercial competitivo.</p>`
        },
        {
            day: 0,
            type: 'routine',
            freq: 'daily',
            title: 'Higiene e Limpeza das Baias',
            desc: 'Controle de gases e moscas.',
            guide: `<h3>🧹 Lavagem Estratégica e Manejo de Dejetos</h3><p>A higiene na suinocultura é questão de sobrevivência econômica. Os suínos possuem um instinto natural de separar a área de dormir da área de defecar; aproveite esse comportamento mantendo a área de repouso sempre seca e limpa. Remova as fezes diariamente conforme a rotina do plantel para evitar o acúmulo de amônia e gases tóxicos que irritam as vias respiratórias e diminuem o apetite. A lavagem das baias deve ser feita com critério para não gerar umidade excessiva, que favorece a proliferação de moscas e fungos. Se possível, utilize o sistema de "lâmina d'água" ou canaletas de escoamento rápido. Um ambiente limpo reduz drasticamente a necessidade de antibióticos e melhora significativamente a conversão alimentar dos animais.</p>`
        },
        {
            day: 21,
            title: 'Desmame e Adaptação na Creche',
            desc: 'Transição do leite para sólido.',
            guide: `<h3>🐖 O Desafio Crítico do Desmame</h3><p>O desmame é a fase de maior estresse emocional e físico na vida do suíno. A dieta muda radicalmente do leite materno altamente digestível para o alimento sólido. Forneça uma ração "pré-inicial" de altíssima qualidade, com grânulos pequenos e palatáveis para estimular o consumo. Mantenha os lotes uniformes e evite misturar leitões de ninhadas diferentes neste momento para reduzir as brigas por hierarquia, que podem causar ferimentos e travar o desenvolvimento. O acesso a água limpa em bebedouros tipo "chupeta" deve ser verificado várias vezes ao dia; se o leitão não beber água, ele não comerá a ração seca. O controle de temperatura na creche ainda é fundamental, pois qualquer resfriado nesta fase causa diarreias severas.</p>`
        },
        {
            day: 100,
            type: 'routine',
            freq: 'monthly',
            title: 'Monitoramento de Peso e Conversão',
            desc: 'Eficiência final e abate.',
            guide: `<h3>⚖️ Eficiência Produtiva e Balança</h3><p>Na fase de crescimento e terminação, o objetivo é transformar ração em carne no menor tempo possível. Pese os animais mensalmente para verificar se o ganho de peso está condizente com a genética utilizada (meta de chegar aos 100-110kg entre 150 e 170 dias). Se houver animais muito pequenos (refugos), separe-os imediatamente para verificar a presença de vermes ou doenças intestinais crônicas. Revise o desperdício de ração nos comedouros: até 10% do seu lucro pode estar caindo no chão por causa de regulagem errada. Lembre-se que o suíno é sensível ao calor; garanta ventilação forçada em dias quentes para que não entrem em estresse térmico, o que paralisa o ganho de peso e pode levar à morte súbita por ataque cardíaco.</p>`
        }
    ],

    // 6. Pomar (Citros/Frutas em Geral)
    pomar: [
        {
            day: -60,
            title: 'Análise de Solo e Calagem Prévia',
            desc: 'Correção química para longevidade das árvores.',
            guide: `<h3>🧪 A Base de Tudo: Equilíbrio Químico</h3><p>O sucesso de um pomar (Citros, Manga, Goiaba, etc.) começa 60 dias antes da muda chegar ao solo. As frutíferas são plantas perenes que exigem um pH estável (6.0 a 6.5) para absorver micronutrientes vitais. Aplique <b>{{CALC_GM2}}g/m²</b> de calcário dolomítico em área total e incorpore profundamente. O calcário demora cerca de dois meses para reagir e neutralizar o alumínio tóxico que "queima" as raízes finas das mudas novas. Solo ácido resulta em árvores raquíticas, com folhas amareladas e baixa produção de frutos, que tendem a cair precocemente por falta de Cálcio e Magnésio.</p>`
        },
        {
            day: -30,
            title: 'Abertura e Adubação de Super Covas',
            desc: 'Preparo físico e orgânico profundo.',
            guide: `<h3>🕳️ Preparando a "Casa" da Árvore</h3><p>Frutíferas viverão décadas no mesmo local, por isso a cova deve ser generosa (60x60x60cm). Ao abrir, separe a terra de cima (mais rica) da terra de baixo. Misture a terra de cima com 20 litros de esterco curtido, 500g de Superfosfato Simples e o calcário restante. Encha a cova com essa mistura e deixe "curtir" por 30 dias. Este período é fundamental para que o adubo estabilize e não ocorra fermentação excessiva, que poderia "cozinhar" as raízes delicadas da muda recém-plantada. Uma cova bem preparada garante um sistema radicular profundo e resistente a secas.</p>`
        },
        {
            day: 0,
            title: 'Plantio Técnico e Gestão do Enxerto',
            desc: 'Implantação e pegamento definitivo.',
            guide: `<h3>🍊 O Dia do Plantio: Cuidados Ouro</h3><p>No dia do plantio, abra apenas o espaço para o torrão na cova já preparada. Adicione <b>{{NPK_GM2}}g</b> de NPK <b>{{NPK_FORMULA}}</b> misturado na terra lateral. **Regra de Ouro:** Observe a união do enxerto (aquela "cicatriz" no caule); ela deve ficar pelo menos 5cm acima do nível do solo. Se enterrar o enxerto, a planta pode "apossar" (criar raízes acima do enxerto) e perder as características de resistência do cavalo. Após plantar, regue com 20 litros de água para eliminar bolsas de ar e aplique uma camada de cobertura morta em volta, mas sem encostar no tronco para evitar fungos.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'monthly',
            title: 'Coroamento e Manejo de Adubação Anelar',
            desc: 'Nutrição periférica e limpeza.',
            guide: `<h3>🌳 Alimentando a Copa: O Coroamento</h3><p>Mantenha um círculo de 1 metro de diâmetro limpo (sem grama) ao redor do tronco (coroamento). Isso evita que a roçadeira machuque o tronco, o que seria uma porta de entrada fatal para fungos como a Gomose. Adube sempre na projeção da copa (onde acaba a sombra das folhas), pois é lá que se encontram as raízes mais ativas na busca por comida. Use adubos ricos em Nitrogênio e Potássio para favorecer o crescimento de novos ramos. A limpeza do "pé" da árvore também facilita a visualização de formigas e outros problemas sanitários antes que se tornem incontroláveis.</p>`
        },
        {
            day: 7,
            type: 'routine',
            freq: 'weekly',
            title: 'Vigilância Contra Formigas Cortadeiras',
            desc: 'Proteção contra o inimigo número 1.',
            guide: `<h3>🐜 Defesa Ativa Contra Saúvas e Quem-Quens</h3><p>As formigas cortadeiras podem desfolhar uma muda jovem em uma única noite, levando-a à morte ou atrasando seu crescimento em meses. Siga as trilhas até encontrar o olheiro (buraco). Aplique iscas granuladas **ao lado** das trilhas, nunca dentro do buraco (elas precisam carregar a isca como se fosse folha). Não aplique iscas em solo úmido ou dias de chuva, pois o fungicida da isca perde a eficácia. Além das iscas, o uso de cones plásticos ou graxa de proteção no tronco da muda pode servir de barreira física eficiente para impedir que as cortadeiras subam na planta nos primeiros meses críticos.</p>`
        }
    ],

    // 7. Milho
    milho: [
        {
            day: -60,
            title: 'Estratégia de Calagem e Correção Profunda',
            desc: 'Neutralizando o alumínio tóxico para raízes.',
            guide: `<h3>📉 Equilíbrio Químico: O Motor do Milho</h3><p>O milho é uma cultura de crescimento explosivo que não tolera solos ácidos. O alumínio presente em solos com pH baixo trava o crescimento das raízes, impedindo a planta de buscar água e nutrientes em profundidade. Aplique <b>{{CALC_GM2}}g/m²</b> de calcário dolomítico pelo menos 60 dias antes do plantio. O ideal é incorporar o calcário com arado ou grade a 20cm de profundidade. Se estiver em sistema de Plantio Direto, aplique em área total sobre a palhada. Um solo bem corrigido garante que as espigas sejam grandes e que a planta resista muito melhor a curtos períodos de seca (veranicos).</p>`
        },
        {
            day: -20,
            title: 'Manejo de Cobertura e Dessecação',
            desc: 'Limpeza e preparação da palhada.',
            guide: `<h3>🧹 Área Limpa: Eliminando a Competição</h3><p>O milho precisa nascer em um ambiente livre de competição com ervas daninhas, que roubam Nitrogênio e luz. Realize a dessecação ou limpeza mecânica da área 20 dias antes do plantio. Deixar o mato morrer no local cria uma cobertura morta que preserva a umidade do solo e evita a erosão. Nunca plante o milho no meio do mato verde, pois as substâncias químicas liberadas pelas raízes das ervas daninhas (alelopatia) podem atrasar o nascimento e vigor inicial do milho. Mantenha a roça "no limpo" para que cada semente de milho tenha 100% de acesso aos recursos do solo.</p>`
        },
        {
            day: 0,
            title: 'Semeadura Técnica e Adubação de Sulco',
            desc: 'Precisão no plantio e nutrição inicial.',
            guide: `<h3>🌽 O Dia D: Plantando com Precisão</h3><p>O plantio do milho define o potencial de produtividade. Utilize sementes de alta qualidade e adube o sulco com <b>{{NPK_GM2}}g</b> por metro linear de NPK <b>{{NPK_FORMULA}}</b>. O adubo deve ficar cerca de 5cm ao lado e abaixo da semente para evitar a "salga" (queima química da semente). A profundidade ideal de semeadura é de 3 a 5cm; plantar muito raso expõe a semente a pássaros e secamento, enquanto muito fundo atrasa a emergência. Controle a velocidade do plantio (máximo 5km/h) para garantir uma distribuição uniforme, sem falhas que poderiam reduzir drasticamente o número de espigas por hectare.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Monitoramento de Pragas (Lagarta-do-Cartucho)',
            desc: 'Proteção contra o inimigo mais voraz.',
            guide: `<h3>🐛 Spodoptera: A Batalha pelo Cartucho</h3><p>A lagarta-do-cartucho (Spodoptera frugiperda) é a praga mais destrutiva do milho. Ela se aloja no interior das folhas novas e pode destruir o ponto de crescimento da planta em poucos dias. Faça inspeções semanais caminhando em "W" pela lavoura e olhando o interior das folhas. Se encontrar mais de 10% de plantas com raspaduras ou fezes frescas, realize o controle. Priorize bioinseticidas (Bacillus thuringiensis) ou defensivos fisiológicos quando as lagartas forem pequenas. Uma planta com o cartucho destruído nunca produzirá uma espiga de qualidade comercial, resultando em perdas financeiras pesadas.</p>`
        },
        {
            day: 30,
            title: 'Adubação de Cobertura e Boost de Nitrogênio',
            desc: 'Nitrogênio para definição de produtividade.',
            guide: `<h3>✨ Ureia: O Combustível do Enchimento</h3><p>Quando o milho atinge a fase de 4 a 6 folhas (V4-V6), ele decide internamente o potencial de grãos por espiga. Este é o momento crítico para a aplicação de Nitrogênio. Aplique a cobertura de Ureia a cerca de 10cm de distância do pé. **Dica Crítica:** A Ureia evapora no sol forte; aplique preferencialmente no final da tarde, antes de uma chuva prevista, ou incorpore levemente à terra. O Nitrogênio é o motor da planta; sem ele, o milho ficará amarelado, baixo e as espigas serão pequenas (pontas vazias). Garanta que o solo esteja úmido para que a raiz consiga "beber" a nutrição rapidamente.</p>`
        }
    ],

    // 8. Feijão
    feijao: [
        {
            day: -60,
            title: 'Análise de Solo e Calagem de Ciclo Curto',
            desc: 'Correção rápida para planta de crescimento veloz.',
            guide: `<h3>📉 Feijão: O Exigente de Ciclo Curto</h3><p>O feijoeiro é uma planta de ciclo muito curto (75 a 90 dias) e não tem tempo para se recuperar de erros no preparo do solo. Ele é extremamente sensível à acidez e à toxicidade por Alumínio e Manganês. Aplique <b>{{CALC_GM2}}g/m²</b> de calcário dolomítico pelo menos 60 dias antes do plantio para elevar o pH para 6.0. O Cálcio fornecido será vital para a formação das paredes celulares, tornando a planta mais resistente a doenças fúngicas de solo. Solo corrigido garante que as bactérias fixadoras de Nitrogênio (Rhizobium) trabalhem com eficiência máxima, economizando adubo químico no futuro.</p>`
        },
        {
            day: -15,
            title: 'Limpeza de Área e Manejo de Palhada',
            desc: 'Eliminando concorrência para o arranque inicial.',
            guide: `<h3>🧹 Berço Limpo para o Feijão</h3><p>O arranque inicial do feijoeiro é o momento de maior fragilidade. Se houver ervas daninhas competindo por luz e nutrientes nos primeiros 20 dias, a perda de produtividade pode chegar a 40%. Realize a limpeza total da área (dessecação ou roçada) 15 dias antes do plantio. O feijoeiro "nasce fraco" se comparado ao milho, por isso a ausência de mato é lei. A palhada seca deixada no chão ajudará a manter a umidade e a temperatura amena, além de evitar que a terra suje as vagens em formação durante as chuvas fortes, preservando a qualidade sanitária dos grãos.</p>`
        },
        {
            day: 0,
            title: 'Semeadura e Inoculação Biológica',
            desc: 'Plantio técnico e adubação de base.',
            guide: `<h3>🫘 Plantio Suave e Nutrição de Fósforo</h3><p>Na hora de plantar, utilize adubo NPK <b>{{NPK_FORMULA}}</b> rico em Fósforo (P), aplicando <b>{{NPK_GM2}}g</b> por metro linear. O Fósforo é o nutriente do "arranque". Semeie em solo bem destorroado a uma profundidade de 3cm; se enterrar demais, a semente gasta toda a sua energia tentando sair e nasce uma planta raquítica. **Dica de Ouro:** Utilize inoculante líquido no momento do plantio (Rhizobium). Isso permite que a planta "fabrique" seu próprio Nitrogênio do ar, resultando em plantas mais verdes e grãos mais densos. Garanta que o solo esteja úmido para o pegamento imediato da semente.</p>`
        },
        {
            day: 10,
            type: 'routine',
            freq: 'weekly',
            title: 'Monitoramento de Vetores (Mosca Branca)',
            desc: 'Defesa contra o Mosaico Dourado.',
            guide: `<h3>🐞 Pragas Chave: O Perigo nas Folhas</h3><p>A mosca branca é o maior pesadelo do feijoeiro, pois transmite o vírus do Mosaico Dourado, que amarela e atrofia as plantas irreversivelmente. Faça vistorias semanais balançando as plantas; se notar "nuvens" de mosquinhas brancas, controle imediatamente com óleo de neem ou defensivos específicos. Fique atento também à Vaquinha (Diabrotica), que come as folhas e cujas larvas atacam as raízes. Uma lavoura protegida nesta fase inicial garante que a planta chegue ao florescimento com área foliar máxima para converter luz em grãos abundantes. O controle deve ser rigoroso até o fechamento das entrelinhas.</p>`
        },
        {
            day: 25,
            title: 'Adubação de Cobertura e Nitrogênio',
            desc: 'Boost energético para o florescimento.',
            guide: `<h3>✨ Ureia: O Pulmão do Feijoeiro</h3><p>Aos 20-25 dias de vida (quando surgem as primeiras folhas trifoliadas), o feijão precisa de um "empurrão" de Nitrogênio para garantir um dossel foliar vigoroso antes de começar a florir. Aplique uma dose leve de Ureia em cobertura lateral. **Cuidado Vital:** Nunca jogue o adubo dentro do "olho" ou copinho da planta, pois a ureia queima o tecido tenro do feijão. Aplique entre as linhas e, se possível, logo antes de uma chuva ou irrigação. O Nitrogênio nesta fase garante que a planta tenha energia para segurar todas as flores que virão em seguida, evitando o abortamento de vagens e garantindo uma colheita uniforme.</p>`
        }
    ],

    // 9. Mandioca
    mandioca: [
        {
            day: -60,
            title: 'Estratégia de Calagem e Correção Química',
            desc: 'Neutralizando alumínio para expansão radicular.',
            guide: `<h3>📉 Mandioca: A Força Sob a Terra</h3><p>Embora rústica, a mandioca duplica sua produção em solos corrigidos quimicamente. O alumínio tóxico impede o engrossamento das raízes tuberosas. Aplique <b>{{CALC_GM2}}g/m²</b> de calcário dolomítico pelo menos 60 dias antes do plantio para que o Cálcio e Magnésio penetrem na zona de raízes. A calagem aumenta o vigor da rama e garante que a planta tenha "saúde" para acumular amido. Em solos muito pobres, a mandioca cresce mas não produz raízes comerciais, resultando em um trabalho frustrante na hora da colheita. A correção do solo é o seguro de produtividade da lavoura.</p>`
        },
        {
            day: -30,
            title: 'Preparo Físico de Solo (Aração e Gradagem)',
            desc: 'Solo fofo para permitir o engrossamento das raízes.',
            guide: `<h3>🚜 Solo Solto = Raízes Grossas</h3><p>A mandioca precisa de "espaço físico" para expandir. Se o solo estiver compactado (duro), as mandiocas serão finas, tortas e fibrosas. Realize uma aração profunda (25 a 30cm) seguida de gradagem para quebrar os torrões. Em áreas com declividade, o plantio deve seguir as curvas de nível para evitar a erosão, já que a mandioca demora a cobrir o solo. Um solo bem destorroado facilita imensamente o trabalho de "arrancar" a mandioca no final do ciclo, reduzindo a quebra de raízes preciosas que ficariam perdidas debaixo da terra terra dura.</p>`
        },
        {
            day: 0,
            title: 'Plantio Técnico de Manivas Selecionadas',
            desc: 'Qualidade da muda e posição no sulco.',
            guide: `<h3>🥔 A Arte de Plantar Manivas</h3><p>Utilize manivas do "terço médio" de plantas sadias, com 15 a 20cm de comprimento e 5 a 7 gemas. Plante as manivas horizontalmente em sulcos a 5-10cm de profundidade. **Dica de Especialista:** O plantio horizontal facilita o nascimento e, principalmente, a colheita, pois as raízes se distribuem de forma mais superficial e espalhada. Se recomendado por análise, aplique Fósforo (Fosfato Natural) no fundo do sulco de plantio. O espaçamento ideal é de 1m entre linhas. Garanta que as gemas estejam voltadas para cima se optar pelo plantio inclinado, garantindo o vigor de nascimento.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Gestão de Mato e Capina (Período Crítico)',
            desc: 'Luz total para o desenvolvimento da rama.',
            guide: `<h3>🌿 O Inimigo nº 1: A Sombra do Mato</h3><p>A mandioca é extremamente sensível à sombra nos primeiros 100 dias de vida (Período Crítico de Interferência). Se o mato crescer mais que a mandioca nesta fase, as raízes não se formarão e a produtividade cairá mais de 60%. Mantenha a roça "no limpo" através de capinas manuais ou mecânicas. Assim que a mandioca "fechar" (cobrir o chão com suas folhas), ela mesma fará sombra no mato e o controle se tornará muito mais fácil. A limpeza do canteiro também evita o abrigo de pragas como o percevejo-de-renda e o ácaro, que sugam a seiva das folhas jovens.</p>`
        },
        {
            day: 60,
            title: 'Adubação de Cobertura e Foco em Potássio',
            desc: 'Potássio para enchimento e acúmulo de amido.',
            guide: `<h3>🥔 Potássio: O Nutriente da Raiz</h3><p>Aos 60 dias, a mandioca inicia o processo de "tuberização" (começa a transformar a seiva em raízes de amido). O Potássio (K) é o combustível para este processo. Aplique uma cobertura rica em K (como Cloreto de Potássio) em filete lateral, longe do caule para não queimar. O Potássio garante que a mandioca fique "enxuta" e macia no cozimento. Evite excesso de Nitrogênio tardio, pois isso faria a planta gastar energia produzindo apenas folhas e ramas gigantes, esquecendo de engrossar as raízes debaixo da terra. O equilíbrio nutricional nesta fase define o lucro da safra.</p>`
        },
        {
            day: 365,
            title: 'Cura Fisiológica e Ponto de Colheita',
            desc: 'Acúmulo máximo de amido e qualidade culinária.',
            guide: `<h3>🥘 A Hora da Mesa: Colheita e Amido</h3><p>O ponto de colheita da mandioca depende do acúmulo de amido, não apenas do tamanho. O melhor momento é durante o "repouso vegetativo" (inverno ou seca), quando a planta derruba parte das folhas. **Dica Crítica:** Se chover muito e a planta começar a soltar brotos novos lá no topo, ela está "gastando" o amido da raiz para crescer; nesse momento, a mandioca fica "aguada" e não cozinha bem. Espere o solo secar um pouco para colher. Mandioca colhida na hora certa "derrete" na panela e tem o sabor característico e cremoso que todos buscam.</p>`
        }
    ],

    // --- NOVAS CULTURAS (EXPANSÃO) ---

    // 10. Alface (Folhosas)
    alface: [
        {
            day: -10,
            title: 'Preparo do Canteiro e Adubação Orgânica Base',
            desc: 'Criação de um solo rico e macio para folhosas.',
            guide: `<h3>🥬 Alface: O Canteiro de Ouro</h3><p>A alface é uma hortaliça que exige solo extremamente rico em matéria orgânica e Nitrogênio para crescer rápido e manter a maciez das folhas. Prepare um canteiro alto (20cm) para evitar o encharcamento das raízes, que causaria podridão precoce. Incorpore 3 a 5kg de esterco curtido por metro quadrado e aplique <b>{{NPK_GM2}}g/m²</b> de NPK <b>{{NPK_FORMULA}}</b>. O solo deve ser revolvido até ficar com textura de "pó", sem torrões. Um solo bem adubado com Nitrogênio garante que as folhas cresçam largas, verdes e sem o amargor típico de plantas sob estresse nutricional ou falta de água.</p>`
        },
        {
            day: 0,
            title: 'Transplantio Técnico e Aclimatação',
            desc: 'Muda no local definitivo com cuidado radicular.',
            guide: `<h3>🌱 Transplantio: O Início da Jornada</h3><p>Nunca plante sementes de alface direto no canteiro; elas são frágeis e a taxa de perda é alta. Utilize mudas sadias com 4 a 5 folhas definitivas. Realize o transplantio preferencialmente no final da tarde para evitar que o sol forte murche a muda na chegada. O espaçamento ideal é de 25x25cm. **Atenção:** Mantenha o torrão nivelado com a superfície; não enterre a coroa da alface, pois isso atrai fungos de solo que matam a planta na primeira semana. Regue imediatamente após o plantio para garantir que as raízes entrem em contato íntimo com a terra nova.</p>`
        },
        {
            day: 10,
            type: 'routine',
            freq: 'weekly',
            title: 'Irrigação Diária e Gestão de Temperatura',
            desc: 'Umidade constante para folhas crocantes.',
            guide: `<h3>💧 Hidratação para Textura Gourmet</h3><p>A alface é composta por mais de 95% de água. Se o solo secar totalmente por apenas algumas horas sob sol forte, a planta pode entrar em estresse, tornando-se fibrosa e amarga. Irrigue o canteiro diariamente, preferencialmente nas primeiras horas da manhã ou no final da tarde. O objetivo é manter a terra sempre úmida, de aspecto "fresco". Em regiões muito quentes, o uso de telas de sombreamento (sombrite 30%) pode ajudar a baixar a temperatura das folhas, evitando o "queimado de borda" e o pendoamento (floração) precoce que estraga o sabor comercial.</p>`
        },
        {
            day: 20,
            type: 'routine',
            freq: 'weekly',
            title: 'Adubação de Cobertura Nitrogenada (Boost)',
            desc: 'Força extra para a expansão foliar.',
            guide: `<h3>✨ Explosão Verde: Suplementação de N</h3><p>No meio do ciclo (cerca de 20 dias após o transplante), a alface entra em fase de crescimento acelerado. Para garantir folhas gigantes e suculentas, aplique uma adubação nitrogenada de cobertura. Utilize ureia diluída em água ou adubo líquido orgânico (chorume). Aplique entre as fileiras, tomando extremo cuidado para não molhar as folhas com a solução de adubo sob sol forte, o que causaria queimaduras químicas. O Nitrogênio é o "combustível" do verde; plantas bem nutridas apresentam cor vibrante e brilho natural nas folhas, sendo muito mais resistentes a pequenos ataques de pulgões.</p>`
        },
        {
            day: 45,
            title: 'Colheita e Ponto de Sabor (Pré-Pendão)',
            desc: 'O ápice da crocância e doçura.',
            guide: `<h3>🥗 Colheita no Ponto de Ouro</h3><p>O momento ideal da colheita é quando a cabeça da alface está firme mas sem sinais de alongamento central. Se o centro começar a subir (pendoar), a planta está se transformando para dar flores, e as folhas ficarão amargas e duras instantaneamente. Colha preferencialmente nas horas mais frescas do dia (manhã cedo) para garantir o máximo de "turgidez" (crocância). Corte rente ao solo com uma faca afiada ou arranque com a raiz se for para consumo imediato. Alface colhida fresca e no ponto certo tem um equilíbrio perfeito entre doçura e frescor, sendo a estrela de qualquer salada saudável.</p>`
        }
    ],

    // 11. Tomate (Frutos)
    tomate: [
        {
            day: -15,
            title: 'Análise e Correção de Solo (Calagem)',
            desc: 'Foco no Cálcio para evitar podridão.',
            guide: `<h3>🍅 O Solo Ideal para o Tomateiro</h3><p>O tomate é uma das culturas mais exigentes em nutrição e equilíbrio de solo. A principal preocupação deve ser o nível de Cálcio, cuja deficiência causa a famosa "Podridão Apical" ou "Fundo Preto". Aplique <b>{{CALC_GM2}}g/m²</b> de calcário dolomítico pelo menos 15 a 30 dias antes do plantio para que o solo atinja o pH ideal entre 6.0 e 6.5. O calcário não só corrige a acidez, mas fornece o Cálcio e Magnésio necessários para a firmeza do fruto. Em canteiros, revolva a terra a uma profundidade de 25cm, garantindo que o solo esteja solto e bem drenado, pois o tomateiro detesta solos compactados que favorecem doenças radiculares e murchamento súbito.</p>`
        },
        {
            day: 0,
            title: 'Transplantio e Adubação de Base',
            desc: 'Mudas sadias e nutrição inicial.',
            guide: `<h3>🌱 Implantação e Nutrição Estratégica</h3><p>Para o sucesso da lavoura, utilize mudas sadias com 4 a 6 folhas definitivas. No momento do transplantio, enterre a muda até a altura da primeira folha; isso estimula a formação de raízes adventícias ao longo do caule enterrado, tornando a planta muito mais forte e capaz de absorver nutrientes. Na cova ou sulco, aplique <b>{{NPK_GM2}}g</b> de adubo NPK rico em Fósforo (P) e Potássio (K) para o desenvolvimento radicular inicial. Misture bem o adubo com a terra para evitar o contato direto com as raízes sensíveis. O uso de matéria orgânica curtida, como esterco de galinha ou húmus de minhoca, é altamente recomendado para melhorar a CTC do solo e a retenção de umidade.</p>`
        },
        {
            day: 15,
            title: 'Estaqueamento e Condução da Planta',
            desc: 'Suporte físico para crescimento vertical.',
            guide: `<h3>🪵 Sustentação e Manejo de Espaço</h3><p>O tomateiro de crescimento indeterminado atinge grandes alturas e seu caule é frágil demais para suportar o peso dos frutos sem ajuda. O estaqueamento deve ser feito precocemente para evitar que a planta tombe e entre em contato com o solo úmido, o que causaria doenças fúngicas imediatas. Use estacas de bambu, madeira ou fitilhos de ráfia presos a uma estrutura superior. Amarre a planta com o "nó em oito", deixando uma folga generosa entre o caule e a estaca; o caule do tomateiro engrossa rapidamente e um amarrio apertado pode enforcar a planta, interrompendo o fluxo de seiva e comprometendo toda a produção futura do cacho.</p>`
        },
        {
            day: 25,
            title: 'Adubação de Cobertura e Crescimento',
            desc: 'Nitrogênio para vigor vegetativo.',
            guide: `<h3>✨ Impulso Vegetativo e Vigor</h3><p>Nesta fase de crescimento acelerado, o tomateiro demanda um aporte extra de Nitrogênio e Potássio. Aplique a primeira cobertura de adubo em círculo ao redor da planta, mantendo uma distância de 10-15cm do caule para evitar queimaduras químicas. O Nitrogênio é fundamental para a formação de folhas largas e verdes, que são as "panelas" onde a planta cozinha a energia necessária para os frutos. Se o solo estiver úmido, o adubo se dissolverá gradualmente; caso contrário, regue logo após a aplicação. É vital manter o equilíbrio: excesso de Nitrogênio sem Potássio resulta em plantas muito "moles", que atraem pragas como pulgões e mosca branca com facilidade.</p>`
        },
        {
            day: 50,
            title: 'Adubação de Florada e Frutificação',
            desc: 'Potássio para qualidade e doçura.',
            guide: `<h3>🌼 O Segredo dos Frutos Perfeitos</h3><p>Com o início da florada e o surgimento dos primeiros frutos, a planta muda sua prioridade metabólica para a produção de açúcares. O Potássio (K) torna-se o nutriente mais importante agora. Ele regula a entrada e saída de água da planta e garante frutos carnudos, doces e com boa durabilidade pós-colheita. Utilize uma fórmula NPK balanceada, como o 12-06-12 ou similar, focando na reposição do K. Lembre-se que a água deve ser aplicada na base da planta (gotejamento é o ideal), nunca nas folhas, para evitar a requima e o oídio, fungos que devastam plantios de tomate em poucos dias de umidade foliar excessiva.</p>`
        },
        {
            day: 20,
            type: 'routine',
            freq: 'weekly',
            title: 'Manejo de Desbrota Semanal',
            desc: 'Eliminação de brotos laterais.',
            guide: `<h3>✂️ Poda de Condução e Concentração de Energia</h3><p>A desbrota é a operação mais importante para o manejo do tomateiro indeterminado. Toda semana, remova os brotos laterais, conhecidos como "chupões", que nascem na axila entre a folha e o caule principal. Se deixados crescer, esses brotos roubam a energia que deveria ir para os frutos, além de fechar a ventilação da planta, criando um microclima úmido favorável a doenças. Faça a retirada manual quando os brotos ainda forem pequenos (menos de 5cm) para que o ferimento cicatrize rapidamente sem a necessidade de fungicidas. Uma planta bem conduzida, com haste única, produz tomates maiores, mais uniformes e facilita imensamente o controle de pragas.</p>`
        }
    ],

    // 12. Cenoura (Raízes)
    cenoura: [
        {
            day: -5,
            title: 'Preparo de Canteiro e Calagem',
            desc: 'Criação de solo profundo e fofo.',
            guide: `<h3>🥕 O Segredo da Cenoura Reta e Doce</h3><p>A cenoura é uma raiz que depende exclusivamente da estrutura física do solo. Qualquer obstáculo, como solo compactado, pedras ou torrões de terra dura, fará com que a raiz bifurque ou entorte, arruinando o valor comercial e estético. Revire a terra a uma profundidade mínima de 30cm, deixando o solo extremamente fofo e aerado. Se o solo for ácido, aplique <b>{{CALC_GM2}}g/m²</b> de calcário e misture bem. A adubação de base deve focar no Fósforo (P), que é vital para o desenvolvimento radicular. Use <b>{{NPK_GM2}}g/m²</b> de NPK balanceado. Evite estercos frescos ou mal curtidos, pois eles causam o aparecimento de "pernas" nas cenouras devido ao excesso de amônia e calor de fermentação.</p>`
        },
        {
            day: 0,
            title: 'Semeadura Direta: Técnica e Espaçamento',
            desc: 'Plantio por sementes no local definitivo.',
            guide: `<h3>🌱 Semeando com Precisão</h3><p>Cenouras não aceitam transplante; a raiz guia é danificada no processo e resulta em frutos deformados. Realize a semeadura direta em pequenos sulcos de 1 a 2cm de profundidade. Como as sementes são minúsculas, misture-as com areia fina ou fubá para garantir uma distribuição mais uniforme ao longo da linha. Cubra com uma camada muito fina de terra peneirada e mantenha a umidade constante para a germinação. O espaçamento ideal entre linhas é de 20cm. Lembre-se que a semente de cenoura demora a germinar (7 a 15 dias), por isso a paciência e a manutenção do solo úmido, mas não encharcado, são os fatores decisivos para um bom início de plantio.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Manejo de Irrigação Regular',
            desc: 'Umidade constante para evitar rachaduras.',
            guide: `<h3>💧 O Equilíbrio Hídrico da Raiz</h3><p>A cenoura exige disponibilidade de água constante para crescer de forma uniforme. Flutuações drásticas entre solo seco e muito molhado causam o estiramento e a subsequente rachadura das raízes ("splitting"). Irrigue o canteiro diariamente se não houver chuvas, preferencialmente nas primeiras horas da manhã. O objetivo é manter a umidade nas camadas mais profundas (até 20cm), onde a ponta da raiz está buscando nutrientes. Solo muito encharcado, por outro lado, favorece o apodrecimento da "coroa" e o surgimento de nematoides. O uso de cobertura morta leve (palhada fina) entre as linhas ajuda a preservar a umidade e a temperatura amena do solo, condições ideais para a cultura.</p>`
        },
        {
            day: 25,
            title: 'Raleio ou Desbaste Estratégico',
            desc: 'Garantindo espaço para o crescimento.',
            guide: `<h3>✂️ Gestão de Espaço e Competição Nutricional</h3><p>O desbaste é uma tarefa dolorosa porém necessária. Quando as plantinhas atingirem cerca de 5cm de altura, você deve remover o excesso, deixando apenas as plantas mais vigorosas com um espaçamento de 5 a 8cm entre elas. Se as cenouras crescerem amontoadas, elas competirão por luz e nutrientes, resultando em raízes finas e entrelaçadas que não se desenvolvem. Realize o raleio preferencialmente após uma rega ou chuva, para que o solo esteja úmido e a remoção das plantas excedentes não abale o sistema radicular daquelas que permanecerão no canteiro. Esse manejo garante que cada cenoura tenha volume de terra suficiente para engrossar e atingir o tamanho padrão de mercado.</p>`
        },
        {
            day: 40,
            type: 'routine',
            freq: 'monthly',
            title: 'Adubação de Enchimento (Potássio)',
            desc: 'Doçura, cor e consistência.',
            guide: `<h3>🥕 Potássio: O Nutriente da Qualidade</h3><p>Nesta fase intermediária, a planta foca no acúmulo de reservas na raiz. O Potássio (K) é o protagonista, responsável por transportar os açúcares das folhas para a raiz, garantindo o sabor adocicado e a cor laranja intensa rica em betacaroteno. Aplique uma cobertura rica em K (como cinzas de madeira ou Cloreto de Potássio) entre as linhas, tomando cuidado para não encostar na planta. Evite o excesso de Nitrogênio nesta fase, pois isso faria a planta gastar energia produzindo folhas gigantes em detrimento da raiz. Uma raiz bem nutrida com Potássio terá uma casca mais firme, o que amplia significativamente o tempo de prateleira após a colheita.</p>`
        }
    ],

    // 13. Café (Perene)
    cafe: [
        {
            day: -60,
            title: 'Análise de Solo e Calagem Estratégica',
            desc: 'Correção de acidez e saturação por bases.',
            guide: `<h3>☕ Café: Cultura de Precisão e Longevidade</h3><p>O cafeeiro é uma cultura perene que permanecerá no mesmo local por decades, portanto o erro no preparo inicial do solo é irremediável. A análise de solo é obrigatória. Aplique <b>{{CALC_GM2}}g/m²</b> de calcário (ou conforme análise) para elevar o pH e, principalmente, neutralizar o alumínio tóxico que impede o crescimento das raízes. O cafeeiro é extremamente sensível à falta de Cálcio e Magnésio. Realize a calagem em área total e, se possível, incorpore no fundo do sulco ou da cova com o uso de gesso agrícola se houver necessidade de correção em profundidade. Um sistema radicular profundo é o seguro da lavoura contra as secas prolongadas e garante a estabilidade da produção nos anos de safra alta.</p>`
        },
        {
            day: 0,
            title: 'Plantio Técnico das Mudas',
            desc: 'Alinhamento e adubação de base.',
            guide: `<h3>🌱 Implantação da Lavoura</h3><p>O momento de levar a muda para o campo exige técnica apurada. Na cova, realize a fosfatagem usando fonte rica em Fósforo (Fosfato Natural ou Super Simples); aplique <b>{{NPK_GM2}}g</b> misturado uniformemente com a terra. O Fósforo é imóvel no solo e deve estar onde a raiz passará. **Atenção Crítica:** Jamais enterre o colo da muda (região de transição entre raiz e caule). O chamado "afogamento do colo" causa a morte da muda por asfixia radicular e podridão. Mantenha o torrão nivelado com a superfície do solo. Monitore o alinhamento e o espaçamento para facilitar a mecanização futura ou as capinas manuais, garantindo que as plantas recebam radiação solar por igual durante todo o dia.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Adubação de Formação (Nitrogênio)',
            desc: 'Desenvolvimento das saias do cafeeiro.',
            guide: `<h3>✨ Construindo a Estrutura Produtiva</h3><p>No primeiro e segundo ano de campo, o foco total é no crescimento vegetativo. O cafeeiro precisa formar a sua "saia" (ramos laterais baixos) onde ocorrerá a primeira produção. Aplique Nitrogênio e Potássio de forma parcelada (a cada 30-45 dias) durante todo o período chuvoso. Use fontes como Sulfato de Amônio ou Ureia, garantindo que o solo esteja úmido no momento da aplicação para evitar perdas por volatização. Distribua o adubo em um círculo sob a projeção da copa, mantendo distância do tronco. Esta nutrição constante e equilibrada permite que a planta atinja a maturidade fisiológica mais cedo, antecipando o início da colheita e aumentando o vigor para resistir a eventuais ataques de pragas.</p>`
        },
        {
            day: 120,
            type: 'routine',
            freq: 'quarterly',
            title: 'Adubação de Produção e Enchimento',
            desc: 'Foco em Potássio para grãos densos.',
            guide: `<h3>☕ Nutrindo a Colheita de Qualidade</h3><p>A partir do terceiro ano, as exigências nutricionais mudam drasticamente. A produção de frutos consome enormes reservas de Potássio da planta. Utilize fórmulas NPK cafeeiras balanceadas, como o 20-05-20 ou similar, dividindo em pelo menos 3 aplicações anuais (Setembro, Novembro e Janeiro). O Potássio é responsável pelo transporte de fotoassimilados para os grãos, garantindo peso (peneira alta), densidade e melhor qualidade de bebida. A falta de K nesta fase resulta em grãos chochos e "seca de ramos", onde a planta sacrifica as folhas para terminar de encher o fruto. Monitore também o enxofre e os micronutrientes como zinco e boro, essenciais para a retenção floral e o crescimento dos ponteiros.</p>`
        },
        {
            day: 180,
            type: 'routine',
            freq: 'quarterly',
            title: 'Manejo Fitossanitário (Ferrugem)',
            desc: 'Monitoramento da saúde foliar.',
            guide: `<h3>🍂 Defendendo a Fábrica de Energia</h3><p>A ferrugem do cafeeiro (Hemileia vastatrix) é a doença que mais causa prejuízos, podendo desfolhar a lavoura inteira se não for controlada. Identifique as manchas alaranjadas na parte inferior das folhas precocemente. O controle deve ser preventivo, especialmente em épocas de alta umidade e temperatura. Utilize fungicidas cúpricos ou sistêmicos conforme a recomendação técnica. Lembre-se que o café realiza a fotossíntese exclusivamente através das folhas; lavoura sem folhas não enche grão e não terá força para a próxima florada. Além da ferrugem, fique atento ao bicho-mineiro e à broca-do-café, pragas que atacam a integridade das folhas e a qualidade final dos grãos no processo de beneficiamento.</p>`
        }
    ],

    // 14. Banana
    banana: [
        {
            day: -60,
            title: 'Preparo da Área e Calagem',
            desc: 'Limpeza e correção química profunda.',
            guide: `<h3>🍌 O Solo para a Bananeira de Alta Produtividade</h3><p>A bananeira é uma planta extremamente exigente em fertilidade e água, sendo muito sensível à acidez excessiva. Antes de iniciar, limpe bem a área e aplique <b>{{CALC_GM2}}g/m²</b> de calcário dolomítico para elevar o pH para a faixa de 6.0 a 6.5. A calagem deve ser feita com antecedência de 60 dias para permitir a reação no solo. Atente-se à drenagem: a banana "bebe" muita água mas morre se as raízes ficarem submersas em solo encharcado (anoxia radicular). Escolha terrenos com boa declividade ou instale drenos se o solo for muito argiloso. Solo bem corrigido garante que a planta absorva o Potássio com eficiência, nutriente vital para o peso final dos cachos.</p>`
        },
        {
            day: -30,
            title: 'Abertura e Adubação de Covas',
            desc: 'Preparo físico e orgânico.',
            guide: `<h3>🕳️ Construindo o Lar da Bananeira</h3><p>As covas para banana devem ser generosas, com pelo menos 40x40x40cm, para permitir a expansão rápida do sistema radicular do rizoma. O espaçamento ideal varia de 3x3m para variedades altas (como a Prata-Anã) até 2x2m para variedades menores. Na cova, misture a terra de cima com 20 litros de esterco de curral bem curtido e 500g de superfosfato simples. A matéria orgânica é fundamental para manter a umidade e a biologia do solo ativa, o que previne doenças como o Mal-do-Panamá. Deixe a cova descansar por 30 dias antes de colocar a muda para que a fermentação do adubo não queime os tecidos jovens.</p>`
        },
        {
            day: 0,
            title: 'Plantio Técnico de Mudas',
            desc: 'Implantação e pegamento inicial.',
            guide: `<h3>🌱 Técnica de Plantio e Afogamento</h3><p>Utilize mudas de procedência garantida, preferencialmente do tipo "chifrinho" com 20 a 30cm. Ao plantar, coloque a muda no centro da cova garantindo que o rizoma não fique muito fundo nem muito exposto à superfície. Pressione a terra ao redor para eliminar bolsas de ar que podem apodrecer as raízes iniciais. Logo após o plantio, realize uma rega abundante com pelo menos 20 litros de água para garantir o contato íntimo da terra com a muda. Se o sol estiver muito forte, faça um sombreamento leve com folhas de palmeira ou capim seco para evitar o dessecamento do caule (pseudocaule) até que a planta comece a emitir as primeiras folhas novas.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Adubação de Cobertura 1 (Manutenção)',
            desc: 'Foco em nitrogênio e potássio.',
            guide: `<h3>✨ Nutrição para Crescimento Acelerado</h3><p>Após 30 dias do plantio, a bananeira começa sua fase de expansão vegetativa vigorosa. Aplique a primeira cobertura usando <b>{{NPK_GM2}}g</b> de NPK rico em Nitrogênio e Potássio (fórmula 20-05-20 ou similar). Distribua o adubo em um círculo ao redor da planta, respeitando uma distância de 30cm do pseudocaule para evitar queimaduras fitotóxicas. O Nitrogênio impulsiona o surgimento de folhas largas (a fábrica de energia), enquanto o Potássio começa a preparar a planta para o futuro cacho. Mantenha o solo sempre úmido através de regas regulares ou cobertura morta, pois a falta de água nesta fase atrasa irremediavelmente o ciclo de colheita em vários meses.</p>`
        },
        {
            day: 90,
            title: 'Manejo de Desbaste de Perfilhos',
            desc: 'Controle da "família" (Mãe, Filha e Neta).',
            guide: `<h3>✂️ Gestão da Touceira e Energia Genética</h3><p>Uma bananeira sem manejo vira um matagal impenetrável onde os cachos ficam pequenos e as pragas se escondem. O segredo da produtividade é o desbaste: mantenha apenas 3 plantas por touceira, obedecendo à hierarquia: 1. **Mãe** (a planta principal que dará o cacho); 2. **Filha** (o broto mais forte ao lado); 3. **Neta** (o rebento menor). Elimine todos os outros "seguidores" cortando-os rente ao solo com um facão afiado ou ferramenta específica de desbrota. Isso garante que a energia do solo e o sol não sejam divididos entre muitas competidoras, resultando em cachos muito mais pesados, uniformes e com frutos maiores para o consumo ou venda.</p>`
        }
    ],

    // 15. Coqueiro
    coqueiro: [
        {
            day: -90,
            title: 'Análise de Solo e Calagem de Longo Prazo',
            desc: 'Preparo para 60 anos de produção.',
            guide: `<h3>🥥 Coqueiro: O Investimento na Base</h3><p>Um coqueiro bem cuidado pode produzir por mais de 60 anos, mas seu sucesso depende inteiramente dos primeiros meses de solo. O pH ideal deve estar entre 5.5 e 6.5. Se a análise indicar acidez, aplique <b>{{CALC_GM2}}g/m²</b> de calcário e misture profundamente. O coqueiro é extremamente sensível à falta de Magnésio e Cálcio, que são fornecidos pela calagem. Além disso, escolha locais com boa drenagem; embora o coqueiro goste de água, o encharcamento prolongado apodrece as raízes e atrai doenças fúngicas letais como a lixa-do-coqueiro. Prepare a área com antecedência para que o solo esteja quimicamente equilibrado no dia do plantio das mudas selecionadas.</p>`
        },
        {
            day: -60,
            title: 'Abertura e Adubação de Super Covas',
            desc: 'Preparo físico para raízes vigorosas.',
            guide: `<h3>🕳️ A Cova Ideal: Estrutura e Reserva Nutricional</h3><p>Como o coqueiro é uma planta de grande porte, ele exige covas profundas e largas (mínimo de 80x80x80cm) para romper qualquer camada compactada do solo. Espaçamentos recomendados são de 7,5m para anões e 9m para gigantes. Na cova, realize uma adubação pesada: misture a terra de cima com 40 litros de esterco de curral bem curtido, 500g de superfosfato simples e 200g de micronutrientes (FTE). Essa reserva garantirá que a planta se estabeleça rapidamente nos primeiros dois anos, fase crucial onde o coqueiro define sua robustez estrutural para suportar os ventos e o peso dos futuros cachos de coco.</p>`
        },
        {
            day: 0,
            title: 'Plantio Técnico da Muda',
            desc: 'Identificação e pegamento inicial.',
            guide: `<h3>🌴 Plantio e Proteção da Muda</h3><p>Utilize mudas com 6 a 8 meses, que apresentem 4 a 6 folhas vigorosas. Ao plantar, posicione a muda de forma que o colo (o "pescoço" entre a raiz e as folhas) fique nivelado com a superfície do solo; nunca enterre o colo, pois isso causa o "afogamento" e morte da planta. Comprima a terra firmemente ao redor do torrão para evitar bolsas de ar. Instale estacas (tutores) para evitar que o vento balance a muda e quebre as raízes novas. Realize uma rega imediata com pelo menos 40 litros de água para garantir o pegamento. Em regiões de sol muito intenso, proteja a base da planta com cobertura morta (palhada) para evitar o superaquecimento do solo radicular.</p>`
        },
        {
            day: 30,
            title: 'Adubação de Formação 1 (Nitrogênio)',
            desc: 'Impulso para o crescimento das folhas.',
            guide: `<h3>✨ Nutrição Vegetativa e Vigor Inicial</h3><p>Nos primeiros dois anos, o foco total deve ser o crescimento das folhas e do estipe (tronco). Aplique <b>{{NPK_GM2}}g</b> de NPK nitrogenado em círculo ao redor da planta, respeitando uma distância de 50cm do tronco para evitar a queima dos tecidos. O Nitrogênio é o "combustível" para a folhagem verde e larga, que por sua vez capta energia para o crescimento radicular. Monitore a cor das folhas: se estiverem amareladas, aumente a dose de matéria orgânica ou Nitrogênio. Manter a planta bem nutrida nesta fase acelera o início da produção em até um ano, transformando o coqueiro anão em produtivo muito mais cedo.</p>`
        },
        {
            day: 60,
            type: 'routine',
            freq: 'monthly',
            title: 'Manejo Mensal de Adubação e Pragas',
            desc: 'Manutenção contínua e vigilância.',
            guide: `<h3>🔄 Manejo de Saúde e Produtividade Contínua</h3><p>Adube mensalmente com fórmulas balanceadas e ricas em Potássio, conforme a planta cresce. O coqueiro demanda vigilância constante contra a **Broca-do-Olho** (Rhynchophorus palmarum), que pode matar a árvore em poucos dias ao comer o meristema apical. Evite realizar ferimentos desnecessários no tronco ou folhas, pois o cheiro da seiva atrai o inseto. Utilize armadilhas luminosas ou com iscas de cana-de-açúcar e inseticida se notar a presença do besouro na propriedade. Da mesma forma, monitore ataques de ácaros nas flores e frutos jovens; a nutrição equilibrada é a melhor defesa natural da planta contra pragas e doenças oportunistas.</p>`
        }
    ],

    // --- DETALHAMENTO ESPECÍFICO (SEM CLONES GENÉRICOS) ---


    // 20. Couve (Brásicas)
    couve: [
        {
            day: -10,
            title: 'Preparo de Canteiro e Adubação Orgânica',
            desc: 'Solo rico para produção contínua.',
            guide: `<h3>🥬 O Canteiro da Couve-Manteiga</h3><p>A couve é uma das hortaliças que mais demanda Nitrogênio e matéria orgânica, devido à sua produção constante de folhas largas. Prepare um canteiro alto (20cm) para garantir que a água não pare nas raízes. Aplique <b>{{CALC_GM2}}g/m²</b> de calcário e, principalmente, uma carga generosa de 4 a 5kg de esterco curtido por metro quadrado. A couve prefere solos com alta CTC para manter os nutrientes sempre disponíveis. Misture <b>{{NPK_GM2}}g/m²</b> do adubo NPK <b>{{NPK_FORMULA}}</b> para fornecer o arranque necessário. Um solo bem nutrido e profundo é a base para colher folhas verdes, macias e sem o aspecto amarelado de desnutrição.</p>`
        },
        {
            day: 0,
            title: 'Plantio Técnico das Mudas',
            desc: 'Espaçamento e técnicas de fixação.',
            guide: `<h3>🌱 Transplantio e Estabelecimento</h3><p>A couve-manteiga cresce vigorosamente e precisa de espaço lateral. Use o espaçamento de 50x50cm para garantir que as folhas não se sobreponham, o que facilitaria o aparecimento de pragas. Realize o transplante preferencialmente no final da tarde ou em dias nublados para reduzir o estresse térmico da muda. Enterre a planta até a altura da primeira folha; isso dará estabilidade mecânica contra o vento e permitirá que ela desenvolva raízes extras no caule. Firme bem a terra ao redor da base e regue imediatamente. Mudas bem estabelecidas nesta fase são muito mais resistentes à geada leve e ataques iniciais de insetos.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Adubação de Cobertura Semanal',
            desc: 'Nitrogênio líquido para folhas gigantes.',
            guide: `<h3>✨ Turbo Verde: Suplementação de Nitrogênio</h3><p>Para colher folhas de tamanho profissional todas as semanas, você deve alimentar a couve constantemente. O Nitrogênio (N) é o componente essencial da clorofila e das proteínas foliares. Aplique semanalmente uma solução de ureia ou sulfato de amônio diluído (20g para 10 litros de água) na base das plantas, ou utilize chorume de compostagem bem curtido. Esta técnica de fertirrigação garante que a planta nunca entre em déficit nutricional, mantendo as folhas novas sempre crescendo com vigor. Evite aplicar o adubo nas folhas sob sol forte, pois isso pode causar queimaduras químicas irreversíveis que depreciam a qualidade da colheita.</p>`
        },
        {
            day: 20,
            type: 'routine',
            freq: 'weekly',
            title: 'Controle Sanitário de Pulgões e Lagartas',
            desc: 'Manutenção da saúde foliar.',
            guide: `<h3>🐛 Vigilância Contra Insetos Sugadores</h3><p>O pulgão-da-couve e a lagarta-da-couve são os maiores inimigos desta cultura. O pulgão se aloja no verso das folhas e no centro da planta, sugando a seiva e enrugando as folhas novas. Faça inspeções semanais e, ao notar os primeiros focos, aplique calda de fumo ou solução de sabão neutro (2%) no final da tarde. Para as lagartas, a catação manual é eficiente em hortas domésticas; em áreas maiores, use bioinseticidas à base de Bacillus thuringiensis. Manter o canteiro limpo, sem ervas daninhas, e atrair inimigos naturais como joaninhas e tesourinhas ajuda a manter a população de pragas sob controle biológico equilibrado.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Poda de Manejo e Colheita Estratégica',
            desc: 'Longa vida produtiva.',
            guide: `<h3>✂️ Técnica de Colheita e Renovação</h3><p>Diferente de outras alfaces, a couve não é colhida de uma só vez. Inicie a colheita retirando as folhas mais velhas de baixo para cima, cortando rente ao caule principal. Mantenha sempre 4 a 5 folhas no topo da planta (pontuário) para que ela continue realizando a fotossíntese e crescendo em altura. Se a planta começar a florescer precocemente devido ao calor intenso, corte a haste floral imediatamente para que a energia volte para as folhas. Com este manejo de poda e nutrição semanal, um único pé de couve pode produzir folhas de alta qualidade por 6 a 12 meses antes de precisar ser renovado no canteiro.</p>`
        }
    ],

    // 21. Rúcula
    rucula: [
        {
            day: -5,
            title: 'Preparo do Solo e Fertilização Base',
            desc: 'Criação de um berço rico e leve.',
            guide: `<h3>🥗 Rúcula: A Folhosa de Ciclo Relâmpago</h3><p>A rúcula é uma cultura de ciclo curtíssimo, exigindo que o solo esteja perfeitamente preparado desde o primeiro dia. Revolva a terra a uma profundidade de 15 a 20cm, eliminando torrões para que o solo fique extremamente leve e aerado. Incorpore composto orgânico ou húmus de minhoca em abundância, além de <b>{{NPK_GM2}}g/m²</b> do adubo NPK <b>{{NPK_FORMULA}}</b>. A rúcula prefere solos com pH próximo a 6.0; se necessário, realize uma correção leve com calcário peneirado. Um solo Rico em matéria orgânica garante que as folhas cresçam rápidas e macias, evitando o estresse que tornaria o sabor excessivamente amargo e picante antes da hora.</p>`
        },
        {
            day: 0,
            title: 'Semeadura Direta e Densidade',
            desc: 'Plantio por sementes no local final.',
            guide: `<h3>🌱 Semeadura de Alta Densidade</h3><p>Diferente de hortaliças maiores, a rúcula é semeada de forma densa em linhas ou a lanço. Trace pequenos sulcos rasos (máximo 0,5cm) com distância de 15cm entre eles. Distribua as sementes de forma contínua e cubra com uma camada finíssima de terra ou substrato peneirado. A germinação ocorre rapidamente, entre 3 a 5 dias. Mantenha a superfície do canteiro sempre úmida com regas em forma de neblina fina; gotas grossas de água podem desenterrar as sementes ou soterrá-las demais, impedindo o nascimento uniforme. O sucesso da rúcula depende da rapidez: quanto mais rápido ela crescer, melhor será a qualidade culinária das folhas.</p>`
        },
        {
            day: 10,
            type: 'routine',
            freq: 'weekly',
            title: 'Irrigação e Hidratação Crítica',
            desc: 'Água constante para folhas tenras.',
            guide: `<h3>💧 O Segredo da Rúcula Macia</h3><p>A rúcula é composta por quase 95% de água. Qualquer estresse hídrico, mesmo que por poucas horas de sol forte, fará com que a planta ative mecanismos de defesa, aumentando a concentração de óleos mostarda que conferem o sabor amargo excessivo e tornam a fibra da folha dura. Irrigue o canteiro pelo menos duas vezes ao dia em clima seco, garantindo que o solo nunca forme uma crosta seca na superfície. O uso de telas de sombreamento (sombrite 30%) pode ser muito benéfico em regiões quentes para manter a temperatura do solo baixa e a umidade estável, resultando em uma colheita de padrão gourmet.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Adubação de Cobertura e Nitrogênio',
            desc: 'Nutrição para crescimento explosivo.',
            guide: `<h3>✨ Turbo Verde: Suplementação de Ciclo Curto</h3><p>Como a rúcula permanece pouco tempo no campo (máximo 40 dias), ela precisa de nutrientes prontamente disponíveis. Aplique uma fertirrigação leve semanalmente usando biofertilizante líquido ou ureia diluída (10g para 10 litros de água). O Nitrogênio (N) impulsiona a expansão foliar e a síntese de proteínas. **Atenção:** Evite o excesso de adubação nitrogenada nos últimos 7 dias antes da colheita para evitar o acúmulo excessivo de nitratos nas folhas. Uma planta bem nutrida apresenta folhas de cor verde esmeralda vibrante e uma textura crocante, sendo muito mais resistente a pequenos ataques de pulgões que ocorrem nesta fase intermediária do ciclo.</p>`
        },
        {
            day: 25,
            title: 'Colheita e Ponto de Sabor',
            desc: 'Momento ideal para consumo ou venda.',
            guide: `<h3>🥗 Colheita Estratégica e Pendoamento</h3><p>A colheita da rúcula deve ocorrer preferencialmente antes da planta emitir a haste floral (pendoamento). Quando as folhas atingirem entre 15 e 20cm de altura, elas estarão no auge do sabor e da textura. Você pode optar por arrancar a planta inteira com a raiz (o que mantém o frescor por mais tempo em feiras) ou realizar o corte rente ao solo, permitindo que a planta rebrote para uma segunda colheita menor. Colha nas horas mais frescas do dia (manhã cedo) para evitar o murchamento imediato. Lembre-se: rúcula "velha" ou que já começou a florir torna-se muito fibrosa e picante ao extremo, perdendo seu valor gastronômico ideal.</p>`
        }
    ],

    // 22. Cheiro-Verde (Cebolinha + Salsa)
    cheiro_verde: [
        {
            day: -5,
            title: 'Canteiro de Ervas e Base Orgânica',
            desc: 'Preparo para temperos aromáticos.',
            guide: `<h3>🌿 Cheiro-Verde: A Dupla Dinâmica da Cozinha</h3><p>O combo de cebolinha e salsa (cheiro-verde) exige um solo extremamente rico em matéria orgânica e nitrogênio para produzir folhas macias e perfumadas. Prepare o canteiro revolvendo bem a terra e incorporando 3 a 5kg de esterco de galinha ou bovino bem curtido por metro quadrado. A calagem leve com <b>{{CALC_GM2}}g/m²</b> é recomendada se o solo for muito ácido. O segredo do cheiro-verde é o equilíbrio: ele não tolera solos encharcados que apodrecem as raízes da salsa, mas precisa de umidade constante para a cebolinha não murchar. Um solo bem adubado com <b>{{NPK_GM2}}g/m²</b> de NPK balanceado garantirá um arranque vigoroso para ambas as espécies.</p>`
        },
        {
            day: 0,
            title: 'Semeadura Direta e Espaçamento',
            desc: 'Cebolinha e Salsa no local definitivo.',
            guide: `<h3>🌱 Plantio e Germinação Estratégica</h3><p>Você pode plantar cebolinha e salsa em linhas alternadas ou juntas no mesmo canteiro. A semente da salsa é notória por ser preguiçosa, demorando de 15 a 21 dias para germinar, enquanto a cebolinha nasce em cerca de 7 dias. Semeie em sulcos rasos (0,5cm) com 20cm de distância entre as linhas. Mantenha o solo sempre úmido durante todo o processo de nascimento; se a crosta do solo secar, as sementes minúsculas não terão força para romper a superfície. Dica: Deixe as sementes de salsa de molho em água morna por 12 horas antes do plantio para acelerar o processo e garantir uma germinação mais uniforme.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Irrigação e Gestão de Umidade',
            desc: 'Água para folhas macias e vigorosas.',
            guide: `<h3>💧 Hidratação para Aromas Intensos</h3><p>O cheiro-verde consome muita água para manter suas folhas verdes e cheias de seiva. Irrigue diariamente, de preferência nas primeiras horas da manhã, garantindo que o canteiro esteja sempre úmido. A cebolinha, sendo uma hortaliça de bulbos pequenos, é muito sensível à seca. Já a salsa, se submetida a estresse hídrico, tende a pendoar (florir) precocemente, tornando as folhas duras e sem sabor. O uso de uma camada fina de cobertura morta (palhada) ajuda a manter a umidade e a biologia do solo, além de evitar que a terra suje as folhas durante as chuvas ou regas, facilitando a limpeza pós-colheita.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Adubação Orgânica e Nutrição',
            desc: 'Renovação dos nutrientes foliares.',
            guide: `<h3>🍂 Comida Natural para Sabores Autênticos</h3><p>A cada 30 dias, reforce a nutrição do canteiro. O cheiro-verde responde muito melhor a adubos orgânicos do que a químicos fortes. Aplique húmus de minhoca ou um punhado de esterco bem curtido entre as linhas, incorporando levemente à terra. Se as folhas da cebolinha começarem a ficar amareladas nas pontas, é sinal de falta de Nitrogênio ou solo compactado. A adubação orgânica garante que os óleos essenciais, responsáveis pelo aroma característico, sejam produzidos em abundância. Evite o uso de adubos clorados em excesso, pois podem alterar negativamente o sabor delicado da salsa, depreciando sua qualidade culinária.</p>`
        },
        {
            day: 40,
            type: 'routine',
            freq: 'monthly',
            title: 'Técnica de Colheita Contínua',
            desc: 'Corte e rebrota para colheita perpétua.',
            guide: `<h3>✂️ Colha Certo para Colher Sempre</h3><p>A grande vantagem do cheiro-verde é o poder de rebrota. Para colher sem matar a planta, siga a técnica: na **salsa**, retire as folhas externas cortando na base do talo, deixando o centro (olho) para continuar produzindo. Na **cebolinha**, corte as folhas 2 a 3cm acima do solo; em poucos dias, novas folhas surgirão do bulbo. Nunca arranque a planta toda a menos que queira liberar o canteiro. Com esse manejo de colheita circular e adubação mensal, você terá tempero fresco disponível por vários meses. Lembre-se de descartar folhas amareladas ou secas para manter a planta limpa e evitar o surgimento de fungos e pragas como a mosca-minadora.</p>`
        }
    ],

    // 23. Manjericão
    manjericao: [
        {
            day: 0,
            title: 'Plantio e Escolha de Local (Sol e Drenagem)',
            desc: 'Estabelecimento do Rei dos Temperos.',
            guide: `<h3>🌿 Manjericão: O Coração da Horta Mediterrânea</h3><p>O manjericão é uma planta de clima quente que exige sol pleno (mínimo de 6 horas diárias) para produzir seus óleos aromáticos em abundância. Plante em solo muito bem drenado e rico em matéria orgânica; o manjericão odeia "pés molhados" e morre rapidamente se a água acumular nas raízes. Use o espaçamento de 30cm entre as plantas. Além da matéria orgânica, incorpore uma dose equilibrada de <b>{{NPK_GM2}}g</b> de NPK para o arranque inicial. Se for plantar em vasos, garanta que o recipiente tenha furos e uma camada de pedriscos no fundo para drenagem eficiente. O aroma intenso e a cor verde vibrante são indicadores diretos de que a planta está recebendo sol e nutrição adequados.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Poda de Formação e Controle de Floração',
            desc: 'Truque para dobrar a produção de folhas.',
            guide: `<h3>✂️ O Segredo da Longevidade: Corte as Flores!</h3><p>O manjericão tem uma missão biológica única: florescer e produzir sementes. Assim que ele termina essa missão, a planta naturalmente entra em senescência (morre). Para evitar isso e dobrar sua produção de folhas, você deve realizar o "beliscamento": corte todas as hastes florais assim que começarem a surgir no topo. Isso envia um sinal hormonal para a planta continuar produzindo ramos laterais e folhas em vez de gastar energia com sementes. Uma planta podada regularmente torna-se um arbusto cheio e vigoroso, podendo durar mais de 6 meses no canteiro, enquanto uma planta que floresce fica lenhosa, perde o sabor e morre em poucas semanas.</p>`
        },
        {
            day: 20,
            type: 'routine',
            freq: 'weekly',
            title: 'Manejo Hídrico de Precisão',
            desc: 'Água na medida para evitar fungos.',
            guide: `<h3>💧 Rega Consciente e Proteção Foliar</h3><p>O manjericão é extremamente sensível a fungos de solo e foliares. O manejo da água deve ser preciso: regue sempre na base da planta, preferencialmente nas primeiras horas da manhã, evitando molhar as folhas. Folhas molhadas durante a noite são o convite perfeito para o mofo-branco e o apodrecimento. A planta deve subir para o sol e secar rapidamente. Se notar folhas murchando sob sol forte mesmo com solo úmido, é sinal de solo compactado ou drenagem ruim. O manjericão prefere regas frequentes porém de baixo volume, mantendo a umidade sem encharcamento. Uma camada de cobertura morta leve ajuda a manter as raízes frescas e protegidas da oscilação térmica.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Nutrição Orgânica para Aroma Intenso',
            desc: 'Alimentando os óleos essenciais.',
            guide: `<h3>🍂 Fertilizantes Naturais vs. Químicos</h3><p>Para temperos culinários, a nutrição orgânica é sempre superior à química. Adubos sintéticos podem acelerar o crescimento, mas muitas vezes resultam em folhas com sabor aguado e menos óleos essenciais. Aplique húmus de minhoca ou bokashi (1 colher de sopa por planta) a cada 30 dias ao redor da base. O "chá de compostagem" diluído também funciona como um excelente tônico. O Nitrogênio orgânico garante folhas verde-escuras e tenras, enquanto os micronutrientes presentes no composto estabilizam a saúde geral da planta. Se notar manchas pretas ou folhas amareladas, revise a drenagem antes de carregar no adubo, pois o excesso de comida em solo encharcado é fatal.</p>`
        },
        {
            day: 40,
            type: 'routine',
            freq: 'monthly',
            title: 'Colheita Técnica de Ramos Inteiros',
            desc: 'Momento de máximo aroma e sabor.',
            guide: `<h3>🌿 Colha Certo: O Horário da Sabedoria</h3><p>O melhor momento para colher o manjericão é pela manhã, logo após o orvalho secar e antes do calor intenso do meio-dia. É nesse horário que os óleos essenciais estão mais concentrados nas glândulas da folha. Nunca colha apenas folhas isoladas; colha ramos inteiros acima de um par de folhas laterais. Isso estimula a planta a ramificar nos pontos de corte, tornando-a ainda mais densa (efeito "hidra"). Se colher demais, a planta pode enfraquecer, então nunca retire mais de 1/3 da folhagem total de uma só vez. O manjericão colhido fresco deve ser consumido imediatamente ou guardado em um copo com água como flores; se colocado na geladeira direto, as folhas ficam pretas devido ao frio excessivo.</p>`
        }
    ],
    alecrim: [
        {
            day: 0,
            title: 'Plantio e Estratégia de Drenagem Absoluta',
            desc: 'Estabelecimento da erva do Mediterrâneo.',
            guide: `<h3>🌿 Alecrim: Sol, Vento e Solo Pobre</h3><p>O alecrim é oriundo de regiões áridas e pedregosas do Mediterrâneo, tendo evoluído para sobreviver em condições de escassez hídrica e solos pobres. O erro mais comum no plantio é usar terra muito rica e pesada. O alecrim detesta umidade excessiva nas raízes, o que causa podridão radicular fulminante. Utilize um solo arenoso ou misture areia grossa e pedriscos à terra do canteiro. O sol pleno é obrigatório (mínimo de 8 horas). Não adicione fertilizantes nitrogenados fortes; a planta prefere uma base mineral estável. Se plantar em vaso, a drenagem deve ser perfeita (muitos furos e leito de drenagem). Lembre-se: no caso do alecrim, a negligência moderada no trato é melhor que o excesso de cuidado e rega.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Manejo Hídrico Restritivo',
            desc: 'Água apenas no limite da sobrevivência.',
            guide: `<h3>💧 O Jejum de Água para Aromas Refinados</h3><p>A irrigação do alecrim deve ser feita com parcimônia extrema. Aguarde até que o solo esteja completamente seco nos primeiros 5cm de profundidade antes de regar novamente. Em períodos de inverno ou alta umidade, a planta pode passar semanas sem necessidade de rega manual. O excesso de água dilui os óleos essenciais da folha, resultando em um alecrim com pouco aroma e sabor. Se as folhas começarem a ficar cinzentas e cair, é sinal de raízes sofrendo por asfixia devido ao encharcamento. Uma planta estabelecida tem raízes profundas e lenhosas, sendo capaz de resistir a longos períodos de seca sem perder o vigor ou o perfume característico.</p>`
        },
        {
            day: 60,
            type: 'routine',
            freq: 'quarterly',
            title: 'Poda de Formação e Controle Lenhoso',
            desc: 'Modelagem do arbusto para brotação constante.',
            guide: `<h3>✂️ Modelagem e Renovação do Alecrim</h3><p>Com o passar do tempo, a base do alecrim torna-se lenhosa (madeira seca) e para de produzir folhas. Para manter o arbusto sempre jovem e produtivo, realize podas trimestrais de formação. Corte as pontas dos ramos (cerca de 1/3 do comprimento) logo acima de um par de folhas verdes. **Atenção:** Nunca corte na parte puramente lenhosa onde não há folhas verdes, pois o alecrim não tem capacidade de rebrotar de madeira velha. A poda estimula a planta a ramificar e se manter "cheia". Além disso, a poda melhora a ventilação interna do arbusto, prevenindo o surgimento de cochonilhas de carapaça, que adoram se esconder em ramos densos e abafados.</p>`
        },
        { day: 90, type: 'routine', freq: 'quarterly', title: 'Adubação Mínima de Manutenção', desc: 'Nutrição esparsa para vigor estrutural.', guide: '<h3>🍂 Menos é Mais: Nutrição de Longo Prazo</h3><p>O alecrim cresce melhor em solos de baixa fertilidade. O excesso de adubo, especialmente o Nitrogênio químico, produz um crescimento desordenado de ramos "moles" que são frágeis ao vento e ao ataque de pragas. Aplique uma pequena dose de composto orgânico muito bem maturado ou uma pitada de NPK 10-10-10 em dose mínima a cada 3 ou 4 meses apenas para manter o metabolismo basal. O alecrim prefere solos com pH ligeiramente alcalino; a adição periódica de um pouco de farinha de ossos ou casca de ovo moída fornece o Cálcio necessário sem elevar excessivamente a fertilidade do solo, mantendo a planta robusta e com aroma potente.</p>' },
        {
            day: 120,
            title: 'Colheita Medicinal e Aromática Técnica',
            desc: 'Ponto de colheita dos óleos essenciais.',
            guide: `<h3>🌿 A Colheita dos Galhos Sagrados</h3><p>A colheita do alecrim pode ser feita durante todo o ano, mas o sabor é mais potente antes da floração primaveril. Utilize tesouras de poda afiadas para colher galhos de 10 a 15cm. Evite arrancar as folhas individualmente com a mão, pois isso machuca os ramos lenhosos e pode facilitar a entrada de doenças. Colha preferencialmente em dias ensolarados, após o orvalho secar totalmente. O alecrim mantém suas propriedades mesmo após seco, diferentemente do manjericão. Se desejar secar, amarre os galhos em buquês e pendure de cabeça para baixo em local ventilado e na penumbra. O alecrim é rico em ácido rosmarínico e óleos voláteis que beneficiam a memória e a circulação sanguínea.</p>`
        }
    ],
    hortela: [
        {
            day: 0,
            title: 'Plantio e Estratégia de Contenção Radicular',
            desc: 'Como cultivar hortelã sem perder o controle.',
            guide: `<h3>🌿 Hortelã: A Invasora Generosa</h3><p>A hortelã é uma das ervas mais fáceis de cultivar, mas seu comportamento é agressivo e invasivo devido aos rizomas subterrâneos (estolões) que se espalham rapidamente por todo o jardim. O segredo do sucesso é o plantio em vasos individuais ou canteiros isolados por barreiras físicas profundas (como tubos de concreto ou plásticos resistentes). A hortelã ama solos ricos, pretos e com muita matéria orgânica. Diferente do alecrim, ela tolera e até prefere locais de meia-sombra, onde o sol direto não queime suas folhas sensíveis. Incorpore esterco curtido e húmus de minhoca em abundância; a nutrição inicial é o que garantirá folhas grandes e um aroma refrescante inigualável.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Irrigação Abundante e Gestão Hídrica',
            desc: 'Água constante para um frescor intenso.',
            guide: `<h3>💧 Hortelã: Sede Insaciável por Umidade</h3><p>A hortelã é originária de zonas ripárias (beiras de riachos) e, por isso, exige um solo sempre úmido. Se a terra secar totalmente por um único dia de verão, as folhas murcharão e a planta sofrerá um estresse que pode reduzir seu vigor por semanas. Irrigue diariamente, de preferência nas horas mais frescas. O solo deve estar sempre com aspecto de esponja úmida, mas nunca com água parada que possa atrair larvas de mosca. Em vasos, o uso de pratos com pedriscos úmidos ajuda a manter a umidade relativa do ar próxima à folhagem, o que expande a produção de folhas novas e mantém os óleos essenciais (mentol) em níveis máximos de concentração.</p>`
        },
        {
            day: 20,
            type: 'routine',
            freq: 'weekly',
            title: 'Poda de Manejo e Controle de Expansão',
            desc: 'Corte agressivo para renovação constante.',
            guide: `<h3>✂️ A Arte do Rejuvenescimento pela Poda</h3><p>A hortelã responde de forma espetacular à poda agressiva. Quanto mais você corta, mais ela ramifica e produz folhas novas e tenras. Sem poda, os ramos ficam longos, caídos e as folhas perdem o vigor. Toda semana, corte as pontas dos ramos para estimular o crescimento lateral. Fique atento também aos rebentos que tentam escapar da contenção (estolões rasteiros); remova-os imediatamente. A poda também serve para eliminar partes da planta que comecem a florescer, pois a florada reduz o aroma das folhas. No final do outono, você pode realizar uma "poda drástica", cortando toda a massa verde rente ao solo; os rizomas subterrâneos garantirão um renascimento explosivo na primavera seguinte.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Adubação Nitrogenada de Reposição',
            desc: 'Nitrogênio líquido para massa foliar.',
            guide: `<h3>✨ Combustível Verde: Nutrição Mensal</h3><p>Para manter uma produção de massa verde ininterrupta, a hortelã consome muito Nitrogênio. A cada 30 dias, reponha os nutrientes aplicando uma dose de esterco líquido ou adubo NPK 10-10-10 dissolvido em água. O Nitrogênio é o responsável direto pela cor verde escura e pela textura suculenta da folha. Como colhemos a parte vegetativa constantemente, a planta vive em um estado de "eterna juventude" que demanda suporte nutricional. Se notar que as folhas centrais estão ficando amareladas ou pequenas demais, é um sinal claro de exaustão do solo. Em vasos pequenos, a troca total da terra a cada 6 meses (ou adubação pesada com húmus) é necessária para evitar a compactação radicular.</p>`
        },
        {
            day: 40,
            type: 'routine',
            freq: 'monthly',
            title: 'Colheita Aromática em Grande Escala',
            desc: 'Corte técnico para chás e óleos.',
            guide: `<h3>🌿 Colheita e Curadoria de Aromas</h3><p>Colha a hortelã preferencialmente no início da manhã, quando a planta está túrgida e os óleos essenciais estão no pico. Corte ramos inteiros (10-15cm) em vez de arrancar folhas soltas. A colheita frequente é o melhor método de manejo para evitar que a planta fique velha e lenhosa. Para uso em chá, colha os ramos e use-os frescos ou seque-os em local sombreado e ventilado para preservar o mentol. A hortelã é conhecida por suas propriedades digestivas e refrescantes. Mantenha os canteiros livres de ervas daninhas, pois a hortelã compete mal por luz rasa, perdendo espaço para gramíneas se não for protegida pelo criador. O sucesso da hortelã está na mão de quem não tem medo de usar o facão!</p>`
        }
    ],

    // 24. Pimentão
    pimentao: [
        {
            day: 0,
            title: 'Transplante e Adubação de Base Potássica',
            desc: 'Início cuidadoso da cultura do pimentão.',
            guide: `<h3>🫑 Pimentão: O Primo Exigente do Tomate</h3><p>O pimentão exige solos de alta fertilidade e, acima de tudo, equilíbrio térmico. Realize o transplante das mudas sadias preferencialmente ao final da tarde para evitar o estres de murchamento. Na cova, aplique <b>{{NPK_GM2}}g</b> de adubo NPK rico em Fósforo para o desenvolvimento radicular. O pimentão é muito sensível ao frio e ao encharcamento. Prepare canteiros elevados e garanta uma drenagem impecável. Se o solo for ácido, o pimentão apresentará deficiência de Cálcio, resultando em frutos com manchas necróticas. O uso de cobertura morta é fundamental para manter a temperatura do solo estável e proteger o sistema radicular sensível desta cultura mediterrânea.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Adubação de Cobertura Nitrogenada',
            desc: 'Impulso vegetativo e formação foliar.',
            guide: `<h3>✨ Construindo a Fábrica Verde</h3><p>Nesta fase de crescimento acelerado, o pimentão demanda Nitrogênio para formar uma estrutura de galhos forte o suficiente para suportar o peso dos frutos futuros. Aplique semanalmente uma dose leve de ureia ou esterco líquido bem curtido ao redor da planta, tomando extremo cuidado para não encostar o adubo no caule delicado. O Nitrogênio garante folhas largas e verdes que protegerão os frutos da queima solar. Se a planta apresentar um crescimento muito lento e folhas pálidas, reforce a nutrição orgânica com húmus de minhoca. Lembre-se que o pimentão "come" pouco mas constantemente, preferindo doses pequenas e frequentes de nutrientes.</p>`
        },
        {
            day: 30,
            title: 'Tutoramento e Proteção Física',
            desc: 'Suporte para galhos quebradiços.',
            guide: `<h3>🪵 Sustentação e Manejo de Luz Solar</h3><p>Os galhos do pimentão são extremamente frágeis e quebram com facilidade sob o peso dos frutos ou pela ação do vento. O tutoramento com estacas ou fitilhos é obrigatório para manter a planta vertical e arejada. **Dica Crítica:** Ao contrário do tomate, não remova as folhas que cobrem os frutos. O pimentão é muito sensível à insolação direta nos frutos; a insolação causa manchas brancas de "queima de sol" que apodrecem o pimentão antes da colheita. Amarre o caule principal com folga e use estacas de apoio lateral. O equilíbrio entre ventilação (para evitar fungos) e sombreamento foliar (para proteger os frutos) é o segredo do produtor de elite.</p>`
        },
        {
            day: 45,
            type: 'routine',
            freq: 'weekly',
            title: 'Controle de Pragas Sugadoras',
            desc: 'Vigilância contra pulgões e ácaros.',
            guide: `<h3>🐛 Defesa Ativa Contra Invasores</h3><p>Pimentões são ímãs para pulgões, ácaros e mosca branca, que transmitem viroses letais para a planta. Monitore semanalmente o verso das folhas novas. Ao notar a presença de insetos ou folhas começando a encarquilhar (enrolar), aplique óleo de neem ou extrato de fumo no final da tarde. Ácaros, em particular, adoram clima seco e calor; eles travam o crescimento do ponteiro da planta. A aplicação preventiva de enxofre pautável pode ajudar no controle de ácaros e também funciona como nutriente. Uma planta bem nutrida e hidratada é muito menos atraente para as pragas, pois possui tecidos mais firmes e mecanismos de defesa química ativos.</p>`
        },
        {
            day: 60,
            title: 'Adubação de Frutificação (Potássio)',
            desc: 'Qualidade, espessura e doçura do fruto.',
            guide: `<h3>🫑 Doçura e Parede Grossa: O Papel do Potássio</h3><p>Com o surgimento das primeiras flores e frutos, a demanda por Potássio (K) dispara. O Potássio é o nutriente responsável por "encher" o pimentão, garantindo paredes grossas, suculentas e o brilho intenso da casca. Utilize uma fórmula NPK rica em K e micronutrientes como o Boro e o Zinco, essenciais para evitar o abortamento de flores. Aplique a adubação em solo úmido e incorpore levemente. Evite o excesso de Nitrogênio nesta fase, pois isso faria a planta abortar os frutos para continuar produzindo apenas folhas. A colheita deve ser feita com tesoura para não machucar os galhos quebradiços da planta-mãe.</p>`
        }
    ],

    // 25. Pepino
    pepino: [
        {
            day: 0,
            title: 'Semeadura Direta e Adubação de Cova',
            desc: 'Início do ciclo explosivo do pepino.',
            guide: `<h3>🥒 Pepino: Crescimento Ultra-Rápido</h3><p>O pepino é uma das culturas de ciclo mais curto, podendo iniciar a colheita em apenas 45 a 50 dias. Semeie diretamente no local definitivo em covas ricas em matéria orgânica e fósforo. Coloque 3 sementes por cova a 2cm de profundidade e, após o nascimento, mantenha apenas a planta mais forte. O pepino exige solos soltos e muito férteis. Incorpore <b>{{NPK_GM2}}g</b> de NPK balanceado na cova, misturando bem com a terra. Como a planta cresce quase milímetros por hora, qualquer deficiência nutricional inicial atrasará todo o ciclo. Garanta que o local receba sol pleno durante todo o dia para evitar o estiramento (estiolamento) das ramas.</p>`
        },
        {
            day: 10,
            type: 'routine',
            freq: 'weekly',
            title: 'Irrigação Frequente e Gestão de Amargor',
            desc: 'Água constante para frutos suculentos.',
            guide: `<h3>💧 O Segredo do Pepino Doce: Hidratação Total</h3><p>O pepino é composto por mais de 95% de água. Se o solo secar por algumas horas durante o dia, a planta produzirá substâncias amargas (cucurbitacinas) como mecanismo de defesa, tornando os frutos intragáveis. Irrigue diariamente na base da planta, preferencialmente por gotejamento, evitando molhar as folhas para não favorecer doenças fúngicas. O solo deve estar sempre úmido como uma esponja bem espremida. O uso de cobertura morta (palhada) ajuda a estabilizar a umidade e a temperatura das raízes, que são superficiais e muito sensíveis ao calor excessivo. Pepino com sede é pepino amargo e torto.</p>`
        },
        {
            day: 20,
            title: 'Condução Vertical e Desbrota Inicial',
            desc: 'Suporte para frutos limpos e retos.',
            guide: `<h3>🕸️ Verticalizando a Produção: Redes e Tutores</h3><p>Cultivar pepino no chão atrai doenças fúngicas e faz com que os frutos fiquem manchados e tortos. Conduza as ramas verticalmente usando redes de tutoramento, cercas ou fitilhos. Realize a desbrota dos ramos laterais até o quarto ou quinto nó (perto do chão); isso melhora a ventilação da base da planta e evita o ataque de fungos radiculares. Ajude as gavinhas a encontrarem o suporte. A condução vertical facilita imensamente a colheita e a aplicação de tratamentos preventivos, além de garantir que os frutos cresçam retos e uniformes por gravidade, aumentando seu valor estético e comercial.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'weekly',
            title: 'Vigilância Contra Oídio e Míldio',
            desc: 'Proteção contra o "Pó Branco".',
            guide: `<h3>⚪ Guerra Contra os Fungos de Folha</h3><p>O pepino é extremamente vulnerável a ataques de Oídio (aquele pó branco nas folhas) e Míldio (manchas amareladas). Essas doenças destroem a área de fotossíntese rapidamente se o clima estiver úmido e quente. Use soluções preventivas como leite cru diluído (10% em água) ou calda bordalesa no final da tarde. Melhore a ventilação removendo folhas velhas ou doentes da base. A nutrição equilibrada com Potássio e Cálcio fortalece as paredes celulares das folhas, dificultando a entrada dos fungos. Uma planta doente para de produzir frutos doces e morre prematuramente, interrompendo a colheita que poderia durar várias semanas.</p>`
        },
        {
            day: 45,
            type: 'routine',
            freq: 'daily',
            title: 'Colheita Frequente e Estímulo Produtivo',
            desc: 'Colher para produzir continuamente.',
            guide: `<h3>🥒 Colheita Diária: O Segredo da Abundância</h3><p>O pepino deve ser colhido quase diariamente. Quanto mais você colhe, mais a planta entende que deve continuar produzindo novas flores e frutos. Se você deixar um pepino ficar gigante e seco no pé, a planta parará de produzir novos frutos para focar a energia na maturação das sementes daquele fruto velho. Colha os frutos ainda jovens, quando a casca estiver brilhante e firme. Use sempre uma tesoura de colheita para não tracionar e machucar as ramas delicadas. Pepinos colhidos pequenos são muito mais crocantes, suculentos e possuem sementes imperceptíveis, sendo ideais para saladas de alta gastronomia.</p>`
        }
    ],

    // 26. Quiabo
    quiabo: [
        {
            day: 0,
            title: 'Plantio e Estratégia Térmica Solar',
            desc: 'Acordando as sementes para o sol.',
            guide: `<h3>☀️ Quiabo: O Filho do Sol e do Calor</h3><p>O quiabo é uma cultura rústica que exige altas temperaturas para se desenvolver. Não adianta plantar quiabo no frio intenso, pois a semente não germinará. **Dica de Mestre:** As sementes de quiabo possuem uma casca muito dura e impermeável. Para acelerar o nascimento, deixe as sementes de molho em água morna (não quente!) por 12 a 24 horas antes do plantio. Semeie em covas ricas em matéria orgânica com espaçamento de 1m entre linhas. O quiabo se adapta bem a solos mais pobres, mas responde de forma explosiva a uma boa adubação de base com NPK balanceado. Garanta que o local receba sol pleno o dia todo; quiabo na sombra produz pouco e fica raquítico.</p>`
        },
        {
            day: 20,
            title: 'Desbaste e Limpeza de Canteiro',
            desc: 'Garantindo vigor para a planta principal.',
            guide: `<h3>✂️ Gestão de Vigor e Controle de Mato</h3><p>Cerca de 20 dias após a germinação, realize o desbaste: mantenha apenas a planta mais forte e central de cada cova. O quiabo torna-se um arbusto lenhoso e grande, e a competição entre duas plantas na mesma cova resultará em produções medíocres para ambas. Mantenha o pé da planta sempre limpo, removendo as ervas daninhas manualmente. Como o quiabo tem um sistema radicular profundo e vigoroso, ele aguenta períodos curtos de seca, mas a limpeza inicial é fundamental para que ele domine o espaço e não perca nutrientes para o mato. A amontoa (chegar terra no pé) ajuda a firmar a planta contra o vento.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Adubação de Cobertura e Renovação Orgânica',
            desc: 'Energia para produção de longo prazo.',
            guide: `<h3>✨ Vigor Continuado: A Dieta do Quiabeiro</h3><p>O quiabeiro é capaz de produzir por muitos meses se receber nutrição constante. Aplique mensalmente uma cobertura rica em Nitrogênio e matéria orgânica ao redor de cada planta. O esterco bovino curtido ou a cama de frango são excelentes para manter a biologia do solo ativa. O Nitrogênio garante o surgimento de novas ramificações laterais, que serão os locais de futuras flores. Se as folhas começarem a apresentar manchas amarelas ou crescimento estagnado, reforce a adubação de cobertura. Uma planta bem alimentada atinge facilmente os 2 metros de altura e produz quiabos de cor verde intensa e textura crocante durante todo o verão e outono.</p>`
        },
        {
            day: 45,
            type: 'routine',
            freq: 'daily',
            title: 'Colheita Diária e Ponto de Fibras',
            desc: 'O tempo é o maior inimigo da qualidade.',
            guide: `<h3>🔪 O Ponto de Ouro: Colha Antes da Fibra</h3><p>O quiabo cresce em velocidade impressionante. O fruto passa do ponto ideal para o "ponto de pau" (fibroso e duro) em questão de horas. Realize a colheita pelo menos a cada dois dias. **O Teste:** Tente quebrar a pontinha do quiabo com os dedos; se estalar suavemente, está no ponto; se dobrar sem quebrar, já está fibroso e deve ser descartado. Colher os quiabos jovens estimula a planta a continuar produzindo flores. Se você deixar frutos velhos no pé, a planta entenderá que já "cumpriu sua missão" de produzir sementes e entrará em declínio produtivo. Use luvas, pois os pelos dos talos podem causar irritação na pele de algumas pessoas.</p>`
        },
        {
            day: 90,
            title: 'Poda de Renovação e Rejuvenescimento',
            desc: 'Truque para estender a vida útil da lavoura.',
            guide: `<h3>✂️ Rejuvenescendo a Planta Alta</h3><p>Se as plantas de quiabo ficarem altas demais para a colheita ou começarem a produzir frutos pequenos e deformados, você pode realizar uma poda de renovação. Corte a haste principal a cerca de 60cm do solo após uma colheita completa. Isso forçará a planta a emitir novos brotos vigorosos na base, que iniciarão um novo ciclo produtivo em poucas semanas. Combine esta poda com uma adubação pesada de cobertura e irrigação abundante. Esta técnica permite que um mesmo plantio produza o dobro do tempo normal, economizando o trabalho de um novo preparo de solo e semeadura. O quiabo é a prova de que a poda estratégica vence o envelhecimento biológico.</p>`
        }
    ],

    // 27. Abóbora/Melancia
    abobora: [
        {
            day: 0,
            title: 'Semeando as Gigantes: Espaço e Nutrição',
            desc: 'Ocupando o território com abóboras.',
            guide: `<h3>🎃 Abóbora: A Conquistadora de Espaço</h3><p>As abóboras (morangas, cabotiás ou abóboras-de-leite) exigem grandes áreas para se espalharem, com ramas que podem atingir 5 a 10 metros de comprimento. Prepare covas amplas, separadas por 3 a 4 metros, e incorpore quantidades massivas de matéria orgânica (esterco bovino ou composto). **O Segredo:** Toda a adubação química deve ser concentrada na cova, onde a raiz principal está instalada; use <b>{{NPK_GM2}}g</b> de NPK balanceado. A abóbora tem "fome" de nutrientes e sede de água. Monitore a drenagem, pois embora goste de umidade, o excesso de barro no pé da cova pode causar a morte súbita por fungos de solo (Phytophthora). Solo fértil e profundo garantirá abóboras pesadas e com casca resistente.</p>`
        },
        {
            day: 20,
            type: 'routine',
            freq: 'weekly',
            title: 'Irrigação de Base e Gestão Foliar',
            desc: 'Água para manter as grandes folhas vivas.',
            guide: `<h3>💧 Hidratação de Grandes Superfícies</h3><p>As folhas gigantes da abóbora transpiram uma quantidade enorme de água, especialmente nas horas de sol intenso. Irrigue as covas abundantemente duas a três vezes por semana em clima seco. **Atenção:** Evite molhar a folhagem durante as regas para prevenir o Oídio (pó branco), que é a principal doença das cucurbitáceas. Use gotejamento ou regue diretamente no solo, em torno do caule principal. Se as folhas "murcharem" ao meio-dia mas recuperarem o vigor ao entardecer, é um mecanismo natural de defesa térmica da planta, mas fique atento se o solo estiver excessivamente seco, o que pode abortar os primeiros frutos em formação.</p>`
        },
        {
            day: 40,
            title: 'Penteado das Ramas e Gestão das Abelhas',
            desc: 'Organização do crescimento e polinização.',
            guide: `<h3>🌿 Direcionando a Vida no Campo</h3><p>Conforme as ramas crescem, realize o "penteado": direcione-as para dentro da área de plantio, mantendo-as longe de estradas ou áreas de trânsito. Isso protege as hastes e frutos da quebra. **A Ciência da Fruta:** Sabia que abóboras têm flores macho e fêmea separadas e precisam de abelhas para a polinização? Nunca utilize inseticidas químicos durante as manhãs, que é o horário de maior atividade dos polinizadores. Se observar poucas abelhas, você pode realizar a polinização manual: pegue uma flor macho (sem a bolinha na base), retire as pétalas e esfregue o pólen no estigma da flor fêmea (que tem uma pequena abóbora miniatura na base). Sem polinização, a "abobrinha" amarela e cai sem crescer.</p>`
        },
        {
            day: 60,
            type: 'routine',
            freq: 'monthly',
            title: 'Monitoramento de Brocas de Rama',
            desc: 'Defesa contra o inimigo interno.',
            guide: `<h3>🐛 O Perigo Silencioso dentro do Caule</h3><p>A broca-das-cucurbitáceas é uma lagarta que perfura a rama da abóbora e se alimenta dos tecidos internos, bloqueando o fluxo de seiva e matando partes inteiras da planta ou até a cova inteira. Inspecione as ramas semanalmente em busca de orifícios com resto de "serragem" (excrementos do inseto). Se encontrar, você pode tentar a remoção manual ou injetar uma solução biológica de Bacillus thuringiensis no local. Manter a planta bem nutrida com Potássio endurece as cascas das ramas, dificultando a entrada da praga. Evite deixar frutos feridos ou restos de poda expostos, pois o cheiro atrai a mariposa que deposita os ovos desta praga devastadora.</p>`
        },
        {
            day: 90,
            title: 'Colheita Técnica e Cura ao Sol',
            desc: 'Momento de colher e preparar para guardar.',
            guide: `<h3>🎃 Ponto de Colheita e Armazenamento Secular</h3><p>Como saber se a abóbora está pronta sem cortá-la? O sinal mais claro é o talo (pedúnculo): ele deve estar seco, marrom e com aspecto "corticoso" (como cortiça). Além disso, a casca deve estar tão dura que você não consiga marcá-la com a unha. Colha mantendo um pedaço do talo preso ao fruto (isso evita a entrada de podridão). **A Cura:** Após colher, deixe as abóboras no sol por 3 a 5 dias para o processo de cura; o sol termina de endurecer a casca e concentra os açúcares. Abóboras bem curadas podem durar de 4 a 6 meses em local fresco e seco, sendo um verdadeiro "estoque de energia" para a fazenda durante a entressafra.</p>`
        }
    ],
    melancia: [
        {
            day: 0,
            title: 'Semeando o Doce de Verão',
            desc: 'O desafio da melancia no campo.',
            guide: `<h3>🍉 Melancia: Delicada e Exigente em Cálcio</h3><p>A melancia é considerada a mais sensível de todas as cucurbitáceas. Ela exige calor intenso, baixa umidade nas folhas e um solo quimicamente equilibrado. O principal problema é a falta de Cálcio e Boro, que causa frutos com o fundo preto ou rachaduras internas ("coração vazio"). Aplique <b>{{CALC_GM2}}g/m²</b> de calcário semanas antes e adicione <b>{{NPK_GM2}}g</b> de adubo NPK rico em Potássio na cova. Semeie 3 a 4 sementes por cova com espaçamento de 2x2m. A melancia prefere solos leves e arenosos que esquentam rápido. Garanta que a drenagem seja perfeita, pois as raízes da melancia apodrecem se ficarem em solo frio e encharcado por mais de 24 horas.</p>`
        },
        {
            day: 20,
            type: 'routine',
            freq: 'weekly',
            title: 'Irrigação Cirúrgica e Manejo de Umidade',
            desc: 'Água sem doenças fúngicas.',
            guide: `<h3>💧 O Dilema da Água: Raízes Molhadas, Folhas Secas</h3><p>Diferente da maioria das plantas, a melancia odeia ter suas folhas molhadas. A umidade foliar é a porta de entrada para o Antracnose e o Míldio, que devastam a lavoura em dias úmidos. Utilize irrigação por gotejamento ou crie sulcos ao redor das covas (montinhos) para que a água nunca toque no caule ou nas folhas. Irrigue preferencialmente pela manhã para que qualquer respingo seque sob o sol. O solo deve estar úmido durante a fase de crescimento do fruto, mas as regas devem ser reduzidas drasticamente nos últimos 15 dias antes da colheita; o estresse hídrico final concentra os açúcares, garantindo frutos muito mais doces e saborosos.</p>`
        },
        {
            day: 45,
            title: 'Raleio de Frutos e Gestão da Qualidade',
            desc: 'Limitando a produção para obter tamanho.',
            guide: `<h3>✂️ "Menos é Mais": A Seleção da Campeã</h3><p>Se você deixar que uma única planta de melancia carregue todos os frutos que produzir, você colherá muitas melancias pequenas e com pouco açúcar. Para obter frutos de padrão comercial (grandes e doces), realize o raleio: mantenha apenas 2 ou 3 frutos por planta, os mais bem formados e localizados. Retire os frutos tortos ou pequenos demais. Nesta fase, as folhas devem proteger o fruto do sol direto; o sol excessivo pode "cozinhar" a polpa por dentro antes do tempo. Mantenha a rama saudável para que as folhas ajam como painéis solares fornecendo energia para o fruto campeão. O equilíbrio nutricional com Potássio é vital agora para a espessura da casca e transporte de açúcar.</p>`
        },
        {
            day: 60,
            title: 'Virada dos Frutos e Proteção de Casca',
            desc: 'Uniformizando a cor e evitando manchas.',
            guide: `<h3>🍉 Fruta com Cor de Cinema: A Virada Manual</h3><p>Conforme a melancia cresce, a parte que fica em contato com o solo tende a ficar amarelada ou branca devido à falta de luz e excesso de umidade do chão. Vire os frutos com extremo cuidado (para não quebrar a rama) a cada 15 dias. Isso garante que todo o fruto receba radiação solar e que a casca cure de forma uniforme. Além disso, coloque uma camada de palha seca ou um pedaço de telha/madeira embaixo do fruto para evitar o contato direto com a terra úmida, o que previne ataques de insetos de solo e podridão. Fruto limpo e com cor uniforme tem valor de mercado superior e casca mais resistente ao transporte.</p>`
        },
        {
            day: 90,
            title: 'O Teste da Maturação: Som e Gavinha',
            desc: 'Como saber se está madura sem abrir.',
            guide: `<h3>🍉 Está Madura? Os Sinais de Ouro do Produtor</h3><p>Colher melancia verde é o maior erro do iniciante, pois ela não amadurece depois de colhida. Use os três sinais clássicos: 1. **A Gavinha:** Aquela mola (cipozinho) que fica no ponto de inserção do fruto na rama deve estar totalmente SECA e marrom. 2. **O Tapinha:** Dê um tapa seco no fruto; se o som for agudo ("metálico"), está verde; se o som for grave e "oco", está madura. 3. **O Fundo:** A mancha de encosto (onde ela encosta no chão) deve estar AMARELA e não branca. Colha com tesoura mantendo 5cm de talo. Melancia madura tem peso desproporcional ao tamanho e emite um aroma doce suave próximo ao pedúnculo.</p>`
        }
    ],

    // 28. Morango
    morango: [
        {
            day: -15,
            title: 'Canteiro Elevado e Estratégia de Mulching',
            desc: 'Proteção física contra doenças de solo.',
            guide: `<h3>🍓 Morango: Técnica da Cama de Lorde</h3><p>O morango é uma das frutas mais sensíveis ao contato direto com o solo úmido, que apodrece os frutos em poucos dias. O preparo do canteiro deve ser impecável: faça leiras altas (30cm) e cubra-as com plástico preto (mulching) ou uma camada espessa de palhada seca. O mulching mantém a umidade, controla ervas daninhas e garante que os frutos fiquem limpos e sadios. Antes de cobrir, incorpore <b>{{NPK_GM2}}g/m²</b> de NPK e esterco de galinha bem curtido. Esta base nutricional fornecerá o Fósforo necessário para um enraizamento profundo antes do início das florações constantes.</p>`
        },
        {
            day: 0,
            title: 'Plantio Técnico e Gestão da Coroa',
            desc: 'Posicionamento vital da muda.',
            guide: `<h3>🌱 O Segredo da Coroa: Nem Funda, Nem Rasa</h3><p>O erro mais fatal no plantio do morango é enterrar a "coroa" (o ponto central de onde saem as folhas). Se a coroa for enterrada, a planta apodrecerá com a umidade; se ficar muito exposta, as raízes secarão. Plante preferencialmente no final da tarde, garantindo que a base das raízes esteja mergulhada na terra mas o "miolo" da planta esteja visível acima da superfície. Use o espaçamento de 30cm entre plantas em zigue-zague. Regue imediatamente após o plantio para assentar a terra ao redor das raízes, evitando bolsas de ar que podem causar a morte prematura da muda por desidratação.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Vigilância Contra Ácaros e Mofos',
            desc: 'Controle sanitário preventivo.',
            guide: `<h3>🐛 Defesa Ativa no Morangueiro</h3><p>O morango é o alvo favorito de ácaros-rajados e do mofo cinzento (Botrytis). Os ácaros são microscópicos e fazem a folha ficar dura, quebradiça e com aspecto bronzeado, travando o crescimento. Inspecione o verso das folhas semanalmente; ao primeiro sinal, aplique óleo de neem ou enxofre pautável no final do dia. Para evitar mofos, mantenha o canteiro bem ventilado e remova qualquer folha ou fruto que apresente sinais de podridão. A higiene do canteiro é sua melhor ferramenta defensiva: uma planta limpa e com boa circulação de ar produzirá frutos muito mais brilhantes e duráveis.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'weekly',
            title: 'Poda de Limpeza e Manejo de Estolões',
            desc: 'Direcionando energia para os frutos.',
            guide: `<h3>✂️ "Tira-Tudo": A Limpeza do Vigor</h3><p>O morangueiro solta ramos longos rasteiros chamados "estolões" para fazer clones de si mesmo. Se você quer colher morangos grandes, corte todos os estolões assim que surgirem! Eles roubam a energia que deveria ir para os frutos. Além disso, remova as primeiras flores que surgirem nos primeiros 30 dias; isso força a planta a ficar mais robusta e criar raízes fortes antes de começar a produzir seriamente. Remova também as folhas velhas de baixo que estiverem avermelhadas ou secas. Este manejo de poda constante mantém a planta "jovem" e focada 100% na qualidade dos morangos.</p>`
        },
        {
            day: 45,
            type: 'routine',
            freq: 'weekly',
            title: 'Fertirrigação e Suplementação de Potássio',
            desc: 'Doçura e firmeza do fruto.',
            guide: `<h3>✨ Nutrição Líquida para Frutos Gourmet</h3><p>À medida que os frutos começam a crescer, a demanda por Potássio (K) torna-se crítica para garantir o sabor doce e a resistência da polpa. O morango responde de forma espetacular à fertirrigação ou adubação foliar semanal. Use fórmulas ricas em K e micronutrientes para evitar deformações nos frutos. Aplique doses pequenas mas frequentes (pouco e sempre). O Cálcio também é fundamental nesta fase para dar "tempo de prateleira" ao fruto, evitando que ele amoleça rápido demais após a colheita. Frutos bem nutridos apresentam cor vermelha rubi profunda e um aroma que invade o ambiente.</p>`
        },
        {
            day: 60,
            type: 'routine',
            freq: 'daily',
            title: 'Colheita e Cura Térmica Matinal',
            desc: 'O ápice da qualidade.',
            guide: `<h3>🍓 Colheita Diária e Manejo de Frescor</h3><p>O morango não amadurece após ser retirado da planta, portanto colha apenas quando estiverem totalmente vermelhos e brilhantes. O melhor horário é pela manhã bem cedo, quando os frutos ainda estão frios do orvalho; isso aumenta significativamente a durabilidade. Use uma tesoura afiada para cortar o pedúnculo (talo), mantendo cerca de 1cm de cabo preso ao morango; nunca puxe o fruto com a mão, pois a pele é extremamente frágil e qualquer pressão causa hematomas que apodrecem o fruto. Coloque-os delicadamente em caixas rasas. Morangos frescos colhidos no ponto certo têm um equilíbrio perfeito entre acidez e doçura.</p>`
        }
    ],

    // 29. Raízes Específicas
    beterraba: [
        {
            day: 0,
            title: 'Semeadura e Estratégia de Micronutrientes',
            desc: 'Iniciando o crescimento da raiz púrpura.',
            guide: `<h3>🌱 Beterraba: Uma Semente, Muitas Vida</h3><p>A "semente" da beterraba é na verdade um pequeno glomérulo que contém de 2 a 4 sementes reais. Semeie diretamente em solo bem destorroado e leve, com profundidade de 1cm. **Dica Crítica:** A beterraba é faminta por Boro (B). A falta deste micronutriente causa o "coração preto", uma mancha necrótica no centro da raiz que a torna dura e amarga. Aplique uma dose mínima de bórax ou fertilizante com Boro na base. Além disso, a calagem com <b>{{CALC_GM2}}g/m²</b> é fundamental, pois a beterraba odeia solos ácidos. Solo corrigido e rico em Potássio garantirá raízes lisas, doces e de cor rubi intensa para suas saladas.</p>`
        },
        {
            day: 10,
            type: 'routine',
            freq: 'weekly',
            title: 'Irrigação e Gestão de Fibrosidade',
            desc: 'Água constante para textura macia.',
            guide: `<h3>💧 Raiz Macia e Hidratada</h3><p>A beterraba acumula açúcares e água na raiz. Se o solo sofrer períodos de seca seguidos por regas pesadas, a raiz pode rachar ou ficar extremamente fibrosa ("lenhosa"). Mantenha o canteiro sempre úmido, mas nunca encharcado, através de regas regulares e leves. O uso de cobertura morta fina ajuda a manter a temperatura da raiz estável. Regas eficientes garantem que as folhas cresçam vigorosas (e elas também são comestíveis e deliciosas, ricas em ferro!). Se notar murchamento nas horas de calor, aumente a frequência de irrigação para garantir que a planta nunca entre em estresse de sobrevivência.</p>`
        },
        {
            day: 25,
            title: 'Desbaste Técnico e Espaçamento',
            desc: 'Dando espaço para o crescimento radial.',
            guide: `<h3>✂️ Um Corpo, Um Lugar: A Seleção Final</h3><p>Como nascem várias plantas no mesmo local (devido ao glomérulo), o desbaste é obrigatório quando as mudinhas atingirem 5cm. Deixe apenas a planta mais forte a cada 10cm de distância. **Aviso:** Não tente transplantar as mudas que você arrancou; a raiz pivotante da beterraba é muito sensível e, se for dobrada no transplante, a beterraba crescerá torta e pequena. As plantas removidas no desbaste podem ser usadas em saladas (baby beets). O espaçamento correto garante que cada beterraba tenha luz e nutrientes suficientes para atingir o formato redondo perfeito sem competir com as vizinhas.</p>`
        },
        {
            day: 40,
            type: 'routine',
            freq: 'monthly',
            title: 'Adubação de Cobertura e Força Foliar',
            desc: 'Nutrição para enchimento de raiz.',
            guide: `<h3>✨ Combustível para a Raiz: Nutrição e Vigor</h3><p>Aos 40 dias, a planta inicia o processo intensivo de translocação de energia das folhas para a raiz. Aplique uma cobertura de NPK balanceado ou esterco líquido bem curtido. O Nitrogênio deve ser moderado para não estimular apenas folhas; o foco agora deve ser o Potássio (K). O Potássio é o "transportador" de açúcar da folha para a beterraba. Se notar as folhas muito pálidas ou amareladas, a planta pode estar com carência de Nitrogênio ou Magnésio. Uma planta com folhagem verde-escura e talos roxos vibrantes é sinal de saúde plena e promessa de uma colheita doce e abundante.</p>`
        },
        {
            day: 70,
            title: 'Colheita e Ponto de Sabor Gourmet',
            desc: 'Evitando o excesso de maturação.',
            guide: `<h3>🥗 Tamanho é Documento: Colha no Ponto</h3><p>Diferente de outras raízes, a beterraba não deve ficar gigante no canteiro. Raízes muito grandes (maiores que uma bola de tênis) tendem a acumular fibras duras e perdem o sabor adocicado, tornando-se "terrosas" demais. O ponto ideal é quando atingem de 5 a 8cm de diâmetro. Colha puxando suavemente pela base das folhas ou use um pequeno enxadinho para soltar a terra lateral. Após a colheita, corte as folhas mantendo 2cm de talo (não corte rente à raiz para não "sangrar" e perder a cor durante o cozimento). Beterrabas colhidas jovens e frescas têm a casca fina e a polpa extremamente suculenta.</p>`
        }
    ],
    batata_doce: [
        {
            day: 0,
            title: 'Plantio de Ramas em Leiras Elevadas',
            desc: 'Estratégia de drenagem e espaço radicular.',
            guide: `<h3>🍠 Batata-Doce: Plantando o Sucesso em Ramas</h3><p>A batata-doce é uma cultura rústica e extremamente produtiva, mas seu plantio exige técnica: não se planta a batata, mas sim os pedaços de ramas (pontas com 30-40cm). O preparo do solo deve ser feito com camalhões ou leiras altas (30-40cm de altura) de terra bem fofa e adubada com <b>{{NPK_GM2}}g/m²</b> de NPK rico em Potássio. O Potássio é vital para o engrossamento das raízes tuberosas. Enterre o meio da rama horizontalmente, deixando as pontas com folhas para fora. Esse método favorece a ramificação das raízes em toda a extensão enterrada, produzindo muito mais batatas por planta do que o plantio vertical.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Limpeza de Canteiro e Amontoa Inicial',
            desc: 'Eliminando competição e protegendo raízes.',
            guide: `<h3>🌿 Liberdade para as Ramas: Limpeza Crítica</h3><p>Nos primeiros 40 dias, a batata-doce é lenta para cobrir o chão e sofre muito com a competição de ervas daninhas. Mantenha as leiras totalmente limpas; após esse período, as ramas se espalharão como um tapete verde e sufocarão qualquer mato naturalmente. Aproveite a limpeza para realizar a amontoa (chegar terra fofa no pé da planta). A terra solta e alta facilita o crescimento radial das batatas e as protege do sol direto. Um solo compactado ou com mato resultará em batatas finas, tortas e com baixo valor comercial. A hidratação nesta fase deve ser regular para garantir o pegamento total das ramas.</p>`
        },
        {
            day: 60,
            title: 'Amontoa de Proteção Contra Brocas',
            desc: 'Blindagem física das batatas subterrâneas.',
            guide: `<h3>🚜 Fechando as Portas para as Pragas</h3><p>Conforme as batatas-doces engrossam, elas empurram a terra e causam rachaduras superficiais na leira. Se o sol ou o ar entrarem nessas frestas, o cheiro atrairá a broca-da-batata-doce (Cylas formicarius), que perfura a batata e a torna amarga e intragável. Passe pelas leiras cobrindo qualquer rachadura com terra fofa. Esta manutenção é o seguro de vida da sua colheita. Além disso, a cobertura de terra evita que as batatas fiquem expostas e fiquem verdes (solanina), o que depreciaria a qualidade. Uma leira bem cuidada e "fechada" garante batatas limpas de pragas e com casca uniforme e brilhante.</p>`
        },
        {
            day: 90,
            type: 'routine',
            freq: 'monthly',
            title: 'Manejo de Levantamento de Ramas',
            desc: 'Concentrando energia na "mãe".',
            guide: `<h3>🍠 Foco Total na Raiz Principal: O Truque da Rama</h3><p>As ramas da batata-doce têm o hábito de criar raízes extras por onde passam. Se você permitir que essas raízes secundárias enraizem no chão, a planta espalhará sua energia e produzirá muitas "batatinhas" finas e sem valor em todo o quintal. Para colher batatas grandes na leira principal, levante as ramas do chão uma vez por mês, impedindo que elas se fixem fora do camalhão. Isso força a planta a translocar todo o açúcar produzido nas folhas para as raízes mestras localizadas sob o pé original. Esse pequeno esforço manual é o que diferencia uma colheita doméstica de uma produção profissional de alto rendimento.</p>`
        },
        {
            day: 120,
            title: 'Colheita e Cura Térmica de Doçura',
            desc: 'Momento de cavar e concentrar o vigor.',
            guide: `<h3>🍠 A Hora da Verdade: Colheita e Curagem</h3><p>A batata-doce não apresenta sinal externo de maturação (as folhas continuam verdes). O único jeito é cavar um cantinho da leira e verificar o tamanho. Geralmente, entre 120 e 150 dias elas estão ideais. Colha com cuidado usando uma forcada ou enxada, evitando ferir a pele delicada das batatas. **O Segredo Final:** Após colher, não consuma imediatamente! Deixe as batatas em local sombreado e ventilado por 10 dias (cura). Durante esse tempo, parte do amido se transforma em açúcar, tornando a batata muito mais doce e suculenta, além de cicatrizar pequenos ferimentos da casca, aumentando a vida útil em meses.</p>`
        }
    ],

    // 30. Abacaxi
    abacaxi: [
        {
            day: 0,
            title: 'Plantio de Mudas e Cura Sanitária',
            desc: 'Estabelecimento lento da coroa tropical.',
            guide: `<h3> Pineapple: O Rei das Bromélias</h3><p>O abacaxi é uma cultura de paciência (ciclo de 18 meses) e rigor sanitário. Use mudas do tipo "filhote" ou "rebentão". **Técnica de Ouro:** Antes de plantar, deixe as mudas de cabeça para baixo no sol por 7 dias; isso cura o ferimento da base e mata fungos de solo. Realize o plantio em valas ou covas adubadas com <b>{{NPK_GM2}}g</b> de NPK. O espaçamento deve ser largo (90x30cm) pois as folhas são extremamente espinhosas e dificultam o manejo futuro. O solo deve ter boa drenagem e ser ligeiramente ácido, condições ideais para que o sistema radicular se desenvolva sem apodrecimento.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Adubação Foliar Axilar e Nitrogênio',
            desc: 'Alimentando a planta pela base das folhas.',
            guide: `<h3>✨ Nutrição Digital: Alimentando pelas Axilas</h3><p>Diferente de outras plantas, o abacaxi absorve muitos nutrientes pelas axilas das folhas (o "copo" formado na base). Aplique adubo nitrogenado (ureia ou NPK) diretamente sobre as folhas inferiores, garantindo que o adubo caia nessas frestas. **Cuidado:** Nunca jogue adubo no "olho" (centro) da planta, pois isso queima o meristema apical e mata a planta. O abacaxi exige Nitrogênio constante para formar uma coroa grande e folhas vigorosas, que são a bateria de energia para o futuro fruto. Solo úmido potencializa a absorção desses nutrientes aplicados via foliar.</p>`
        },
        {
            day: 60,
            type: 'routine',
            freq: 'weekly',
            title: 'Manejo de Cochonilhas e Murchose',
            desc: 'Defesa contra o maior inimigo do abacaxi.',
            guide: `<h3>🐛 A Batalha Contra a Cochonilha-do-Abacaxi</h3><p>A cochonilha é a praga mais devastadora, pois transmite o vírus da murchose, que faz a planta secar de cima para baixo. Elas vivem escondidas na base das folhas e são frequentemente "pastoreadas" por formigas doceiras. O controle deve focar na eliminação das formigas e no uso de óleo de neem ou inseticidas sistêmicos se notar a presença do pó branco característico da cochonilha. Mantenha a lavoura livre de ervas daninhas que servem de ponte para as formigas. Uma inspeção semanal rigorosa nas axilas das folhas é o único modo de garantir que sua produção chegue ao final de 18 meses com saúde.</p>`
        },
        {
            day: 300,
            title: 'Indução Floral Estratégica (Uniformidade)',
            desc: 'Forçando o nascimento do fruto.',
            guide: `<h3>🌺 Indução Floral: Colheita Programada</h3><p>Para evitar que cada pé de abacaxi dê fruto em uma época diferente, utiliza-se a indução floral. Aos 10-12 meses, quando a planta estiver grande e robusta, pode-se aplicar carbureto de cálcio ou etileno no centro da planta durante a noite ou em dias nublados. Essa técnica "engana" a planta, forçando-a a iniciar a floração de forma uniforme em todo o talhão. Isso facilita imensamente o manejo final e a venda, pois você terá todos os frutos prontos ao mesmo tempo. Sem a indução, o abacaxi pode demorar mais de 2 anos para florescer naturalmente, dependendo das variações climáticas e queda de temperatura.</p>`
        },
        {
            day: 450,
            title: 'Proteção Solar do Fruto (Ensachamento)',
            desc: 'Evitando a queima solar da polpa.',
            guide: `<h3>☀️ Chapéu no Rei: Protegendo contra a Queima</h3><p>Próximo à colheita, o abacaxi fica exposto ao sol forte que pode "cozinhar" a polpa por dentro, causando manchas amarelas moles e fermentação precoce. O ensachamento ou proteção é fundamental. Amarre as folhas superiores sobre o fruto ou use sacos de papel Kraft para sombrear o abacaxi. Essa técnica simples preserva a cor, o aroma e garante que o fruto chegue à mesa com a polpa doce e firme. Verifique também se o fruto não está tombando com o peso; se necessário, use uma pequena estaca de apoio. O abacaxi protegido tem valor de mercado muito superior e sabor significativamente mais equilibrado.</p>`
        }
    ],

    // 31. Vagem
    vagem: [
        {
            day: 0,
            title: 'Plantio Tutorado e Adubação de Sulco',
            desc: 'Início da cultura trepadeira.',
            guide: `<h3>🫘 Vagem: A Leguminosa de Ciclo Relâmpago</h3><p>A vagem (ou feijão-vagem) é uma cultura de crescimento extremamente rápido, iniciando a colheita em 60 dias. A maioria das variedades comerciais é do tipo trepadeira e exige tutoramento. Prepare sulcos adubados com <b>{{NPK_GM2}}g</b> de NPK e garanta que o solo seja rico em fósforo para o arranque inicial. Semeie com espaçamento de 50cm entre plantas. O tutoramento em "X" (cerca cruzada) ou em varais de fitilho é essencial para manter as vagens longe do chão, o que evita podridão e manchas. As leguminosas também se beneficiam da fixação biológica de Nitrogênio, mas uma base inicial de adubo garante o vigor necessário para a escalada vertical.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Irrigação Frequente e Floração Crítica',
            desc: 'Água constante para evitar o abortamento.',
            guide: `<h3>💧 Hidratação para Flores e Vagens</h3><p>A vagem é extremamente sensível à falta de água durante o período de florescimento. Qualquer estresse hídrico nesta fase fará com que as flores caiam (abortamento), reduzindo drasticamente a produção. Mantenha o solo sempre úmido, aplicando regas diárias ou por gotejamento na base das plantas. Evite regas por aspersão nas horas mais quentes para não favorecer doenças fúngicas foliares. O solo deve estar com aspecto de terra fresca; se ficar seco e duro, as vagens crescerão tortas e fibrosas. A umidade estável é o principal segredo para colher vagens macias, retas e com grãos bem formados.</p>`
        },
        {
            day: 25,
            title: 'Amarração, Condução e Desbrota Base',
            desc: 'Ajudando a planta a escalar.',
            guide: `<h3>🪵 Condução Vertical: A Escalada do Sabor</h3><p>Conforme os "bicos" da vagem começam a crescer, ajude a planta a encontrar o tutor. Enrole suavemente a rama principal no sentido horário ao redor da estaca ou fitilho. Realize uma limpeza na base da planta, removendo os primeiros brotos laterais muito baixos para favorecer a circulação de ar. Isso previne o surgimento de podridões radiculares. Uma planta bem conduzida distribui melhor a fotossíntese por toda a massa foliar, resultando em vagens distribuídas por todo o comprimento do tutor. O tutoramento firme também evita que o vento derrube a plantação quando ela estiver carregada de frutos e folhas pesadas.</p>`
        },
        {
            day: 40,
            type: 'routine',
            freq: 'weekly',
            title: 'Monitoramento de Percevejos Sugadores',
            desc: 'Defesa contra danos nos grãos.',
            guide: `<h3>🐛 Percevejo Verde: O Furador Silencioso</h3><p>O percevejo é a principal praga da vagem. Ele insere seu estilete no fruto para sugar a seiva do grão em formação, deixando a vagem com manchas amarelas e o grão "chocho" (seco e sem sabor). Inspecione as plantas pela manhã, quando os percevejos estão menos ativos. Em pequenas áreas, a catação manual é eficiente; em áreas maiores, use repelentes orgânicos como calda de neem ou defensivos biológicos. Manter a lavoura limpa e livre de ervas daninhas hospedeiras reduz a infestação. Um ataque de percevejos pode desvalorizar toda a colheita, tornando as vagens esteticamente feias e ruins para o consumo.</p>`
        },
        {
            day: 50,
            type: 'routine',
            freq: 'weekly',
            title: 'Colheita Frequente e Ponto de Mercado',
            desc: 'Evitando a vagem fibrosa e granada.',
            guide: `<h3>✂️ Colheita Cirúrgica: O Momento da Maciez</h3><p>O ponto ideal de colheita da vagem é antes dos grãos ficarem muito evidentes (granar). Vagem "granada" fica fibrosa, dura e perde o valor culinário. Colha a cada 2 ou 3 dias para estimular a planta a continuar produzindo novas flores. Use sempre uma tesoura ou mãos delicadas para não tracionar a rama principal do tutor. Vagens colhidas jovens têm aquela crocância característica e são muito mais aceitas no mercado e na cozinha. Se você deixar passar do ponto, a semente dentro da vagem sugará toda a energia da planta, interrompendo o ciclo de novas brotações. Colher rápido é sinônimo de colher por muito mais tempo!</p>`
        }
    ],

    // 33. Pecuária Menor Específica
    caprinos: [
        {
            day: 0,
            title: 'Manejo Alimentar de Ramoneio e Contenção',
            desc: 'Estratégia nutricional para animais seletivos.',
            guide: `<h3>🐐 Caprinos: A Arte do Ramoneio</h3><p>Os caprinos (cabras e bodes) possuem um hábito alimentar único chamado ramoneio: eles preferem comer folhagens de arbustos e árvores, mantendo a cabeça elevada, ao contrário das ovelhas que pastam no chão. Para uma saúde plena, forneça acesso a áreas com arbustos ou ofereça ramos frescos de Amora, Leucena ou Gliricídia. **Dica Crítica:** O casco dos caprinos é extremamente sensível à umidade excessiva, que causa a podridão do pé (footrot). Garanta um aprisco com piso ripado ou solo muito bem drenado e seco. Cabras felizes são aquelas que têm onde subir (pequenas plataformas) e uma dieta rica em fibras arbustivas e minerais de qualidade.</p>`
        },
        {
            day: 7,
            type: 'routine',
            freq: 'daily',
            title: 'Higiene de Instalações e Gestão de Amônia',
            desc: 'Mantendo o ambiente seco e saudável.',
            guide: `<h3>🧼 Higiene Rigorosa: O Segredo da Sanidade</h3><p>O acúmulo de esterco e urina em ambientes úmidos libera amônia, um gás irritante que causa pneumonia e problemas oculares nos caprinos. Limpe as instalações diariamente, removendo a matéria orgânica e garantindo que o chão esteja sempre seco. Utilize cal virgem no piso após a limpeza para desinfetar e absorver a umidade residual. O manejo de resíduos é fundamental para evitar a proliferação de moscas e bactérias que causam a linfadenite caseosa (mal do caroço). Um ambiente limpo e ventilado reduz drasticamente a necessidade de medicamentos e garante um leite e carne de qualidade superior, sem odores desagradáveis.</p>`
        },
        {
            day: 15,
            type: 'routine',
            freq: 'weekly',
            title: 'Suplementação Mineral e Equilíbrio Metabólico',
            desc: 'Minerais específicos para pequenos ruminantes.',
            guide: `<h3>🧂 Mineralização: O Combustível Invisível</h3><p>Caprinos possuem uma demanda mineral altíssima, especialmente de Zinco e Selênio, para manter a pele saudável e o sistema reprodutivo ativo. Nunca use sal mineral comum para bovinos, pois a concentração de Cobre pode ser tóxica para caprinos em certas fases, ou insuficiente em outras. Mantenha o cocho de sal sempre seco e protegido da chuva. O acesso constante ao sal mineral evita o hábito de "comer terra" ou lamber paredes (pica), que sinaliza desequilíbrios graves. Uma cabra bem mineralizada apresenta pelos brilhantes, olhos vivos e uma imunidade natural muito mais forte contra parasitas e mudanças bruscas de clima.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Monitoramento Parasitário via Método FAMACHA',
            desc: 'Identificando a anemia antes que seja fatal.',
            guide: `<h3>👁️ Olho na Saúde: O Método FAMACHA</h3><p>O maior inimigo dos caprinos é o verme Haemonchus contortus, que suga o sangue do animal. Use o método FAMACHA mensalmente: avalie a cor da mucosa do olho do animal. Mucosa vermelha indica saúde; mucosa rosa claro ou branca indica anemia profunda por verminose. Trate individualmente apenas os animais com score 4 ou 5 (pálidos) para evitar a resistência dos vermes aos medicamentos. Este manejo seletivo é a única forma sustentável de controlar parasitas a longo prazo. Combine esta prática com o manejo rotacionado de pastagens, nunca deixando os animais em áreas baixas e úmidas onde as larvas de vermes se concentram pela manhã.</p>`
        },
        {
            day: 60,
            type: 'routine',
            freq: 'monthly',
            title: 'Corte e Higienização de Cascos (Pedicure)',
            desc: 'Prevenindo manqueiras e deformações ósseas.',
            guide: `<h3>✂️ Casqueamento: Sustentação e Conforto</h3><p>Em ambientes de criação, o casco dos caprinos não sofre o desgaste natural que teria em áreas rochosas selvagens. Se o casco crescer demais, ele dobra sobre si mesmo, acumulando barro e bactérias, o que leva à manqueira e artrite. Uma vez por mês, inspecione e apare as pontas dos cascos com uma tesoura de casqueamento ou canivete afiado, deixando a sola reta e nivelada. Isso garante que o animal caminhe corretamente e consiga se alimentar bem. O casqueamento regular também é uma oportunidade para verificar sinais iniciais de ferimentos ou infecções, sendo um dos pilares do bem-estar animal na caprinocultura moderna.</p>`
        }
    ],
    codornas: [
        {
            day: 0,
            title: 'Ambiência Controlada e Proteção de Vento',
            desc: 'Gestão térmica para aves de alto metabolismo.',
            guide: `<h3>🐦 Codornas: Pequenas e Altamente Produtivas</h3><p>As codornas possuem um metabolismo acelerado e são extremamente sensíveis a correntes de ar frias ("vento encanado"), que podem causar mortes súbitas por estresse térmico. Garanta que o viveiro ou a bateria de gaiolas esteja protegido por cortinas ou paredes sólidas. **Nutrição de Elite:** Codornas exigem uma ração com teor de proteína muito superior ao das galinhas (22% a 24%). Sem essa proteína, elas param de botar quase instantaneamente. O ambiente deve ser calmo, pois barulhos repentinos podem fazer as aves pularem bruscamente e se ferirem no teto da gaiola. Conforto térmico e silêncio são os pilares para uma postura diária e constante.</p>`
        },
        {
            day: 1,
            type: 'routine',
            freq: 'daily',
            title: 'Higiene de Bebedouros e Qualidade da Água',
            desc: 'Prevenindo contaminações bacterianas rápidas.',
            guide: `<h3>💧 Água Fresca e Higienizada</h3><p>Devido ao pequeno tamanho, uma codorna desidrata ou adoece por água contaminada em poucas horas. Lave os bebedouros diariamente para remover o biofilme (limo) e restos de ração que as aves deixam ao beber. Utilize água fresca e preferencialmente clorada ou tratada. Em sistemas de niples, verifique se todos estão funcionando corretamente. Bebedouros sujos são a principal via de transmissão de coccidiose e colibacilose no plantel. Uma ave pequena exige cuidados cirúrgicos com a higiene para manter sua performance de botar praticamente um ovo por dia durante todo o ciclo produtivo.</p>`
        },
        {
            day: 7,
            type: 'routine',
            freq: 'weekly',
            title: 'Gestão de Dejetos e Controle de Amônia',
            desc: 'Higiene ambiental e prevenção respiratória.',
            guide: `<h3>🧹 Controle de Amônia e Limpeza de Bandejas</h3><p>As codornas geram uma grande quantidade de dejetos em relação ao seu peso corporal. Se criadas em gaiolas, as bandejas coletoras devem ser limpas ou trocadas semanalmente. O acúmulo de esterco úmido libera gases tóxicos que queimam as vias respiratórias sensíveis das aves. Polvilhe cal ou maravalha seca nas bandejas para absorver a umidade e reduzir o odor. Esse dejeto de codorna é um dos adubos orgânicos mais potentes que existem (rico em Nitrogênio), mas dentro do galpão ele é um risco sanitário. Mantenha a ventilação alta para garantir que o ar esteja sempre renovado e sem cheiro de "galinheiro".</p>`
        },
        {
            day: 20,
            type: 'routine',
            freq: 'monthly',
            title: 'Suplementação de Cálcio e Fortalecimento de Casca',
            desc: 'Suporte para a intensa exportação de minerais.',
            guide: `<h3>🥚 Casca Dura: O Desafio do Cálcio</h3><p>Uma codorna bota um ovo que representa quase 10% do seu peso corporal todos os dias. Isso gera uma demanda exaustiva de Cálcio do organismo. Além da ração balanceada, ofereça semanalmente uma fonte extra de cálcio, como farinha de ostra fina ou casca de ovo moída e higienizada. A falta de cálcio causa "ovos de casca mole" (ovo peteca) e pode levar à descalcificação progressiva dos ossos da ave (fadiga de gaiola), impedindo-a de ficar em pé. O equilíbrio entre Cálcio e Fósforo na dieta é o que garante a saúde duradoura da ave e a qualidade comercial dos ovos para o consumo.</p>`
        },
        {
            day: 40,
            title: 'Programa de Luz e Estímulo Hormonal',
            desc: 'Gerenciando o ciclo de postura.',
            guide: `<h3>💡 A Luz é o Gatilho da Postura</h3><p>As codornas são aves fotossensíveis; elas precisam de pelo menos 14 a 16 horas de luz total (dia + luz artificial) para manter os hormônios de postura ativos. Quando os dias encurtam no inverno, a produção cai drasticamente se não houver suplementação luminosa. Instale um timer para ligar uma lâmpada LED fraca ao entardecer e desligar por volta das 21h. **Atenção:** Evite luzes muito fortes ou intermitentes, que podem causar canibalismo e agressividade no grupo. O programa de luz constante sinaliza para o organismo da ave que a "primavera" é eterna, garantindo ovos na mesa durante o ano inteiro, independentemente da estação.</p>`
        }
    ],
    patos: [
        {
            day: 0,
            title: 'Manejo Hídrico e Higiene Ocular',
            desc: 'Necessidades específicas de aves aquáticas rústicas.',
            guide: `<h3>🦆 Patos: Rústicos mas Dependentes de Água</h3><p>Embora os patos modernos não precisem obrigatoriamente de um lago para sobreviver, eles possuem uma necessidade biológica vital de molhar a cabeça e os olhos. O bebedouro deve ser fundo o suficiente para que o pato consiga submergir o bico e a cabeça inteira; isso serve para limpar as membranas oculares e evitar infecções. O pato é uma das aves mais rústicas da fazenda, sendo naturalmente resistente a muitas doenças que matam galinhas. Contudo, são animais que fazem muita sujeira e "barro", exigindo áreas de circulação que suportem umidade sem virar focos de contaminação para outras espécies.</p>`
        },
        {
            day: 1,
            type: 'routine',
            freq: 'daily',
            title: 'Troca de Água de Mergulho e Bebedouros',
            desc: 'Mantendo o vigor através da água limpa.',
            guide: `<h3>💧 Água Limpa: O Desafio com Patos</h3><p>Patos têm o hábito instintivo de misturar ração e terra na água em que bebem e se banham. Isso transforma bacias de água em verdadeiras "sopas de bactérias" em poucas horas. Troque a água dos bebedouros e das bacias de banho diariamente, preferencialmente pela manhã. A água suja é a principal porta de entrada para verminoses e problemas intestinais. Se possível, posicione os bebedouros sobre uma área britada ou ripada para evitar que o entornamento de água crie lamaçais eternos no galpão. Patos com acesso a água limpa para banho mantêm a plumagem impermeável e a saúde respiratória impecável.</p>`
        },
        {
            day: 10,
            type: 'routine',
            freq: 'weekly',
            title: 'Higiene de Dormitórios e Gestão de Palhada',
            desc: 'Prevenindo fungos e pododermatites.',
            guide: `<h3>🧹 Cama Seca para Pés Felizes</h3><p>Apesar de serem aves aquáticas durante o dia, os patos devem dormir em locais estritamente secos. Se passarem a noite sobre uma cama úmida e fria, desenvolverão fungos nas patas e problemas articulares. Troque a palhada ou maravalha da área de dormir semanalmente, garantindo uma camada grossa e absorvente. O dejeto do pato é muito úmido, o que exige atenção redobrada à ventilação do abrigo. Cama seca e limpa previne o "bumblefoot" (feridas na sola dos pés), que pode ser fatal para aves pesadas. O conforto noturno é o que garante que o pato tenha energia para o ramoneio e pastoreio diário.</p>`
        },
        {
            day: 30,
            type: 'routine',
            freq: 'monthly',
            title: 'Controle Parasitário e Vermifugação Estratégica',
            desc: 'Eliminando parasitas de ambientes úmidos.',
            guide: `<h3>🦠 Guerra Contra os Vermes de Poça</h3><p>Patos adoram fuçar em poças e lamas, onde as larvas de diversos vermes intestinais se concentram. Isso os torna alvos fáceis para endoparasitas poderosos. Realize uma vermifugação estratégica a cada 3 ou 4 meses, utilizando produtos via água ou ração recomendados por um veterinário. Animais com vermes apresentam perda de peso, penas arrepiadas e queda na postura de ovos. Manter o gramado baixo e as áreas de lazer sem água parada ajuda a quebrar o ciclo biológico dos parasitas. O controle preventivo é muito mais barato e eficaz do que tentar tratar uma ave já debilitada e anêmica.</p>`
        },
        {
            day: 150,
            title: 'Manejo de Ciclo Final: Carne ou Ovos',
            desc: 'Estratégia de abate e início de postura.',
            guide: `<h3>🦆 Colhendo os Frutos da Criação</h3><p>O pato atinge sua maturidade produtiva de forma rápida. Para produção de carne, o abate deve ocorrer preferencialmente entre a 10ª e a 14ª semana, antes que comece a troca de penas (empenamento), que dificulta a limpeza da carcaça. Se o objetivo for a postura de ovos, os patos iniciam o ciclo entre o 5º e 6º mês de vida. Os ovos de patos são maiores e excelentes para confeitaria devido à riqueza da gema. Forneça ninhos no chão, em locais escuros e protegidos, pois patas preferem esconder seus ovos da luz direta. A colheita de ovos deve ser diária para evitar que as aves os escondam ou sujem excessivamente.</p>`
        }
    ],

    // --- CONSÓRCIOS ---

    consorcio_milpa: [
        // Milho (5 tarefas)
        {
            day: 0,
            title: 'Milho: O Pilar e Suporte da Milpa',
            desc: 'Estabelecimento da estrutura vertical do sistema.',
            guide: `<h3>🌽 Milho: A Escada da Vida</h3><p>No sistema Milpa (Três Irmãs), o milho é o primeiro a ser plantado para servir de suporte físico ao feijão. Escolha variedades de porte alto e colmo robusto. Prepare as covas com <b>{{NPK_GM2}}g</b> de NPK <b>{{NPK_FORMULA}}</b> e garanta que o solo tenha recebido <b>{{CALC_GM2}}g/m²</b> de calcário previamente. O milho deve ganhar altura rapidamente; sem um suporte forte, o feijão acabará derrubando a planta mãe no final do ciclo. Plante em covas distantes 1 metro entre si, garantindo que o milho tenha sol pleno para crescer reto e vigoroso, servindo como o esqueleto deste ecossistema ancestral e altamente produtivo.</p>`
        },
        {
            day: 20,
            title: 'Milho: Adubação de Base e Vigor Estrutural',
            desc: 'Nitrogênio para garantir a resistência do suporte.',
            guide: `<h3>✨ Construindo o Suporte Perfeito</h3><p>Aos 20 dias, o milho entra na fase de crescimento acelerado. Aplique uma cobertura rica em Nitrogênio (Ureia) para garantir que o colmo engrosse e ganhe rigidez. Um colmo fraco não suportará o peso da massa foliar do feijão e da abóbora que virão a seguir. Mantenha o solo úmido ao redor da base. Este é o momento de realizar a primeira amontoa (chegar terra no pé), o que estimula a formação de raízes de suporte (âncoras). O milho bem nutrido nesta fase é o seguro de que todo o sistema Milpa chegará ao final do ciclo em pé e produtivo.</p>`
        },
        {
            day: 40,
            type: 'routine',
            freq: 'weekly',
            title: 'Milho: Monitoramento do Cartucho e Pragas',
            desc: 'Proteção contra danos ao ponto de crescimento.',
            guide: `<h3>🐛 Defesa do Cartucho e Sanidade do Suporte</h3><p>Enquanto o feijão começa a se abraçar ao milho, a vigilância contra a lagarta-do-cartucho deve ser intensa. A lagarta pode destruir o ápice de crescimento do milho, impedindo-o de continuar subindo. Realize monitoramentos semanais e use apenas defensivos biológicos (Bacillus thuringiensis) para não prejudicar os polinizadores que visitarão as flores da abóbora logo abaixo. Uma planta de milho doente ou atacada perde sua capacidade de suporte, comprometendo também a produção do feijão que depende dela para fugir da umidade do solo. Mantenha a sanidade foliar para garantir a fotossíntese máxima do sistema.</p>`
        },
        {
            day: 60,
            title: 'Milho: Adubação de Cobertura e Enchimento',
            desc: 'Último boost para garantir espigas grandes.',
            guide: `<h3>✨ O Impulso Final para os Grãos</h3><p>Nesta fase, o milho inicia o pendoamento. A demanda por Nitrogênio e Potássio é máxima para garantir que as espigas encham de grãos doces. Aplique a adubação de cobertura em filete lateral. O feijão já estará subindo pelo caule, então tome cuidado para não sufocá-lo ou queimar suas raízes delicadas ao aplicar o adubo. O milho bem alimentado agora garantirá uma colheita verde excelente (pamonha e milho cozido) em poucos dias, enquanto o restolho da planta continuará servindo de armação morta para o feijão terminar sua secagem natural no pé.</p>`
        },
        {
            day: 90,
            title: 'Milho: Colheita Verde e Gestão do Restolho',
            desc: 'Primeira colheita e manutenção da estrutura seca.',
            guide: `<h3>🌽 Colheita Verde: Sabor e Estratégia</h3><p>Colha as espigas de milho preferencialmente quando os cabelos estiverem marrons e secos, indicando o ponto de milho verde. **Técnica Vital:** Não arranque a planta de milho! Colha apenas as espigas e mantenha o pé de milho (caule e folhas) no lugar. Ele continuará servindo de suporte para o feijão até que este complete seu ciclo de secagem. O milho verde colhido na hora tem o máximo de açúcar e sabor. A área foliar do milho agora começa a diminuir, permitindo que mais luz solar chegue ao feijão e à abóbora que dominam o andar de baixo e o andar médio do canteiro.</p>`
        },
        // Feijão (5 tarefas)
        {
            day: 15,
            title: 'Feijão: O Companheiro Nitrogenado (Plantio)',
            desc: 'Fixação de nitrogênio e início da escalada.',
            guide: `<h3>🫘 Feijão: O Adubo Vivo do Sistema</h3><p>Plante o feijão (variedades trepadoras) ao pé de cada milho quando este atingir cerca de 20-30cm de altura. O feijão tem o papel fundamental de fixar Nitrogênio do ar no solo através de suas raízes, "alimentando" as outras irmãs (milho e abóbora). Plante 2 a 3 sementes por pé de milho. O feijão usará o caule do milho como guia natural para subir e buscar luz, longe da umidade excessiva do chão. Esta parceria é o coração da Milpa: o milho dá o apoio e o feijão devolve a fertilidade, criando um ciclo de sustentabilidade natural sem necessidade de excesso de adubos químicos.</p>`
        },
        {
            day: 35,
            title: 'Feijão: Condução Inicial e Abraço de Luz',
            desc: 'Direcionando as gavinhas para o suporte vivo.',
            guide: `<h3>🤝 O Primeiro Abraço: Conduzindo a Gavinha</h3><p>À medida que o feijão cresce, ajude as primeiras gavinhas a encontrarem o caule do milho, enrolando-as suavemente no sentido horário. Este manejo evita que o feijão se espalhe pelo chão, onde ficaria vulnerável a podridões e pragas. O feijoeiro bem conduzido terá as folhas expostas ao sol acima da abóbora, mas abaixo da copa do milho, aproveitando o estrato médio de luz. Verifique se não há excesso de plantas por pé de milho; o raleio garante que o feijão tenha vigor para produzir vagens cheias e sadias sem sobrecarregar o suporte físico com peso excessivo.</p>`
        },
        {
            day: 50,
            type: 'routine',
            freq: 'weekly',
            title: 'Feijão: Monitoramento de Vírus e Sanidade',
            desc: 'Defesa contra mosca branca e mosca minadora.',
            guide: `<h3>🐞 Protegendo o Companheiro Frágil</h3><p>O feijoeiro é a parte mais sensível do sistema à viroses. Monitore a presença de mosca branca; se as folhas começarem a ficar com manchas amarelas mosaicas, a produção será comprometida. No sistema Milpa, a biodiversidade ajuda a confundir as pragas, mas a inspeção semanal ainda é necessária. Use repelentes orgânicos (calda de fumo ou neem) se necessário. Uma folhagem de feijão sadia garante a fixação contínua de Nitrogênio para a abóbora que está crescendo rápido no chão, mantendo a produtividade total do conjunto em níveis elevados e sustentáveis.</p>`
        },
        {
            day: 70,
            title: 'Feijão: Formação de Vagens e Enchimento',
            desc: 'Água e nutrientes para grãos perfeitos.',
            guide: `<h3>🫘 Energia Escalonada: O Momento do Grão</h3><p>Com o feijão em plena floração e início de formação de vagens, a necessidade de água é crítica. A abóbora, cobrindo o solo lá embaixo, ajuda a manter a terra fresca e úmida, protegendo as raízes do feijão. Se o clima estiver muito seco, reforce a irrigação na base. O feijão transforma agora todo o Nitrogênio acumulado em proteína nos grãos. Evite mexer excessivamente na folhagem para não derrubar as flores delicadas. Uma boa florada de feijão dentro da Milpa é sinal de que o equilíbrio entre as três irmãs está funcionando perfeitamente, com luz e sombra na medida certa.</p>`
        },
        {
            day: 100,
            title: 'Feijão: Colheita de Grãos Secos',
            desc: 'Colheita final e armazenamento de energia.',
            guide: `<h3>🫘 O Tesouro Seco da Milpa</h3><p>Colha o feijão quando as vagens estiverem totalmente secas, com aspecto de papelão e os grãos fazendo barulho de chocalho ao serem sacudidos. O milho já terá sido colhido verde ou estará seco, servindo apenas de estaca. Retire as vagens manualmente com cuidado. Colher o feijão seco no pé garante maior durabilidade e melhor sabor para o cozimento. Após a colheita, você pode incorporar os restos culturais (palhada de feijão e milho) ao solo; essa biomassa é riquíssima em matéria orgânica e nutrientes, deixando o canteiro preparado para a próxima cultura com muito mais fertilidade do que no início.</p>`
        },
        // Abóbora (5 tarefas)
        {
            day: 15,
            title: 'Abóbora: A Protetora do Solo (Plantio)',
            desc: 'Cobertura viva para controle de umidade e mato.',
            guide: `<h3>🎃 Abóbora: A Irmã Protetora</h3><p>Plante as abóboras entre as covas de milho, com espaçamento de 3 a 4 metros. O papel da abóbora no sistema Milpa é agir como um "mulching vivo". Suas folhas gigantes cobrem o solo completamente, impedindo o crescimento de ervas daninhas e mantendo a umidade da terra para o milho e o feijão. Prepare a cova da abóbora com muita matéria orgânica e adubo NPK <b>{{NPK_FORMULA}}</b>. Além da proteção do solo, a abóbora possui pelos espinhosos nos caules que ajudam a repelir pequenos animais e predadores, funcionando como uma cerca viva de proteção para a base do sistema produtivo.</p>`
        },
        {
            day: 30,
            title: 'Abóbora: Expansão Foliar e Mulching Vivo',
            desc: 'Gestão de ramos e cobertura total da terra.',
            guide: `<h3>🌿 Dominando o Andar de Baixo</h3><p>Conforme os ramos (ramas) da abóbora se espalham, direcione-as para que preencham todo o espaço vazio entre o milho e o feijão. A meta é não deixar nenhum pedaço de terra nua exposto ao sol. Isso cria um microclima fresco e úmido na superfície do solo, o que beneficia as raízes superficiais do feijão e do milho. Monitore a saúde das grandes folhas; se notar manchas brancas (Oídio), faça uma aplicação preventiva de calda de leite (10%). O solo coberto pelas folhas da abóbora economiza até 50% de água de irrigação, provando a eficiência hídrica deste sistema milenar.</p>`
        },
        {
            day: 45,
            type: 'routine',
            freq: 'weekly',
            title: 'Abóbora: Monitoramento de Brocas e Sanidade',
            desc: 'Proteção contra danos estruturais nas ramas.',
            guide: `<h3>🐛 Defesa da Base Alada</h3><p>A broca da rama é o principal inimigo da abóbora. Como ela está no chão, protegida pela sombra, a umidade pode favorecer também o surgimento de caramujos e lesmas. Inspecione a base da planta e as articulações das ramas. A sanidade da abóbora é vital: se as folhas morrerem prematuramente, o solo ficará exposto, o mato nascerá e a umidade subirá, prejudicando o feijão e o milho. Mantenha as ramas sadias para garantir a polinização das grandes flores amarelas que começarão a surgir, atraindo abelhas que beneficiarão indiretamente todas as culturas lindeiras da propriedade.</p>`
        },
        {
            day: 65,
            title: 'Abóbora: Polinização e Formação de Frutos',
            desc: 'Fomento aos polinizadores e gestão de flores.',
            guide: `<h3>🌼 O Festival das Flores Amarelas</h3><p>As flores da abóbora são grandes, ricas em néctar e essenciais para atrair polinizadores para todo o sistema. Se houver pouca atividade de abelhas, realize a polinização manual pela manhã. Com o surgimento dos primeiros frutos, a planta demanda mais Potássio. A abóbora agora atua como uma barreira física final, impedindo qualquer erosão do solo pelas chuvas tardias. Verifique se os frutos não estão em locais com acúmulo de água; se necessário, coloque uma base de palha seca sob o fruto para evitar o apodrecimento da casca em contato com a terra úmida do sistema Milpa.</p>`
        },
        {
            day: 120,
            title: 'Abóbora: Colheita Final e Cura ao Sol',
            desc: 'Colheita dos frutos duráveis e finalização do ciclo.',
            guide: `<h3>🎃 O Tesouro Final: Colheita e Cura</h3><p>A abóbora é a última a ser colhida no sistema Milpa. Colha os frutos quando o pedúnculo (talo) estiver seco e com aspecto de cortiça. O milho e o feijão já terão sido colhidos, sobrando apenas a palhada seca sobre as abóboras maduras. Deixe os frutos no sol por alguns dias para a cura da casca; isso as torna extremamente duráveis (até 6 meses). A Milpa completa seu ciclo entregando três tipos diferentes de alimentos (carboidrato do milho, proteína do feijão e vitaminas/fibras da abóbora), tudo cultivado no mesmo metro quadrado com eficiência e equilíbrio biológico total.</p>`
        }
    ],

    consorcio_aromatico: [
        // Tomate (5 tarefas)
        {
            day: 0,
            title: 'Tomate: Plantio e Base Nutricional',
            desc: 'O rei da horta com foco em cálcio e fósforo.',
            guide: `<h3>🍅 Tomateiro: O Centro das Atenções</h3><p>Nesse consórcio clássico, o tomate é o foco principal. Prepare a cova com <b>{{NPK_GM2}}g</b> de NPK e realize a calagem com <b>{{CALC_GM2}}g/m²</b> de calcário semanas antes para prevenir a "podridão apical". O tomateiro servirá de barreira de luz para o manjericão lá embaixo. Mantenha o solo profundo e solto; o tomateiro exige solo bem drenado para evitar doenças radiculares que podem contaminar também o manjericão vizinho. O uso de matéria orgânica curtida é o segredo para frutos saborosos e com durabilidade pós-colheita.</p>`
        },
        {
            day: 15,
            title: 'Tomate: Tutoramento e Suporte Vertical',
            desc: 'Manutenção da estrutura aérea.',
            guide: `<h3>🪵 Subida Estruturada: Estacas e Fitilhos</h3><p>Amarre o tomateiro verticalmente com estacas ou fitilhos. Isso é vital para liberar o espaço do solo para o manjericão crescer sem ser esmagado pelas ramas do tomate. O tutoramento melhora a ventilação do sistema consorciado, reduzindo em 70% o risco de fungos foliares. Use nós largos para não "enforcar" o caule do tomate que engrosse rápido. Uma planta bem conduzida distribui melhor a fotossíntese por toda a massa foliar, resultando em tomates maiores e manjericões mais cheirosos logo abaixo de sua sombra parcial benefíca.</p>`
        },
        {
            day: 25,
            type: 'routine',
            freq: 'weekly',
            title: 'Tomate: Poda de Manejo (Desbrota)',
            desc: 'Eliminação de brotos laterais para vigor.',
            guide: `<h3>✂️ Limpeza e Concentração de Energia</h3><p>Retire semanalmente os brotos axilares ("chupões") do tomateiro. Isso garante que a energia da planta seja canalizada para os frutos e não para folhagem lateral excessiva. A poda lateral também permite que o manjericão receba a luminosidade difusa necessária para produzir óleos essenciais. Mantendo o tomateiro com haste única, você facilita a aplicação de tratamentos biológicos em ambas as culturas e garante uma colheita escalonada e de alta qualidade estética e sanitária.</p>`
        },
        {
            day: 50,
            title: 'Tomate: Suplementação de Potássio e Sabor',
            desc: 'Foco no brilho e na doçura do fruto.',
            guide: `<h3>✨ Potássio: O Segredo do Tomate Doce</h3><p>Com o início da maturação dos primeiros cachos, a demanda por Potássio (K) dispara. O Potássio é o nutriente que transporta o açúcar da folha para o fruto. O manjericão, sendo uma erva mediterrânea, também adora solos bem nutridos com minerais. Aplique o adubo em círculo, longe do caule. O K garante frutos vermelhos, brilhantes e carnudos. Note que a parceria com o manjericão ajuda a repelir pragas como a mosca branca, permitindo que o tomateiro foque 100% da sua força no enchimento dos frutos sem o estresse de ataques constantes.</p>`
        },
        {
            day: 80,
            title: 'Tomate: Colheita de Frutos de Ciclo Completo',
            desc: 'O ápice do sabor e da produtividade.',
            guide: `<h3>🥗 Ponto de Maturação: Colheita no Pé</h3><p>Colha os tomates quando atingirem a cor vermelha intensa, no auge da maturação fisiológica. Tomates colhidos maduros no pé possuem até 3x mais aroma do que os de supermercado. O manjericão vizinho estará no ponto máximo de perfume agora, prontos para a famosa combinação culinária. Use tesouras de colheita para não abalar as estacas. O sistema consorciado prova aqui sua eficácia: você obteve proteção contra pragas e aproveitamento máximo de espaço, entregando dois ingredientes essenciais para a gastronomia de elite em um único canteiro.</p>`
        },
        // Manjericão (5 tarefas)
        {
            day: 7,
            title: 'Manjericão: O Escudo Aromático (Plantio)',
            desc: 'Barreira química contra pragas do tomate.',
            guide: `<h3>🌿 Manjericão: O Guarda-Costas do Tomate</h3><p>Plante o manjericão nas entrelinhas do tomateiro, a cerca de 15-20cm de distância. O manjericão exala odores fortes que confundem os sensores das pragas (como pulgões e tripes) que buscam o tomateiro pelo cheiro. Em troca, o tomateiro oferece a sombra parcial que o manjericão adora nos horários de pico de sol. Esta é a parceria perfeita: "um protege o outro". Prepare o solo com muito húmus de minhoca; o manjericão adora fertilidade orgânica para produzir folhas largas e extremamente perfumadas desde a primeira semana de campo.</p>`
        },
        {
            day: 20,
            type: 'routine',
            freq: 'weekly',
            title: 'Manjericão: Poda de Floração e Vigor',
            desc: 'Manutenção da massa foliar e aroma.',
            guide: `<h3>✂️ O Segredo da Longevidade: Sem Flores!</h3><p>Não permita que o manjericão floresça durante o consórcio. Assim que surgirem os botões florais no topo, "belisque-os" (corte com a unha ou tesoura). Isso força a planta a continuar produzindo ramos laterais e folhas em vez de sementes. O manjericão podado torna-se um arbusto denso, aumentando sua eficiência como repelente natural para o tomateiro. Além disso, a poda frequente mantém o sabor das folhas doce e intenso; folhas de plantas que já floriram tendem a ficar amargas e lenhosas, perdendo seu valor culinário e aromático.</p>`
        },
        {
            day: 35,
            title: 'Manjericão: Monitoramento Foliar e Sanidade',
            desc: 'Gestão de luz e prevenção de fungos.',
            guide: `<h3>🍃 Perfume na Mão e Vigilância no Olho</h3><p>Com o crescimento do tomateiro acima dele, o manjericão pode sofrer com o abafamento. Verifique semanalmente se não há fungos (mofo branco) na parte inferior das folhas. O aroma intenso do manjericão é um bioindicador de saúde: se o cheiro estiver fraco, a planta pode estar precisando de mais luz ou menos água superficial. O manjericão gosta de "pés frescos" mas "cabeça quente". Mantenha o canteiro livre de folhas velhas que caem do tomateiro sobre ele, garantindo a higiene total deste ecossistema aromático de alta performance.</p>`
        },
        {
            day: 60,
            title: 'Manjericão: Colheita Técnica de Ramos',
            desc: 'Produção contínua e fomento à rebrota.',
            guide: `<h3>🔪 Colheita e Pesto: A Arte do Corte</h3><p>Inicie a colheita dos ramos superiores do manjericão quando as ramas atingirem 15cm. Sempre colha acima de um par de folhas; isso estimula o surgimento de dois novos ramos no local do corte (lei da hidra). O manjericão colhido neste momento está carregado de óleos essenciais, sendo ideal para molhos e infusões. A planta continuará produzindo até que o tomateiro finalize seu ciclo. O manjericão é tão generoso que você pode colher até 1/3 da planta por vez sem comprometer seu vigor, mantendo a proteção química do consórcio sempre ativa e renovada.</p>`
        },
        {
            day: 80,
            title: 'Manjericão: Colheita Final e Renovação',
            desc: 'Finalização da parceria aromática.',
            guide: `<h3>🥗 Dupla Imbatível na Mesa</h3><p>Ao final da safra de tomate, realize a colheita total do manjericão. As raízes do manjericão terão deixado o solo mais poroso e rico em microrganismos. O consórcio entre tomate e manjericão não é apenas culinário; é um exemplo de agricultura sinérgica onde o resultado final é maior que a soma das partes. O solo remanescente estará riquíssimo em matéria orgânica, pronto para receber uma cultura de raízes (como cenoura ou beterraba) na próxima estação, aproveitando o "descanso" dado pelo sistema aromático.</p>`
        }
    ],

    consorcio_canteiro: [
        // Alface (5 tarefas)
        {
            day: 15,
            title: 'Alface: Transplantio e Cobertura Rápida',
            desc: 'Ocupando o espaço vago entre as linhas da cenoura.',
            guide: `<h3>🥬 Alface: A Velocista do Canteiro</h3><p>No consórcio de canteiro, a alface é plantada 15 dias após a cenoura para ganhar espaço enquanto a "irmã lenta" ainda é pequena. Transplantar mudas de alface entre as linhas de cenoura garante o aproveitamento de 100% da área e ajuda a sombrear o solo precocemente, reduzindo o crescimento do mato. A alface colherá os benefícios da adubação nitrogenada de base e agirá como um protetor térmico para o solo radicular da cenoura. O espaçamento deve ser calculado para que a alface seja colhida exatamente quando suas folhas começarem a encostar na cenoura, liberando o espaço no momento crítico.</p>`
        },
        {
            day: 25,
            title: 'Alface: Nutrição Foliar e Vigor Instantâneo',
            desc: 'Apostando no crescimento vegetativo rápido.',
            guide: `<h3>✨ Explosão Verde: Energia Extra</h3><p>Aplique Nitrogênio foliar ou fertirrigação na alface para que ela feche o dossel o mais rápido possível. A alface tem a missão de "pagar o aluguel" do canteiro mais cedo. Com <b>{{NPK_GM2}}g/m²</b> de nutrição bem aplicada, a alface crescerá suculenta e doce. A cenoura abaixo se beneficiará da umidade residual das regas da alface. Monitore a cor das folhas; alface amarela indica que a cenoura e ela estão competindo demais por Nitrogênio, exigindo uma reposição orgânica rápida para manter o vigor de ambas as culturas consorciadas no canteiro planejado.</p>`
        },
        {
            day: 35,
            type: 'routine',
            freq: 'weekly',
            title: 'Alface: Irrigação Local e Refresco Térmico',
            desc: 'Hidratação constante para evitar o amargor.',
            guide: `<h3>💧 Sede de Alface: O Motor da Crocância</h3><p>Mantenha o canteiro sempre úmido. Se a terra secar, a alface amarga e solta o pendão de flores precocemente, impossibilitando a colheita. A rega constante da alface é crucial para a cenoura também, que precisa de solo fofo e úmido para as raízes descerem retas. O consórcio otimiza a água: o que você regaria para uma só planta agora alimenta duas. Evite regas bruscas que possam enterrar as pequenas folhagens da cenoura sob a lama; prefira o sistema de microaspersão ou gotejamento na entrelinha das folhosas dominantes.</p>`
        },
        {
            day: 45,
            title: 'Alface: Colheita Antecipada e Gestão de Espaço',
            desc: 'Liberando o sol para a cenoura crescer.',
            guide: `<h3>🥗 Missão Cumprida: Abrindo o Canteiro</h3><p>Colha a alface assim que ela atingir o tamanho comercial. Não deixe a alface ficar velha no consórcio, pois nesse ponto ela começará a sombrear demais a cenoura e roubar todo o Potássio do solo. Ao retirar a alface, você "abre as cortinas" de sol para a cenoura, que agora terá 100% da luminosidade para realizar a fotossíntese final e engrossar a raiz. A retirada da alface deve ser cirúrgica, cortando no colo para não abalar as raízes vizinhas da cenoura que estão em pleno desenvolvimento subterrâneo.</p>`
        },
        {
            day: 50,
            title: 'Alface: Pós-Colheita e Limpeza Radicular',
            desc: 'Organização sanitária do canteiro para a vizinha.',
            guide: `<h3>🧹 Limpando o Terreno para a Cenoura</h3><p>Após colher as alfaces, limpe o canteiro retirando restos de folhas velhas que ficaram no chão. Esses restos podem atrair fungos e pragas (como tripes) que atacariam a cenoura remanescente. Com a saída da alface, a cenoura entra na sua fase de "explosão radial". O solo, que foi mantido úmido e fofo pela sombra da alface, agora é o berço perfeito para a cenoura atingir o diâmetro ideal de mercado. A economia de espaço aqui resultou em duas colheitas no tempo de uma, maximizando a rentabilidade da sua horta doméstica ou comercial.</p>`
        },
        // Cenoura (5 tarefas)
        {
            day: 0,
            title: 'Cenoura: Semeadura Profunda e Preparo Físico',
            desc: 'Início lento da raiz que dominara o canteiro.',
            guide: `<h3>🥕 Cenoura: O Começo Silencioso</h3><p>Semeie a cenoura em linhas profundas com solo extremamente destorroado. Revire a terra até 30cm para que a raiz possa descer sem obstáculos pedregosos. Use <b>{{CALC_GM2}}g/m²</b> de calcário e <b>{{NPK_GM2}}g/m²</b> de P2O5 (Fóforo) na base. A cenoura nasce devagar (até 15 dias), por isso o consórcio com a alface (que vem 15 dias depois) é ideal para ocupar o solo "vazio". A semente da cenoura deve ser coberta por apenas 1cm de terra fina. Este é o alicerce do sistema: solo macio e quimicamente equilibrado para garantir raízes retas e sem bifurcações deformantes.</p>`
        },
        {
            day: 10,
            title: 'Cenoura: Germinação e Umidade Crítica',
            desc: 'Gestão da crosta do solo para nascimento uniforme.',
            guide: `<h3>🌱 A Primeira Folha de Agulha</h3><p>O momento da germinação da cenoura é o mais frágil. Qualquer secamento da camada superficial do solo criará uma "crosta" dura que impedirá o nascimento das plantinhas. Mantenha o canteiro sempre com aspecto de terra escura e úmida. O nascimento uniforme garante que você não terá espaços vazios no canteiro. Logo após as primeiras cenouras surgirem, você estará pronto para introduzir a alface, que agirá como protetora do solo. Inspecione se há pequenos insetos de solo (grilos) que podem cortar as plântulas recém-nascidas, destruindo o stand inicial da lavoura.</p>`
        },
        {
            day: 25,
            title: 'Cenoura: Desbaste Estratégico (Raleio)',
            desc: 'Dando espaço vital para a raiz engrossar.',
            guide: `<h3>✂️ Deixando Apenas as Campeãs</h3><p>Realize o raleio das cenouras, deixando um espaçamento de 5 a 8cm entre as plantas. Se as cenouras crescerem amontoadas, elas se entrelaçarão e ficarão finas como "dedos". O desbaste deve ser feito quando as plantas tiverem 5cm de altura. A alface vizinha estará crescendo rápido agora e ajudará a esconder as raízes de cenoura que ficaram expostas no raleio. **Dica:** Não tente replantar a cenoura arrancada, ela não pegará bem. Use as cenourinhas do raleio como "baby beets" em saladas; elas são deliciosas e ricas em vitaminas e nutrientes concentrados do início do ciclo.</p>`
        },
        {
            day: 60,
            title: 'Cenoura: Adubação de Enchimento (Potássio)',
            desc: 'Apostando na cor e doçura após a saída da alface.',
            guide: `<h3>🥕 Raiz Laranja e Doce: O Poder do K</h3><p>Agora que as alfaces foram colhidas, a cenoura tem todo o canteiro e todo o sol para si. Aplique uma cobertura rica em Potássio (K). O Potássio é o nutriente que dá a cor laranja intensa e o sabor adocicado à cenoura. Sem concorrência, a folhagem da cenoura agora cresce livre. Mantenha a umidade constante; se o solo secar agora e você regar demais depois, as cenouras podem rachar (splitting). A cenoura bem nutrida com Potássio terá uma casca lisa e brilhante, indicando qualidade superior para o consumo final da família ou venda.</p>`
        },
        {
            day: 90,
            title: 'Cenoura: Colheita Final e Raízes de Ouro',
            desc: 'Ouro debaixo da terra: a recompensa do consórcio.',
            guide: `<h3>🥕 Colheita de Sucesso e Solo Renovado</h3><p>Colha as cenouras quando atingirem o diâmetro de 3 a 5cm no "ombro" (perto da folha). O solo, que foi intensamente trabalhado para ser fofo e protegido pela alface no início, entregará raízes longas, retas e extremamente doces. A colheita final do consórcio canteiro marca o fim de um ciclo de alta eficiência. O solo restante estará em excelente condição física para uma próxima cultura de folhosas. A satisfação de retirar cenouras perfeitas da terra é a prova de que o manejo consorciado respeita a biologia do solo e maximiza a produtividade natural da área.</p>`
        }
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

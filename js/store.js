export const state = {
    tasks: [],
    routines: [],
    projects: [],
    currentProject: 'all',
    viewDate: new Date(),
    soilAnalysis: null,
    editingId: null
};

export const elements = {};

export function getLocalISODate(date) {
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offset);
    return local.toISOString().split('T')[0];
}

export function saveData() {
    localStorage.setItem('rocapp_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('rocapp_projects', JSON.stringify(state.projects));
    localStorage.setItem('rocapp_routines', JSON.stringify(state.routines));
    if (state.soilAnalysis) {
        localStorage.setItem('rocapp_soil', JSON.stringify(state.soilAnalysis));
    }
    // Note: This function no longer calls renderTasks().
    // The caller is responsible for updating the UI.
}

export function loadData() {
    const savedTasks = localStorage.getItem('rocapp_tasks');
    const savedRoutines = localStorage.getItem('rocapp_routines');
    const savedProjects = localStorage.getItem('rocapp_projects');
    const savedAnalysis = localStorage.getItem('rocapp_soil'); // Corrected key from app.js 'rocapp_analysis' check? 
    // In app.js it was looking for 'rocapp_analysis' in loadData but using 'rocapp_soil' in saveData? 
    // App.js text: 
    // saveData: 'rocapp_soil'
    // loadData: 'rocapp_analysis'
    // This looks like a BUG in the original app.js too! 
    // I will check app.js again to be sure which key to use. 
    // App.js line 67: setItem('rocapp_soil'...)
    // App.js line 76: getItem('rocapp_analysis')
    // YES! It was a bug. I will fix it here to use 'rocapp_soil'.

    if (savedTasks) state.tasks = JSON.parse(savedTasks);
    if (savedRoutines) state.routines = JSON.parse(savedRoutines);
    if (savedProjects) state.projects = JSON.parse(savedProjects);
    if (savedAnalysis) state.soilAnalysis = JSON.parse(savedAnalysis);
}

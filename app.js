/* ========================================
   Smart Study Planner - JavaScript
   ======================================== */

// App State
const AppState = {
    subjects: [],
    todayPlan: [],
    progress: {
        totalCompleted: 0,
        subjectsCompleted: 0,
        streak: 0,
        lastStudyDate: null,
        weeklyData: [0, 0, 0, 0, 0, 0, 0]
    },
    theme: 'light'
};

// DOM Elements
const DOM = {
    themeToggle: document.getElementById('themeToggle'),
    subjectName: document.getElementById('subjectName'),
    subjectDeadline: document.getElementById('subjectDeadline'),
    addSubjectBtn: document.getElementById('addSubjectBtn'),
    subjectsList: document.getElementById('subjectsList'),
    subjectsEmpty: document.getElementById('subjectsEmpty'),
    subjectCount: document.getElementById('subjectCount'),
    planDate: document.getElementById('planDate'),
    generatePlanBtn: document.getElementById('generatePlanBtn'),
    planList: document.getElementById('planList'),
    planEmpty: document.getElementById('planEmpty'),
    progressPercentage: document.getElementById('progressPercentage'),
    progressRing: document.getElementById('progressRing'),
    totalCompleted: document.getElementById('totalCompleted'),
    subjectsCompleted: document.getElementById('subjectsCompleted'),
    currentStreak: document.getElementById('currentStreak'),
    weeklyChart: document.getElementById('weeklyChart'),
    confettiContainer: document.getElementById('confettiContainer')
};

// Constants
const STORAGE_KEYS = {
    SUBJECTS: 'studyPlanner_subjects',
    TODAY_PLAN: 'studyPlanner_todayPlan',
    PROGRESS: 'studyPlanner_progress',
    THEME: 'studyPlanner_theme'
};

const PRIORITY_CONFIG = {
    HIGH: { label: 'high', maxDays: 2, color: '#EF4444' },
    MEDIUM: { label: 'medium', maxDays: 7, color: '#F59E0B' },
    LOW: { label: 'low', maxDays: Infinity, color: '#10B981' }
};

// ========================================
// Initialization
// ========================================

function init() {
    loadData();
    applyTheme();
    setMinDeadline();
    setCurrentDate();
    renderAll();
    attachEventListeners();
    checkStreak();
}

function loadData() {
    try {
        const subjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
        const todayPlan = localStorage.getItem(STORAGE_KEYS.TODAY_PLAN);
        const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        const theme = localStorage.getItem(STORAGE_KEYS.THEME);

        if (subjects) AppState.subjects = JSON.parse(subjects);
        if (todayPlan) {
            const plan = JSON.parse(todayPlan);
            const planDate = plan.date;
            const today = new Date().toDateString();
            if (planDate === today) {
                AppState.todayPlan = plan.sessions;
            }
        }
        if (progress) AppState.progress = JSON.parse(progress);
        if (theme) AppState.theme = theme;
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(AppState.subjects));
        localStorage.setItem(STORAGE_KEYS.TODAY_PLAN, JSON.stringify({
            date: new Date().toDateString(),
            sessions: AppState.todayPlan
        }));
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(AppState.progress));
        localStorage.setItem(STORAGE_KEYS.THEME, AppState.theme);
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// ========================================
// Theme Management
// ========================================

function applyTheme() {
    document.documentElement.setAttribute('data-theme', AppState.theme);
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveData();
}

// ========================================
// Date Helpers
// ========================================

function setMinDeadline() {
    const today = new Date().toISOString().split('T')[0];
    DOM.subjectDeadline.min = today;
}

function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    DOM.planDate.textContent = new Date().toLocaleDateString('en-US', options);
}

function getDaysUntilDeadline(deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDeadline(deadline) {
    const date = new Date(deadline);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getPriority(deadline) {
    const days = getDaysUntilDeadline(deadline);
    if (days <= 2) return { ...PRIORITY_CONFIG.HIGH, days };
    if (days <= 7) return { ...PRIORITY_CONFIG.MEDIUM, days };
    return { ...PRIORITY_CONFIG.LOW, days };
}

function getDayOfWeek() {
    return new Date().getDay();
}

// ========================================
// Subject Management
// ========================================

function addSubject(name, deadline) {
    const subject = {
        id: Date.now().toString(),
        name: name.trim(),
        deadline: deadline,
        createdAt: new Date().toISOString(),
        completed: false
    };
    
    AppState.subjects.push(subject);
    saveData();
    renderSubjects();
    generateDailyPlan();
}

function deleteSubject(id) {
    AppState.subjects = AppState.subjects.filter(s => s.id !== id);
    saveData();
    renderSubjects();
    generateDailyPlan();
    renderProgress();
}

// ========================================
// Daily Plan Generation
// ========================================

function generateDailyPlan() {
    if (AppState.subjects.length === 0) {
        AppState.todayPlan = [];
        saveData();
        renderPlan();
        return;
    }

    const sessions = [];
    const sortedSubjects = [...AppState.subjects].sort((a, b) => {
        const daysA = getDaysUntilDeadline(a.deadline);
        const daysB = getDaysUntilDeadline(b.deadline);
        return daysA - daysB;
    });

    let totalSessions = Math.min(6, Math.max(4, AppState.subjects.length * 2));
    const sessionsPerSubject = Math.ceil(totalSessions / sortedSubjects.length);

    sortedSubjects.forEach((subject) => {
        const priority = getPriority(subject.deadline);
        const baseDuration = priority.label === 'high' ? 45 : priority.label === 'medium' ? 35 : 25;
        
        for (let i = 0; i < sessionsPerSubject && sessions.length < totalSessions; i++) {
            const session = {
                id: `${subject.id}_${i}`,
                subjectId: subject.id,
                subjectName: subject.name,
                duration: baseDuration + Math.floor(Math.random() * 10) - 5,
                priority: priority.label,
                completed: false
            };
            sessions.push(session);
        }
    });

    AppState.todayPlan = sessions.sort(() => Math.random() - 0.5);
    saveData();
    renderPlan();
}

function toggleSessionComplete(sessionId) {
    const session = AppState.todayPlan.find(s => s.id === sessionId);
    if (session) {
        session.completed = !session.completed;
        
        if (session.completed) {
            AppState.progress.totalCompleted++;
            AppState.progress.lastStudyDate = new Date().toDateString();
            updateWeeklyData();
            checkStreak();
            
            const allCompleted = AppState.todayPlan.every(s => s.completed);
            if (allCompleted) {
                triggerConfetti();
            }
        } else {
            AppState.progress.totalCompleted--;
        }
        
        saveData();
        renderPlan();
        renderProgress();
    }
}

// ========================================
// Progress Tracking
// ========================================

function updateWeeklyData() {
    const dayIndex = getDayOfWeek();
    AppState.progress.weeklyData[dayIndex]++;
}

function checkStreak() {
    const today = new Date().toDateString();
    const lastStudy = AppState.progress.lastStudyDate;
    
    if (!lastStudy) {
        return;
    }
    
    const lastStudyDate = new Date(lastStudy);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastStudyDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        AppState.progress.streak++;
    } else if (diffDays > 1) {
        AppState.progress.streak = 0;
    }
}

function updateProgressStats() {
    const completedSessions = AppState.todayPlan.filter(s => s.completed).length;
    const totalSessions = AppState.todayPlan.length;
    
    let percentage = 0;
    if (totalSessions > 0) {
        percentage = Math.round((completedSessions / totalSessions) * 100);
    }
    
    const circumference = 314;
    const offset = circumference - (percentage / 100) * circumference;
    DOM.progressRing.style.strokeDashoffset = offset;
    
    DOM.progressPercentage.textContent = `${percentage}%`;
    DOM.totalCompleted.textContent = AppState.progress.totalCompleted;
    DOM.currentStreak.textContent = AppState.progress.streak;
    
    const completedSubjects = AppState.subjects.filter(s => {
        const subjectSessions = AppState.todayPlan.filter(ts => ts.subjectId === s.id);
        return subjectSessions.length > 0 && subjectSessions.every(ts => ts.completed);
    }).length;
    DOM.subjectsCompleted.textContent = completedSubjects;
}

function renderWeeklyChart() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = getDayOfWeek();
    
    DOM.weeklyChart.innerHTML = days.map((day, index) => {
        const isToday = index === today;
        const maxSessions = Math.max(...AppState.progress.weeklyData, 1);
        const height = (AppState.progress.weeklyData[index] / maxSessions) * 60 + 10;
        
        return `
            <div class="chart-bar">
                <div class="bar ${AppState.progress.weeklyData[index] > 0 ? 'filled' : ''}" 
                     style="height: ${height}px"
                     title="${AppState.progress.weeklyData[index]} sessions"></div>
                <span class="bar-label ${isToday ? 'today' : ''}">${day}</span>
            </div>
        `;
    }).join('');
}

// ========================================
// Rendering
// ========================================

function renderAll() {
    renderSubjects();
    renderPlan();
    renderProgress();
}

function renderSubjects() {
    if (AppState.subjects.length === 0) {
        DOM.subjectsList.innerHTML = '';
        DOM.subjectsEmpty.classList.remove('hidden');
        DOM.subjectCount.textContent = '0';
        return;
    }

    DOM.subjectsEmpty.classList.add('hidden');
    DOM.subjectCount.textContent = AppState.subjects.length;

    DOM.subjectsList.innerHTML = AppState.subjects.map(subject => {
        const priority = getPriority(subject.deadline);
        const daysText = priority.days < 0 ? 'Overdue' : `${priority.days} days`;
        const badgeClass = priority.days < 0 ? 'overdue' : priority.label;

        return `
            <div class="subject-item" data-id="${subject.id}">
                <div class="subject-info">
                    <div class="subject-name">${escapeHtml(subject.name)}</div>
                    <div class="subject-deadline">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        ${formatDeadline(subject.deadline)}
                        <span class="days-badge ${badgeClass}">${daysText}</span>
                    </div>
                </div>
                <button class="btn-icon delete-subject" data-id="${subject.id}" aria-label="Delete subject">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

function renderPlan() {
    if (AppState.todayPlan.length === 0) {
        DOM.planList.innerHTML = '';
        DOM.planEmpty.classList.remove('hidden');
        return;
    }

    DOM.planEmpty.classList.add('hidden');

    DOM.planList.innerHTML = AppState.todayPlan.map(session => `
        <div class="plan-item ${session.completed ? 'completed' : ''}" data-id="${session.id}">
            <div class="plan-checkbox ${session.completed ? 'checked' : ''}" data-id="${session.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
            </div>
            <div class="plan-details">
                <div class="plan-subject">${escapeHtml(session.subjectName)}</div>
                <div class="plan-meta">
                    <span class="priority-badge ${session.priority}">${session.priority}</span>
                    <span>${session.duration} min</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProgress() {
    updateProgressStats();
    renderWeeklyChart();
}

// ========================================
// Event Listeners
// ========================================

function attachEventListeners() {
    DOM.themeToggle.addEventListener('click', toggleTheme);

    DOM.addSubjectBtn.addEventListener('click', handleAddSubject);
    DOM.subjectName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddSubject();
    });

    DOM.generatePlanBtn.addEventListener('click', () => {
        generateDailyPlan();
        DOM.generatePlanBtn.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            DOM.generatePlanBtn.style.animation = '';
        }, 300);
    });

    DOM.subjectsList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-subject');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            deleteSubject(id);
        }
    });

    DOM.planList.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.plan-checkbox');
        if (checkbox) {
            const id = checkbox.dataset.id;
            toggleSessionComplete(id);
        }
    });
}

function handleAddSubject() {
    const name = DOM.subjectName.value.trim();
    const deadline = DOM.subjectDeadline.value;

    if (!name || !deadline) {
        if (!name) {
            DOM.subjectName.style.borderColor = 'var(--color-danger)';
            setTimeout(() => {
                DOM.subjectName.style.borderColor = '';
            }, 2000);
        }
        if (!deadline) {
            DOM.subjectDeadline.style.borderColor = 'var(--color-danger)';
            setTimeout(() => {
                DOM.subjectDeadline.style.borderColor = '';
            }, 2000);
        }
        return;
    }

    addSubject(name, deadline);
    
    DOM.subjectName.value = '';
    DOM.subjectDeadline.value = '';
    setMinDeadline();
}

// ========================================
// Utilities
// ========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function triggerConfetti() {
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const container = DOM.confettiContainer;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.animation = `confettiFall ${1 + Math.random() * 2}s ease-out forwards`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        container.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% {
            opacity: 1;
            transform: translateY(-100vh) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// Start the App
// ========================================

document.addEventListener('DOMContentLoaded', init);

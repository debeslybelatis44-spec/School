// js/main.js - Fichier principal d'initialisation

document.addEventListener('DOMContentLoaded', function() {
    console.log('EduManager - Système de Gestion Scolaire');
    console.log('Chargement des données...');
    
    // Charger toutes les données
    loadData();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
    
    // Mettre à jour la date actuelle
    updateCurrentDate();
    
    // Configurer le menu mobile
    setupMobileMenu();
    
    // Initialiser la date de présence avec la date d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const presenceDateInput = document.getElementById('presenceDate');
    if (presenceDateInput) {
        presenceDateInput.value = today;
    }
    
    console.log('Application prête!');
});

function setupEventListeners() {
    // Connexion
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        if (username && password && role) {
            login(username, role);
        }
    });
    
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Navigation
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            updateMenuActive(this);
            
            // Fermer le menu mobile après sélection
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });
    
    // Recherche élèves
    document.getElementById('searchStudentBtn').addEventListener('click', function() {
        loadStudents();
    });
    
    document.getElementById('filterStudentClass').addEventListener('change', function() {
        loadStudents();
    });
    
    // Autres événements généraux
    document.getElementById('printBtn').addEventListener('click', function() {
        window.print();
    });
}

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('fr-FR', options);
    }
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Fermer le menu mobile en cliquant à l'extérieur
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Fonctions utilitaires globales
function getClassName(classId) {
    for (const section in classStructure) {
        const cls = classStructure[section].find(c => c.id === classId);
        if (cls) return cls.name;
    }
    return classId;
}

function getSectionName(section) {
    const sections = {
        'kindergarten': 'Kindergarten',
        'cycle1': 'Fondamentale 1er cycle',
        'cycle2': 'Fondamentale 2ème cycle',
        'cycle3': 'Fondamentale 3ème cycle',
        'secondary': 'Secondaire'
    };
    return sections[section] || section;
}

function addActivity(message, type = 'info') {
    const activities = JSON.parse(localStorage.getItem('school_activities') || '[]');
    activities.unshift({
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        user: currentUser.fullName
    });
    
    // Garder seulement les 50 dernières activités
    if (activities.length > 50) {
        activities.pop();
    }
    
    localStorage.setItem('school_activities', JSON.stringify(activities));
    
    // Mettre à jour l'affichage si nécessaire
    updateRecentActivities();
}

function updateRecentActivities() {
    const activitiesDiv = document.getElementById('recentActivities');
    if (!activitiesDiv) return;
    
    const activities = JSON.parse(localStorage.getItem('school_activities') || '[]');
    
    if (activities.length === 0) {
        activitiesDiv.innerHTML = '<p class="text-center text-muted">Aucune activité récente</p>';
        return;
    }
    
    let html = '';
    activities.slice(0, 5).forEach(activity => {
        const time = new Date(activity.timestamp).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        html += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <small>${activity.message}</small>
                </div>
                <div>
                    <small class="text-muted">${time}</small>
                </div>
            </div>
        `;
    });
    
    activitiesDiv.innerHTML = html;
}

function updateDashboard() {
    // Mettre à jour les statistiques du tableau de bord
    document.getElementById('totalStudents').textContent = students.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayPayments = payments.filter(p => p.date === today);
    document.getElementById('totalPayments').textContent = todayPayments.length;
    
    // Calculer les absences d'aujourd'hui
    const todayAbsences = presences.filter(p => p.date === today && p.status === 'absent').length;
    document.getElementById('absencesToday').textContent = todayAbsences;
    
    // Mettre à jour les statistiques financières
    updateFinancialStats();
    
    // Mettre à jour les activités récentes
    updateRecentActivities();
}

function updateFinancialStats() {
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayCollected = payments.filter(p => p.date === today)
                                 .reduce((sum, p) => sum + p.amount, 0);
    
    // Calculer la dette totale (simulé)
    let totalDebt = 0;
    students.forEach(student => {
        const classFee = fees[student.class];
        if (classFee) {
            const totalFee = classFee.general + classFee.first + classFee.second + classFee.third + (classFee.misc || 0);
            const studentPayments = payments.filter(p => p.studentId === student.id)
                                          .reduce((sum, p) => sum + p.amount, 0);
            totalDebt += Math.max(0, totalFee - studentPayments);
        }
    });
    
    document.getElementById('totalCollected').textContent = totalCollected.toLocaleString() + ' HTG';
    document.getElementById('totalPending').textContent = todayCollected.toLocaleString() + ' HTG';
    document.getElementById('totalDebt').textContent = totalDebt.toLocaleString() + ' HTG';
}
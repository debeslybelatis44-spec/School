// js/auth.js - Gestion de l'authentification

let currentUser = {
    username: "",
    role: "",
    fullName: "",
    userId: ""
};

function login(username, role) {
    currentUser = {
        username: username,
        role: role,
        fullName: username === 'admin' ? 'Administrateur Système' : 
                 role === 'secretary' ? 'Secrétaire Générale' : 
                 role === 'teacher' ? 'Professeur Mathématiques' : role,
        userId: generateUserId(role, username)
    };
    
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    
    // Mettre à jour l'affichage
    document.getElementById('currentRoleDisplay').textContent = `Rôle: ${getRoleName(role)}`;
    document.getElementById('currentUserDisplay').textContent = currentUser.fullName;
    document.getElementById('roleBadge').textContent = getRoleName(role);
    document.getElementById('roleBadge').className = `badge badge-futurist badge-${role}`;
    
    // Afficher/masquer les menus selon le rôle
    updateMenuVisibility(role);
    
    // Initialiser les sélecteurs
    initSelectors();
    
    // Afficher le tableau de bord
    showSection('dashboard');
    updateDashboard();
    
    // Charger les données
    loadAllData();
    
    // Ajouter une activité
    addActivity(`Connexion de ${currentUser.fullName}`, 'login');
}

function generateUserId(role, username) {
    return `${role}_${username}_${Date.now().toString().slice(-6)}`;
}

function getRoleName(role) {
    const roles = {
        'admin': 'Administration',
        'secretary': 'Secrétariat',
        'surveillant': 'Surveillance',
        'economat': 'Économat',
        'censeur': 'Censeur',
        'teacher': 'Professeur',
        'parent': 'Parent',
        'student': 'Élève'
    };
    return roles[role] || role;
}

function updateMenuVisibility(role) {
    // Masquer tous les menus spécifiques
    document.querySelectorAll('.admin-menu, .secretary-menu, .surveillant-menu, .economat-menu, .censeur-menu, .teacher-menu, .meetings-menu, .messages-menu, .homework-menu').forEach(menu => {
        menu.style.display = 'none';
    });
    
    // Afficher les menus selon le rôle
    const roleMenus = {
        'admin': ['.admin-menu', '.meetings-menu', '.messages-menu', '.homework-menu'],
        'secretary': ['.secretary-menu', '.meetings-menu', '.messages-menu'],
        'surveillant': ['.surveillant-menu', '.meetings-menu', '.messages-menu'],
        'economat': ['.economat-menu', '.meetings-menu', '.messages-menu'],
        'censeur': ['.censeur-menu', '.meetings-menu', '.messages-menu', '.homework-menu'],
        'teacher': ['.teacher-menu', '.meetings-menu', '.messages-menu'],
        'parent': ['.meetings-menu', '.messages-menu'],
        'student': ['.meetings-menu', '.messages-menu']
    };
    
    if (roleMenus[role]) {
        roleMenus[role].forEach(menuClass => {
            document.querySelectorAll(menuClass).forEach(menu => {
                menu.style.display = 'block';
            });
        });
    }
    
    // Toujours afficher le profil
    document.querySelectorAll('.nav-item:has(a[data-section="profile"])').forEach(menu => {
        menu.style.display = 'block';
    });
}

function logout() {
    addActivity(`Déconnexion de ${currentUser.fullName}`, 'logout');
    
    currentUser = { username: "", role: "", fullName: "", userId: "" };
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('loginForm').reset();
}

function loadAllData() {
    // Cette fonction est appelée après la connexion pour charger toutes les données nécessaires
    console.log('Chargement de toutes les données pour', currentUser.role);
}
// js/ui.js - Gestion de l'interface utilisateur

function showSection(sectionId) {
    // Masquer toutes les sections
    document.querySelectorAll('#contentArea > div').forEach(section => {
        section.style.display = 'none';
    });
    
    // Afficher la section demandée
    const sectionElement = document.getElementById(`${sectionId}Section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }
    
    // Mettre à jour le titre
    const titles = {
        'dashboard': 'Tableau de bord',
        'parameters': 'Paramètres',
        'employees': 'Employés',
        'fees': 'Frais et Versements',
        'scholarships': 'Bourses',
        'transactions': 'Transactions',
        'inscription': 'Inscription',
        'students': 'Élèves',
        'presence': 'Présences',
        'discipline': 'Discipline',
        'payments': 'Paiements',
        'grades': 'Notes',
        'bulletins': 'Bulletins',
        'teachers': 'Professeurs',
        'myClasses': 'Mes Classes',
        'profile': 'Profil',
        'messages': 'Messages',
        'meetings': 'Réunions & Cours',
        'homework': 'Devoirs'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionId] || sectionId;
    
    // Afficher/masquer le bouton d'impression
    document.getElementById('printBtn').style.display = (sectionId === 'bulletins') ? 'block' : 'none';
    
    // Charger les données spécifiques à la section
    switch(sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'parameters':
            loadSubjectsList();
            loadClassLimits();
            break;
        case 'inscription':
            loadRecentStudents();
            updateInscriptionStats();
            break;
        case 'students':
            loadStudents();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'fees':
            loadFeesTable();
            break;
        case 'scholarships':
            loadScholarships();
            updateScholarshipStats();
            break;
        case 'transactions':
            loadTransactions();
            updateTransactionStats();
            break;
        case 'presence':
            loadPresenceHistory();
            break;
        case 'discipline':
            loadSanctions();
            updateDisciplineStats();
            break;
        case 'payments':
            loadPaymentHistory();
            updatePaymentStatusSummary();
            break;
        case 'myClasses':
            if (currentUser.role === 'teacher') {
                loadTeacherClasses();
                loadTeacherSubjects();
            }
            break;
        case 'teachers':
            loadTeachers();
            updateTeacherStats();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'meetings':
            loadMeetings();
            break;
        case 'homework':
            loadHomework();
            break;
        case 'grades':
            // Initialisé plus tard
            break;
        case 'bulletins':
            // Initialisé plus tard
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}

function updateMenuActive(clickedLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    clickedLink.classList.add('active');
}

function initSelectors() {
    // Remplir tous les sélecteurs de classe
    updateAllClassSelectors();
    
    // Remplir les sélecteurs d'élèves
    updateStudentSelectors();
    
    // Remplir les sélecteurs de matières
    updateSubjectSelectors();
    
    // Charger les paramètres de l'école
    loadSchoolSettings();
    
    // Initialiser les autres sélecteurs
    initOtherSelectors();
}

function updateAllClassSelectors() {
    const classSelectors = [
        'studentClass', 'presenceClass', 'gradeClass', 'feeClass', 
        'homeworkClass', 'bulletinClass', 'modalClass', 'selectClassForFees',
        'presenceHistoryClass', 'filterStudentClass', 'selectClassForStudents',
        'teacherClasses'
    ];
    
    classSelectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (selector) {
            selector.innerHTML = '<option value="">Sélectionner</option>';
            
            // Ajouter toutes les classes
            for (const section in classStructure) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = getSectionName(section);
                
                classStructure[section].forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    option.textContent = cls.name;
                    optgroup.appendChild(option);
                });
                
                selector.appendChild(optgroup);
            }
        }
    });
}

function updateStudentSelectors() {
    const studentSelectors = [
        'scholarshipStudent', 'paymentStudent', 'sanctionStudent', 
        'bulletinStudent', 'presenceStudent'
    ];
    
    studentSelectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (selector) {
            selector.innerHTML = '<option value="">Sélectionner</option>';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.lastName} ${student.firstName} (${student.class})`;
                selector.appendChild(option);
            });
        }
    });
}

function updateSubjectSelectors() {
    const subjectSelectors = ['gradeSubject', 'homeworkSubject', 'teacherSubjects'];
    
    subjectSelectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (selector) {
            selector.innerHTML = '<option value="">Sélectionner</option>';
            
            // Ajouter les matières par section
            for (const section in subjectsBySection) {
                subjectsBySection[section].forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject.id;
                    option.textContent = `${subject.name} (Coeff: ${subject.coefficient})`;
                    option.dataset.section = section;
                    selector.appendChild(option);
                });
            }
        }
    });
}

function initOtherSelectors() {
    // Initialiser le sélecteur de période pour les rapports de frais
    const feeReportPeriod = document.getElementById('feeReportPeriod');
    if (feeReportPeriod) {
        feeReportPeriod.innerHTML = `
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
            <option value="custom">Personnalisée</option>
        `;
    }
    
    // Initialiser le sélecteur de paiements pour les reçus
    const receiptPayment = document.getElementById('receiptPayment');
    if (receiptPayment) {
        receiptPayment.innerHTML = '<option value="">Sélectionner</option>';
        payments.forEach(payment => {
            const option = document.createElement('option');
            option.value = payment.id;
            option.textContent = `${payment.studentName} - ${payment.amount} HTG - ${payment.date}`;
            receiptPayment.appendChild(option);
        });
    }
}

function updateBulletinStudents() {
    const classId = document.getElementById('bulletinClass').value;
    const studentSelect = document.getElementById('bulletinStudent');
    
    studentSelect.innerHTML = '<option value="">Sélectionner</option>';
    
    if (classId) {
        const classStudents = students.filter(s => s.class === classId);
        classStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.lastName} ${student.firstName}`;
            studentSelect.appendChild(option);
        });
    }
}
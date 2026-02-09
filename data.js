// js/data.js - Gestion des données et localStorage

// Structures de données globales
let students = [];
let employees = [];
let teachers = [];
let fees = {};
let scholarships = [];
let payments = [];
let presences = [];
let sanctions = [];
let grades = [];
let transactions = [];
let schoolSettings = {
    name: "École Secondaire",
    address: "123 Rue de l'Éducation, Port-au-Prince",
    phone: "509 44 44 4444",
    email: "contact@ecole.edu"
};

// Nouvelles structures de données
let messages = [];
let meetings = [];
let homework = [];
let subjectsBySection = {};
let homeworkGrades = [];
let classLimits = {};
let teacherAssignments = {};

// Structure des classes
const classStructure = {
    kindergarten: [
        { id: "jardin1", name: "Jardin 1 (2-3 ans)", capacity: 25, students: [] },
        { id: "jardin2", name: "Jardin 2 (3-4 ans)", capacity: 25, students: [] },
        { id: "jardin3", name: "Jardin 3 (4-5 ans)", capacity: 25, students: [] }
    ],
    cycle1: [
        { id: "1eAF", name: "1ère année fondamentale", capacity: 30, students: [] },
        { id: "2eAF", name: "2ème année fondamentale", capacity: 30, students: [] },
        { id: "3eAF", name: "3ème année fondamentale", capacity: 30, students: [] }
    ],
    cycle2: [
        { id: "4eAF", name: "4ème année fondamentale", capacity: 35, students: [] },
        { id: "5eAF", name: "5ème année fondamentale", capacity: 35, students: [] },
        { id: "6eAF", name: "6ème année fondamentale", capacity: 35, students: [] }
    ],
    cycle3: [
        { id: "7eAF", name: "7ème année fondamentale", capacity: 40, students: [] },
        { id: "8eAF", name: "8ème année fondamentale", capacity: 40, students: [] },
        { id: "9eAF", name: "9ème année fondamentale", capacity: 40, students: [] }
    ],
    secondary: [
        { id: "ns1", name: "NS 1", capacity: 40, students: [] },
        { id: "ns2", name: "NS 2", capacity: 40, students: [] },
        { id: "ns3", name: "NS 3", capacity: 40, students: [] },
        { id: "ns4", name: "NS 4", capacity: 40, students: [] }
    ]
};

// Matières par défaut avec coefficients
const defaultSubjects = {
    "cycle3": [
        { id: "francais", name: "Français", coefficient: 3, maxGrade: 100, type: "humanities" },
        { id: "anglais", name: "Anglais", coefficient: 2, maxGrade: 100, type: "humanities" },
        { id: "espagnol", name: "Espagnol", coefficient: 2, maxGrade: 100, type: "humanities" },
        { id: "creole", name: "Créole", coefficient: 2, maxGrade: 100, type: "humanities" },
        { id: "geologie", name: "Géologie", coefficient: 2, maxGrade: 200, type: "sciences" },
        { id: "biologie", name: "Biologie", coefficient: 2, maxGrade: 200, type: "sciences" },
        { id: "sciences_sociales", name: "Sciences sociales", coefficient: 2, maxGrade: 100, type: "humanities" },
        { id: "civisme", name: "Civisme", coefficient: 1, maxGrade: 100, type: "humanities" },
        { id: "informatique", name: "Informatique", coefficient: 2, maxGrade: 100, type: "general" },
        { id: "beaux_arts", name: "Beaux arts", coefficient: 1, maxGrade: 100, type: "humanities" },
        { id: "eps", name: "EPS", coefficient: 1, maxGrade: 100, type: "general" },
        { id: "savoir_vivre", name: "Savoir vivre", coefficient: 1, maxGrade: 100, type: "humanities" },
        { id: "maths", name: "Maths", coefficient: 4, maxGrade: 200, type: "sciences" },
        { id: "physique", name: "Physique", coefficient: 3, maxGrade: 300, type: "sciences" },
        { id: "chimie", name: "Chimie", coefficient: 3, maxGrade: 300, type: "sciences" }
    ],
    "secondary": [
        { id: "francais", name: "Français", coefficient: 4, maxGrade: 100, type: "humanities" },
        { id: "anglais", name: "Anglais", coefficient: 3, maxGrade: 100, type: "humanities" },
        { id: "espagnol", name: "Espagnol", coefficient: 3, maxGrade: 100, type: "humanities" },
        { id: "maths", name: "Maths", coefficient: 5, maxGrade: 200, type: "sciences" },
        { id: "physique", name: "Physique", coefficient: 4, maxGrade: 300, type: "sciences" },
        { id: "chimie", name: "Chimie", coefficient: 4, maxGrade: 300, type: "sciences" },
        { id: "biologie", name: "Biologie", coefficient: 3, maxGrade: 200, type: "sciences" },
        { id: "philosophie", name: "Philosophie", coefficient: 2, maxGrade: 100, type: "humanities" },
        { id: "histoire", name: "Histoire", coefficient: 2, maxGrade: 100, type: "humanities" },
        { id: "geographie", name: "Géographie", coefficient: 2, maxGrade: 100, type: "humanities" }
    ]
};

// Données de démonstration
const demoData = {
    students: [
        {
            id: "STU001",
            lastName: "Jean",
            firstName: "Pierre",
            birthDate: "2010-05-15",
            birthPlace: "Port-au-Prince",
            gender: "M",
            nationality: "Haïtienne",
            class: "7eAF",
            section: "cycle3",
            address: "Rue de l'École 123",
            phone: "509 44 44 4445",
            email: "pierre@email.com",
            fatherName: "Jean Marc",
            motherName: "Marie Jean",
            guardian: "Jean Marc",
            guardianPhone: "509 44 44 4446",
            medical: "Aucun",
            registrationDate: new Date().toISOString().split('T')[0],
            status: "active"
        },
        {
            id: "STU002",
            lastName: "Marie",
            firstName: "Claude",
            birthDate: "2011-08-20",
            birthPlace: "Jacmel",
            gender: "F",
            nationality: "Haïtienne",
            class: "7eAF",
            section: "cycle3",
            address: "Avenue de la Paix 456",
            phone: "509 44 44 4447",
            email: "claude@email.com",
            fatherName: "Pierre Marie",
            motherName: "Anne Marie",
            guardian: "Pierre Marie",
            guardianPhone: "509 44 44 4448",
            medical: "Allergie aux arachides",
            registrationDate: new Date().toISOString().split('T')[0],
            status: "active"
        }
    ],
    employees: [
        {
            id: "EMP001",
            lastName: "Admin",
            firstName: "Système",
            position: "admin",
            salary: 50000,
            email: "admin@ecole.edu",
            phone: "509 44 44 4444",
            address: "Port-au-Prince",
            hireDate: "2024-01-01",
            birthDate: "1980-01-01",
            diplomas: "Master en Administration",
            experience: "10 ans d'expérience",
            status: "active"
        },
        {
            id: "EMP002",
            lastName: "Secrétaire",
            firstName: "Générale",
            position: "secretary",
            salary: 30000,
            email: "secretary@ecole.edu",
            phone: "509 44 44 4449",
            address: "Port-au-Prince",
            hireDate: "2024-02-01",
            birthDate: "1990-05-15",
            diplomas: "Bac +3 en Secrétariat",
            experience: "5 ans d'expérience",
            status: "active"
        }
    ],
    teachers: [
        {
            id: "TCH001",
            lastName: "Professeur",
            firstName: "Mathématiques",
            email: "math@ecole.edu",
            phone: "509 44 44 4450",
            subjects: ["maths"],
            classes: ["7eAF", "8eAF", "9eAF"],
            hireDate: "2024-01-15",
            salary: 40000,
            specialization: "Mathématiques avancées",
            diplomas: "Master en Mathématiques",
            status: "active"
        }
    ],
    fees: {
        "7eAF": { general: 1000, first: 900, second: 800, third: 800, misc: 400, halfPercent: 50, fullFree: true },
        "8eAF": { general: 1200, first: 1000, second: 900, third: 800, misc: 400, halfPercent: 50, fullFree: true },
        "9eAF": { general: 1500, first: 1000, second: 1000, third: 800, misc: 600, halfPercent: 50, fullFree: true },
        "ns4": { general: 2000, first: 1500, second: 1200, third: 1000, misc: 1000, halfPercent: 50, fullFree: true }
    },
    classLimits: {
        "7eAF": 40,
        "8eAF": 40,
        "9eAF": 40,
        "ns4": 40
    }
};

function loadData() {
    // Charger toutes les données depuis localStorage
    const savedData = {
        students: localStorage.getItem('school_students'),
        employees: localStorage.getItem('school_employees'),
        teachers: localStorage.getItem('school_teachers'),
        fees: localStorage.getItem('school_fees'),
        scholarships: localStorage.getItem('school_scholarships'),
        payments: localStorage.getItem('school_payments'),
        presences: localStorage.getItem('school_presences'),
        sanctions: localStorage.getItem('school_sanctions'),
        grades: localStorage.getItem('school_grades'),
        transactions: localStorage.getItem('school_transactions'),
        settings: localStorage.getItem('school_settings'),
        messages: localStorage.getItem('school_messages'),
        meetings: localStorage.getItem('school_meetings'),
        homework: localStorage.getItem('school_homework'),
        subjects: localStorage.getItem('school_subjects'),
        homeworkGrades: localStorage.getItem('school_homework_grades'),
        classLimits: localStorage.getItem('school_class_limits'),
        teacherAssignments: localStorage.getItem('school_teacher_assignments')
    };
    
    students = savedData.students ? JSON.parse(savedData.students) : demoData.students;
    employees = savedData.employees ? JSON.parse(savedData.employees) : demoData.employees;
    teachers = savedData.teachers ? JSON.parse(savedData.teachers) : demoData.teachers;
    fees = savedData.fees ? JSON.parse(savedData.fees) : demoData.fees;
    scholarships = savedData.scholarships ? JSON.parse(savedData.scholarships) : [];
    payments = savedData.payments ? JSON.parse(savedData.payments) : [];
    presences = savedData.presences ? JSON.parse(savedData.presences) : [];
    sanctions = savedData.sanctions ? JSON.parse(savedData.sanctions) : [];
    grades = savedData.grades ? JSON.parse(savedData.grades) : [];
    transactions = savedData.transactions ? JSON.parse(savedData.transactions) : [];
    schoolSettings = savedData.settings ? JSON.parse(savedData.settings) : schoolSettings;
    messages = savedData.messages ? JSON.parse(savedData.messages) : [];
    meetings = savedData.meetings ? JSON.parse(savedData.meetings) : [];
    homework = savedData.homework ? JSON.parse(savedData.homework) : [];
    subjectsBySection = savedData.subjects ? JSON.parse(savedData.subjects) : defaultSubjects;
    homeworkGrades = savedData.homeworkGrades ? JSON.parse(savedData.homeworkGrades) : [];
    classLimits = savedData.classLimits ? JSON.parse(savedData.classLimits) : demoData.classLimits;
    teacherAssignments = savedData.teacherAssignments ? JSON.parse(savedData.teacherAssignments) : {};
    
    // Initialiser les limites de classe si nécessaire
    initClassLimits();
    
    // Initialiser les frais si nécessaire
    initFees();
    
    // Initialiser les relations professeurs-classes
    initTeacherAssignments();
    
    saveData();
}

function saveData() {
    localStorage.setItem('school_students', JSON.stringify(students));
    localStorage.setItem('school_employees', JSON.stringify(employees));
    localStorage.setItem('school_teachers', JSON.stringify(teachers));
    localStorage.setItem('school_fees', JSON.stringify(fees));
    localStorage.setItem('school_scholarships', JSON.stringify(scholarships));
    localStorage.setItem('school_payments', JSON.stringify(payments));
    localStorage.setItem('school_presences', JSON.stringify(presences));
    localStorage.setItem('school_sanctions', JSON.stringify(sanctions));
    localStorage.setItem('school_grades', JSON.stringify(grades));
    localStorage.setItem('school_transactions', JSON.stringify(transactions));
    localStorage.setItem('school_settings', JSON.stringify(schoolSettings));
    localStorage.setItem('school_messages', JSON.stringify(messages));
    localStorage.setItem('school_meetings', JSON.stringify(meetings));
    localStorage.setItem('school_homework', JSON.stringify(homework));
    localStorage.setItem('school_subjects', JSON.stringify(subjectsBySection));
    localStorage.setItem('school_homework_grades', JSON.stringify(homeworkGrades));
    localStorage.setItem('school_class_limits', JSON.stringify(classLimits));
    localStorage.setItem('school_teacher_assignments', JSON.stringify(teacherAssignments));
}

function initClassLimits() {
    // Initialiser les limites pour toutes les classes
    for (const section in classStructure) {
        classStructure[section].forEach(cls => {
            if (!classLimits[cls.id]) {
                classLimits[cls.id] = cls.capacity;
            }
        });
    }
}

function initFees() {
    // Initialiser les frais pour toutes les classes
    const defaultFees = demoData.fees;
    
    for (const [classId, fee] of Object.entries(defaultFees)) {
        if (!fees[classId]) {
            fees[classId] = fee;
        }
    }
}

function initTeacherAssignments() {
    // Initialiser les assignations des professeurs
    teachers.forEach(teacher => {
        if (teacher.classes && !teacherAssignments[teacher.id]) {
            teacherAssignments[teacher.id] = teacher.classes;
        }
    });
}
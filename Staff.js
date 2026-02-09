// js/staff.js - Gestion des employés et professeurs

// ============================
// GESTION DES EMPLOYÉS
// ============================

function showEmployeeModal() {
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    
    // Réinitialiser le formulaire
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeHireDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('employeeBirthDate').value = '1980-01-01';
    
    modal.show();
}

function saveEmployee() {
    // Générer un ID d'employé
    const employeeId = 'EMP' + (employees.length + 1).toString().padStart(3, '0');
    
    const employee = {
        id: employeeId,
        lastName: document.getElementById('employeeLastName').value,
        firstName: document.getElementById('employeeFirstName').value,
        position: document.getElementById('employeePosition').value,
        salary: parseFloat(document.getElementById('employeeSalary').value),
        email: document.getElementById('employeeEmail').value,
        phone: document.getElementById('employeePhone').value,
        address: document.getElementById('employeeAddress').value,
        hireDate: document.getElementById('employeeHireDate').value,
        birthDate: document.getElementById('employeeBirthDate').value,
        diplomas: document.getElementById('employeeDiplomas').value,
        experience: document.getElementById('employeeExperience').value,
        status: 'active'
    };
    
    employees.push(employee);
    saveData();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
    if (modal) modal.hide();
    
    // Recharger la table
    loadEmployees();
    
    alert('Employé enregistré avec succès!');
    addActivity(`Nouvel employé: ${employee.lastName} ${employee.firstName} (${employeeId})`, 'employees');
}

function loadEmployees() {
    const searchTerm = document.getElementById('searchEmployee').value.toLowerCase();
    const table = document.getElementById('employeesTable');
    
    // Filtrer les employés
    let filteredEmployees = employees;
    
    if (searchTerm) {
        filteredEmployees = filteredEmployees.filter(e => 
            e.lastName.toLowerCase().includes(searchTerm) ||
            e.firstName.toLowerCase().includes(searchTerm) ||
            e.position.toLowerCase().includes(searchTerm) ||
            e.id.toLowerCase().includes(searchTerm)
        );
    }
    
    table.innerHTML = '';
    
    if (filteredEmployees.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">Aucun employé trouvé</td>
            </tr>
        `;
        return;
    }
    
    filteredEmployees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.lastName} ${employee.firstName}</td>
            <td>${getRoleName(employee.position)}</td>
            <td>${employee.phone}</td>
            <td>${employee.email}</td>
            <td>${employee.hireDate}</td>
            <td>${employee.salary.toLocaleString()} HTG</td>
            <td>
                <button class="btn btn-sm btn-futurist me-1" onclick="viewEmployee('${employee.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning me-1" onclick="editEmployee('${employee.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${employee.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

function viewEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="employeeViewModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de l'employé</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p><strong>ID:</strong> ${employee.id}</p>
                                <p><strong>Nom:</strong> ${employee.lastName}</p>
                                <p><strong>Prénom:</strong> ${employee.firstName}</p>
                                <p><strong>Poste:</strong> ${getRoleName(employee.position)}</p>
                                <p><strong>Salaire:</strong> ${employee.salary.toLocaleString()} HTG</p>
                                <p><strong>Date d'embauche:</strong> ${employee.hireDate}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Date de naissance:</strong> ${employee.birthDate}</p>
                                <p><strong>Email:</strong> ${employee.email}</p>
                                <p><strong>Téléphone:</strong> ${employee.phone}</p>
                                <p><strong>Adresse:</strong> ${employee.address}</p>
                                <p><strong>Statut:</strong> ${employee.status === 'active' ? 'Actif' : 'Inactif'}</p>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <h6>Diplômes</h6>
                                <p>${employee.diplomas || 'Non spécifié'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Expérience</h6>
                                <p>${employee.experience || 'Non spécifié'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-futurist" onclick="editEmployee('${employee.id}')">
                            Modifier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('employeeViewModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('employeeViewModal'));
    modal.show();
}

function editEmployee(employeeId) {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    // Remplir le formulaire
    document.getElementById('employeeLastName').value = employee.lastName;
    document.getElementById('employeeFirstName').value = employee.firstName;
    document.getElementById('employeePosition').value = employee.position;
    document.getElementById('employeeSalary').value = employee.salary;
    document.getElementById('employeeEmail').value = employee.email;
    document.getElementById('employeePhone').value = employee.phone;
    document.getElementById('employeeAddress').value = employee.address;
    document.getElementById('employeeHireDate').value = employee.hireDate;
    document.getElementById('employeeBirthDate').value = employee.birthDate;
    document.getElementById('employeeDiplomas').value = employee.diplomas || '';
    document.getElementById('employeeExperience').value = employee.experience || '';
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    
    // Changer le titre
    const modalTitle = document.querySelector('#employeeModal .modal-title');
    modalTitle.textContent = 'Modifier l\'employé';
    
    // Changer l'action du formulaire
    const form = document.getElementById('employeeForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateEmployee(employeeId);
    };
    
    // Changer le texte du bouton
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Mettre à jour l\'employé';
    
    modal.show();
}

function updateEmployee(employeeId) {
    const employeeIndex = employees.findIndex(e => e.id === employeeId);
    if (employeeIndex === -1) return;
    
    const employee = employees[employeeIndex];
    
    // Mettre à jour les informations
    employee.lastName = document.getElementById('employeeLastName').value;
    employee.firstName = document.getElementById('employeeFirstName').value;
    employee.position = document.getElementById('employeePosition').value;
    employee.salary = parseFloat(document.getElementById('employeeSalary').value);
    employee.email = document.getElementById('employeeEmail').value;
    employee.phone = document.getElementById('employeePhone').value;
    employee.address = document.getElementById('employeeAddress').value;
    employee.hireDate = document.getElementById('employeeHireDate').value;
    employee.birthDate = document.getElementById('employeeBirthDate').value;
    employee.diplomas = document.getElementById('employeeDiplomas').value;
    employee.experience = document.getElementById('employeeExperience').value;
    
    saveData();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
    if (modal) modal.hide();
    
    // Recharger la table
    loadEmployees();
    
    alert('Employé mis à jour avec succès!');
    addActivity(`Employé modifié: ${employee.lastName} ${employee.firstName} (${employeeId})`, 'employees');
}

function deleteEmployee(employeeId) {
    if (!confirm('Supprimer cet employé? Cette action est irréversible.')) {
        return;
    }
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    // Marquer comme inactif plutôt que supprimer
    employee.status = 'inactive';
    saveData();
    
    // Recharger la table
    loadEmployees();
    
    alert('Employé marqué comme inactif!');
    addActivity(`Employé désactivé: ${employee.lastName} ${employee.firstName} (${employeeId})`, 'employees');
}

// ============================
// GESTION DES PROFESSEURS
// ============================

function showTeacherModal() {
    const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
    
    // Réinitialiser le formulaire
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherHireDate').value = new Date().toISOString().split('T')[0];
    
    modal.show();
}

function saveTeacher() {
    // Générer un ID de professeur
    const teacherId = 'TCH' + (teachers.length + 1).toString().padStart(3, '0');
    
    // Récupérer les matières et classes sélectionnées
    const subjectSelect = document.getElementById('teacherSubjects');
    const selectedSubjects = Array.from(subjectSelect.selectedOptions).map(option => option.value);
    
    const classSelect = document.getElementById('teacherClasses');
    const selectedClasses = Array.from(classSelect.selectedOptions).map(option => option.value);
    
    const teacher = {
        id: teacherId,
        lastName: document.getElementById('teacherLastName').value,
        firstName: document.getElementById('teacherFirstName').value,
        email: document.getElementById('teacherEmail').value,
        phone: document.getElementById('teacherPhone').value,
        subjects: selectedSubjects,
        classes: selectedClasses,
        hireDate: document.getElementById('teacherHireDate').value,
        salary: parseFloat(document.getElementById('teacherSalary').value),
        specialization: document.getElementById('teacherSpecialization').value,
        diplomas: document.getElementById('teacherDiplomas').value,
        status: 'active'
    };
    
    teachers.push(teacher);
    saveData();
    
    // Mettre à jour les assignations
    teacherAssignments[teacherId] = selectedClasses;
    saveData();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('teacherModal'));
    if (modal) modal.hide();
    
    // Recharger la table
    loadTeachers();
    
    alert('Professeur enregistré avec succès!');
    addActivity(`Nouveau professeur: ${teacher.lastName} ${teacher.firstName} (${teacherId})`, 'teachers');
}

function loadTeachers() {
    const searchTerm = document.getElementById('searchTeacher').value.toLowerCase();
    const table = document.getElementById('teachersTable');
    
    // Filtrer les professeurs
    let filteredTeachers = teachers;
    
    if (searchTerm) {
        filteredTeachers = filteredTeachers.filter(t => 
            t.lastName.toLowerCase().includes(searchTerm) ||
            t.firstName.toLowerCase().includes(searchTerm) ||
            t.specialization?.toLowerCase().includes(searchTerm)
        );
    }
    
    table.innerHTML = '';
    
    if (filteredTeachers.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">Aucun professeur trouvé</td>
            </tr>
        `;
        return;
    }
    
    filteredTeachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teacher.lastName} ${teacher.firstName}</td>
            <td>${teacher.subjects.map(s => getSubjectName(s)).join(', ')}</td>
            <td>${teacher.classes.map(c => getClassName(c)).join(', ')}</td>
            <td>${teacher.phone}</td>
            <td>${teacher.email}</td>
            <td><span class="badge bg-success">${teacher.status === 'active' ? 'Actif' : 'Inactif'}</span></td>
            <td>
                <button class="btn btn-sm btn-futurist me-1" onclick="viewTeacher('${teacher.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning me-1" onclick="editTeacher('${teacher.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

function getSubjectName(subjectId) {
    for (const section in subjectsBySection) {
        const subject = subjectsBySection[section].find(s => s.id === subjectId);
        if (subject) return subject.name;
    }
    return subjectId;
}

function viewTeacher(teacherId) {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="teacherViewModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails du professeur</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Nom:</strong> ${teacher.lastName} ${teacher.firstName}</p>
                        <p><strong>Email:</strong> ${teacher.email}</p>
                        <p><strong>Téléphone:</strong> ${teacher.phone}</p>
                        <p><strong>Spécialisation:</strong> ${teacher.specialization || 'Non spécifié'}</p>
                        <p><strong>Matières enseignées:</strong> ${teacher.subjects.map(s => getSubjectName(s)).join(', ')}</p>
                        <p><strong>Classes assignées:</strong> ${teacher.classes.map(c => getClassName(c)).join(', ')}</p>
                        <p><strong>Date d'embauche:</strong> ${teacher.hireDate}</p>
                        <p><strong>Salaire:</strong> ${teacher.salary.toLocaleString()} HTG</p>
                        <p><strong>Diplômes:</strong> ${teacher.diplomas || 'Non spécifié'}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('teacherViewModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('teacherViewModal'));
    modal.show();
}

function editTeacher(teacherId) {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    // Remplir le formulaire
    document.getElementById('teacherLastName').value = teacher.lastName;
    document.getElementById('teacherFirstName').value = teacher.firstName;
    document.getElementById('teacherEmail').value = teacher.email;
    document.getElementById('teacherPhone').value = teacher.phone;
    document.getElementById('teacherHireDate').value = teacher.hireDate;
    document.getElementById('teacherSalary').value = teacher.salary;
    document.getElementById('teacherSpecialization').value = teacher.specialization || '';
    document.getElementById('teacherDiplomas').value = teacher.diplomas || '';
    
    // Sélectionner les matières
    const subjectSelect = document.getElementById('teacherSubjects');
    Array.from(subjectSelect.options).forEach(option => {
        option.selected = teacher.subjects.includes(option.value);
    });
    
    // Sélectionner les classes
    const classSelect = document.getElementById('teacherClasses');
    Array.from(classSelect.options).forEach(option => {
        option.selected = teacher.classes.includes(option.value);
    });
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
    
    // Changer le titre
    const modalTitle = document.querySelector('#teacherModal .modal-title');
    modalTitle.textContent = 'Modifier le professeur';
    
    // Changer l'action du formulaire
    const form = document.getElementById('teacherForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateTeacher(teacherId);
    };
    
    // Changer le texte du bouton
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Mettre à jour le professeur';
    
    modal.show();
}

function updateTeacher(teacherId) {
    const teacherIndex = teachers.findIndex(t => t.id === teacherId);
    if (teacherIndex === -1) return;
    
    const teacher = teachers[teacherIndex];
    
    // Récupérer les nouvelles valeurs
    const subjectSelect = document.getElementById('teacherSubjects');
    const selectedSubjects = Array.from(subjectSelect.selectedOptions).map(option => option.value);
    
    const classSelect = document.getElementById('teacherClasses');
    const selectedClasses = Array.from(classSelect.selectedOptions).map(option => option.value);
    
    // Mettre à jour les informations
    teacher.lastName = document.getElementById('teacherLastName').value;
    teacher.firstName = document.getElementById('teacherFirstName').value;
    teacher.email = document.getElementById('teacherEmail').value;
    teacher.phone = document.getElementById('teacherPhone').value;
    teacher.subjects = selectedSubjects;
    teacher.classes = selectedClasses;
    teacher.hireDate = document.getElementById('teacherHireDate').value;
    teacher.salary = parseFloat(document.getElementById('teacherSalary').value);
    teacher.specialization = document.getElementById('teacherSpecialization').value;
    teacher.diplomas = document.getElementById('teacherDiplomas').value;
    
    // Mettre à jour les assignations
    teacherAssignments[teacherId] = selectedClasses;
    
    saveData();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('teacherModal'));
    if (modal) modal.hide();
    
    // Recharger la table
    loadTeachers();
    
    alert('Professeur mis à jour avec succès!');
    addActivity(`Professeur modifié: ${teacher.lastName} ${teacher.firstName} (${teacherId})`, 'teachers');
}

function updateTeacherStats() {
    const activeTeachers = teachers.filter(t => t.status === 'active').length;
    
    // Compter les matières couvertes
    const coveredSubjects = new Set();
    teachers.forEach(teacher => {
        teacher.subjects.forEach(subject => coveredSubjects.add(subject));
    });
    
    // Compter les classes assignées
    const assignedClasses = new Set();
    teachers.forEach(teacher => {
        teacher.classes.forEach(cls => assignedClasses.add(cls));
    });
    
    document.getElementById('totalTeachers').textContent = activeTeachers;
    document.getElementById('coveredSubjects').textContent = coveredSubjects.size;
    document.getElementById('assignedClasses').textContent = assignedClasses.size;
}

function loadTeacherClasses() {
    if (currentUser.role !== 'teacher') return;
    
    const teacherClassesDiv = document.getElementById('teacherClasses');
    const teacher = teachers.find(t => t.id === currentUser.userId);
    
    if (!teacher) {
        teacherClassesDiv.innerHTML = '<p class="text-center text-muted">Aucune classe assignée</p>';
        return;
    }
    
    let html = '<div class="row">';
    teacher.classes.forEach(classId => {
        const className = getClassName(classId);
        const classStudents = students.filter(s => s.class === classId).length;
        
        html += `
            <div class="col-md-4 mb-3">
                <div class="card-futurist">
                    <div class="card-body-futurist text-center">
                        <h5>${className}</h5>
                        <p>${classStudents} élèves</p>
                        <button class="btn btn-sm btn-futurist" onclick="viewClassStudents('${classId}')">
                            Voir les élèves
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    teacherClassesDiv.innerHTML = html;
}

function loadTeacherSubjects() {
    if (currentUser.role !== 'teacher') return;
    
    const teacherSubjectsDiv = document.getElementById('teacherSubjects');
    const teacher = teachers.find(t => t.id === currentUser.userId);
    
    if (!teacher || !teacher.subjects || teacher.subjects.length === 0) {
        teacherSubjectsDiv.innerHTML = '<p class="text-center text-muted">Aucune matière assignée</p>';
        return;
    }
    
    let html = '<ul class="list-group">';
    teacher.subjects.forEach(subjectId => {
        const subjectName = getSubjectName(subjectId);
        html += `<li class="list-group-item">${subjectName}</li>`;
    });
    html += '</ul>';
    
    teacherSubjectsDiv.innerHTML = html;
}

function viewClassStudents(classId) {
    const classStudents = students.filter(s => s.class === classId);
    const classStudentsList = document.getElementById('classStudentsList');
    
    if (classStudents.length === 0) {
        classStudentsList.innerHTML = '<p class="text-center text-muted">Aucun élève dans cette classe</p>';
        return;
    }
    
    let html = `
        <h6>Élèves de ${getClassName(classId)}</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Téléphone</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    classStudents.forEach(student => {
        html += `
            <tr>
                <td>${student.lastName} ${student.firstName}</td>
                <td>${student.phone || '-'}</td>
                <td>${student.email || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-futurist" onclick="viewStudent('${student.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    classStudentsList.innerHTML = html;
}
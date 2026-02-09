// js/students.js - Gestion des élèves

// ============================
// INSCRIPTION DES ÉLÈVES
// ============================

function updateClassOptions() {
    const section = document.getElementById('studentSection').value;
    const classSelect = document.getElementById('studentClass');
    
    classSelect.innerHTML = '<option value="">Sélectionner</option>';
    
    if (section && classStructure[section]) {
        classStructure[section].forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
    }
    
    updateClassAvailability();
}

function updateClassAvailability() {
    const classId = document.getElementById('studentClass').value;
    const availabilityDiv = document.getElementById('classAvailability');
    
    if (!classId) {
        availabilityDiv.innerHTML = '';
        return;
    }
    
    const studentCount = students.filter(s => s.class === classId).length;
    const limit = classLimits[classId] || 40;
    const availability = limit - studentCount;
    
    if (availability > 0) {
        availabilityDiv.innerHTML = `<span class="text-success">${availability} place${availability !== 1 ? 's' : ''} disponible${availability !== 1 ? 's' : ''}</span>`;
    } else {
        availabilityDiv.innerHTML = `<span class="text-danger">Classe complète! Contactez l'administration.</span>`;
    }
}

function registerStudent() {
    // Vérifier la disponibilité de la classe
    const classId = document.getElementById('studentClass').value;
    const studentCount = students.filter(s => s.class === classId).length;
    const limit = classLimits[classId] || 40;
    
    if (studentCount >= limit) {
        alert('Cette classe est complète! Veuillez choisir une autre classe.');
        return;
    }
    
    // Générer un ID d'élève
    const studentId = 'STU' + (students.length + 1).toString().padStart(3, '0');
    
    const student = {
        id: studentId,
        lastName: document.getElementById('studentLastName').value,
        firstName: document.getElementById('studentFirstName').value,
        birthDate: document.getElementById('studentBirthDate').value,
        birthPlace: document.getElementById('studentBirthPlace').value,
        gender: document.getElementById('studentGender').value,
        nationality: document.getElementById('studentNationality').value,
        class: classId,
        section: document.getElementById('studentSection').value,
        address: document.getElementById('studentAddress').value,
        phone: document.getElementById('studentPhone').value,
        email: document.getElementById('studentEmail').value,
        fatherName: document.getElementById('studentFatherName').value,
        motherName: document.getElementById('studentMotherName').value,
        guardian: document.getElementById('studentGuardian').value,
        guardianPhone: document.getElementById('studentGuardianPhone').value,
        medical: document.getElementById('studentMedical').value,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };
    
    students.push(student);
    saveData();
    
    // Réinitialiser le formulaire
    document.getElementById('inscriptionForm').reset();
    
    // Mettre à jour l'affichage
    loadRecentStudents();
    updateInscriptionStats();
    updateStudentSelectors();
    
    alert(`Élève inscrit avec succès! Matricule: ${studentId}`);
    addActivity(`Nouvel élève inscrit: ${student.lastName} ${student.firstName} (${studentId})`, 'inscription');
}

function loadRecentStudents() {
    const table = document.getElementById('recentStudentsTable');
    table.innerHTML = '';
    
    // Trier par date d'inscription (plus récent d'abord)
    const recentStudents = [...students]
        .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
        .slice(0, 5);
    
    if (recentStudents.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">Aucun élève inscrit</td>
            </tr>
        `;
        return;
    }
    
    recentStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.lastName} ${student.firstName}</td>
            <td>${getClassName(student.class)}</td>
            <td>${student.registrationDate}</td>
            <td>
                <button class="btn btn-sm btn-futurist" onclick="viewStudent('${student.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

function updateInscriptionStats() {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().getMonth() + 1;
    const thisYear = new Date().getFullYear();
    
    const newToday = students.filter(s => s.registrationDate === today).length;
    const newThisMonth = students.filter(s => {
        const date = new Date(s.registrationDate);
        return date.getMonth() + 1 === thisMonth && date.getFullYear() === thisYear;
    }).length;
    
    document.getElementById('totalStudentsCount').textContent = students.length;
    document.getElementById('newStudentsToday').textContent = newToday;
    document.getElementById('newStudentsMonth').textContent = newThisMonth;
}

// ============================
// GESTION DES ÉLÈVES
// ============================

function loadStudents(page = 1, pageSize = 10) {
    const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
    const filterClass = document.getElementById('filterStudentClass').value;
    
    // Filtrer les élèves
    let filteredStudents = students;
    
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(s => 
            s.lastName.toLowerCase().includes(searchTerm) ||
            s.firstName.toLowerCase().includes(searchTerm) ||
            s.id.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filterClass) {
        filteredStudents = filteredStudents.filter(s => s.class === filterClass);
    }
    
    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredStudents.length);
    const pageStudents = filteredStudents.slice(startIndex, endIndex);
    
    // Remplir la table
    const table = document.getElementById('studentsTable');
    table.innerHTML = '';
    
    if (pageStudents.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">Aucun élève trouvé</td>
            </tr>
        `;
    } else {
        pageStudents.forEach(student => {
            // Calculer le statut de paiement
            const paymentStatus = getStudentPaymentStatus(student.id);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.lastName} ${student.firstName}</td>
                <td>${getClassName(student.class)}</td>
                <td>${student.phone || '-'}</td>
                <td>${student.registrationDate}</td>
                <td>
                    <span class="payment-indicator ${paymentStatus.class}"></span>
                    ${paymentStatus.text}
                </td>
                <td>
                    <button class="btn btn-sm btn-futurist me-1" onclick="viewStudent('${student.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning me-1" onclick="editStudent('${student.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            table.appendChild(row);
        });
    }
    
    // Mettre à jour la pagination
    updatePagination('students', page, totalPages, filteredStudents.length);
}

function getStudentPaymentStatus(studentId) {
    // Cette fonction devrait calculer le statut de paiement réel
    // Pour l'instant, retourne un statut simulé
    const statuses = [
        { class: 'payment-paid', text: 'Payé' },
        { class: 'payment-partial', text: 'Partiel' },
        { class: 'payment-unpaid', text: 'Impayé' }
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
}

function updatePagination(type, currentPage, totalPages, totalItems) {
    const infoDiv = document.getElementById(`${type}PaginationInfo`);
    const paginationDiv = document.getElementById(`${type}Pagination`);
    
    if (!infoDiv || !paginationDiv) return;
    
    // Mettre à jour les informations
    const startItem = (currentPage - 1) * 10 + 1;
    const endItem = Math.min(currentPage * 10, totalItems);
    infoDiv.textContent = `Affichage ${startItem}-${endItem} sur ${totalItems}`;
    
    // Mettre à jour la pagination
    paginationDiv.innerHTML = '';
    
    // Bouton précédent
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="${type === 'students' ? 'loadStudents(' + (currentPage - 1) + ')' : 'return false'}">
            Précédent
        </a>
    `;
    paginationDiv.appendChild(prevLi);
    
    // Numéros de page
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `
            <a class="page-link" href="#" onclick="${type === 'students' ? 'loadStudents(' + i + ')' : 'return false'}">
                ${i}
            </a>
        `;
        paginationDiv.appendChild(pageLi);
    }
    
    // Bouton suivant
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="${type === 'students' ? 'loadStudents(' + (currentPage + 1) + ')' : 'return false'}">
            Suivant
        </a>
    `;
    paginationDiv.appendChild(nextLi);
}

function viewStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="studentModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de l'élève</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p><strong>Matricule:</strong> ${student.id}</p>
                                <p><strong>Nom:</strong> ${student.lastName}</p>
                                <p><strong>Prénom:</strong> ${student.firstName}</p>
                                <p><strong>Date de naissance:</strong> ${student.birthDate}</p>
                                <p><strong>Lieu de naissance:</strong> ${student.birthPlace}</p>
                                <p><strong>Sexe:</strong> ${student.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                                <p><strong>Nationalité:</strong> ${student.nationality}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Classe:</strong> ${getClassName(student.class)}</p>
                                <p><strong>Section:</strong> ${getSectionName(student.section)}</p>
                                <p><strong>Adresse:</strong> ${student.address}</p>
                                <p><strong>Téléphone:</strong> ${student.phone || '-'}</p>
                                <p><strong>Email:</strong> ${student.email || '-'}</p>
                                <p><strong>Date d'inscription:</strong> ${student.registrationDate}</p>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <h6>Parents/Tuteur</h6>
                                <p><strong>Père:</strong> ${student.fatherName || '-'}</p>
                                <p><strong>Mère:</strong> ${student.motherName || '-'}</p>
                                <p><strong>Tuteur légal:</strong> ${student.guardian || '-'}</p>
                                <p><strong>Téléphone tuteur:</strong> ${student.guardianPhone || '-'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Informations supplémentaires</h6>
                                <p><strong>Antécédents médicaux:</strong></p>
                                <p>${student.medical || 'Aucun'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-futurist" onclick="editStudent('${student.id}')">
                            Modifier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('studentModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('studentModal'));
    modal.show();
}

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Remplir le formulaire d'inscription avec les données de l'élève
    document.getElementById('studentLastName').value = student.lastName;
    document.getElementById('studentFirstName').value = student.firstName;
    document.getElementById('studentBirthDate').value = student.birthDate;
    document.getElementById('studentBirthPlace').value = student.birthPlace;
    document.getElementById('studentGender').value = student.gender;
    document.getElementById('studentNationality').value = student.nationality;
    document.getElementById('studentClass').value = student.class;
    document.getElementById('studentSection').value = student.section;
    document.getElementById('studentAddress').value = student.address;
    document.getElementById('studentPhone').value = student.phone || '';
    document.getElementById('studentEmail').value = student.email || '';
    document.getElementById('studentFatherName').value = student.fatherName || '';
    document.getElementById('studentMotherName').value = student.motherName || '';
    document.getElementById('studentGuardian').value = student.guardian || '';
    document.getElementById('studentGuardianPhone').value = student.guardianPhone || '';
    document.getElementById('studentMedical').value = student.medical || '';
    
    // Afficher la section inscription
    showSection('inscription');
    
    // Ajouter un bouton pour mettre à jour
    const form = document.getElementById('inscriptionForm');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Changer le texte du bouton
    submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Mettre à jour l\'élève';
    
    // Stocker l'ID de l'élève à modifier
    form.dataset.editId = studentId;
    
    // Changer l'action du formulaire
    form.onsubmit = function(e) {
        e.preventDefault();
        updateStudent(studentId);
    };
    
    // Scroll to form
    form.scrollIntoView();
}

function updateStudent(studentId) {
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return;
    
    const student = students[studentIndex];
    
    // Mettre à jour les informations
    student.lastName = document.getElementById('studentLastName').value;
    student.firstName = document.getElementById('studentFirstName').value;
    student.birthDate = document.getElementById('studentBirthDate').value;
    student.birthPlace = document.getElementById('studentBirthPlace').value;
    student.gender = document.getElementById('studentGender').value;
    student.nationality = document.getElementById('studentNationality').value;
    student.class = document.getElementById('studentClass').value;
    student.section = document.getElementById('studentSection').value;
    student.address = document.getElementById('studentAddress').value;
    student.phone = document.getElementById('studentPhone').value;
    student.email = document.getElementById('studentEmail').value;
    student.fatherName = document.getElementById('studentFatherName').value;
    student.motherName = document.getElementById('studentMotherName').value;
    student.guardian = document.getElementById('studentGuardian').value;
    student.guardianPhone = document.getElementById('studentGuardianPhone').value;
    student.medical = document.getElementById('studentMedical').value;
    
    saveData();
    
    // Réinitialiser le formulaire
    document.getElementById('inscriptionForm').reset();
    
    // Restaurer le bouton original
    const form = document.getElementById('inscriptionForm');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Inscrire l\'élève';
    form.onsubmit = function(e) {
        e.preventDefault();
        registerStudent();
    };
    delete form.dataset.editId;
    
    // Mettre à jour les affichages
    loadRecentStudents();
    loadStudents();
    updateStudentSelectors();
    
    alert('Élève mis à jour avec succès!');
    addActivity(`Élève modifié: ${student.lastName} ${student.firstName} (${studentId})`, 'students');
}

function deleteStudent(studentId) {
    if (!confirm('Supprimer cet élève? Cette action est irréversible.')) {
        return;
    }
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Supprimer l'élève
    students = students.filter(s => s.id !== studentId);
    saveData();
    
    // Mettre à jour les affichages
    loadRecentStudents();
    loadStudents();
    updateStudentSelectors();
    updateDashboard();
    
    alert('Élève supprimé avec succès!');
    addActivity(`Élève supprimé: ${student.lastName} ${student.firstName} (${studentId})`, 'students');
}

function exportStudents() {
    // Simuler l'exportation des données
    const dataStr = JSON.stringify(students, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `eleves_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Données exportées avec succès!');
    addActivity('Exportation de la liste des élèves', 'export');
}
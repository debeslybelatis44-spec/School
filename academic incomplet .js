// js/academic.js - Gestion académique (notes, bulletins, devoirs, présences, discipline)

// ============================
// GESTION DES PRÉSENCES
// ============================

function loadClassForPresence() {
    const classId = document.getElementById('presenceClass').value;
    const date = document.getElementById('presenceDate').value;
    
    if (!classId || !date) {
        alert('Veuillez sélectionner une classe et une date');
        return;
    }
    
    const classStudents = students.filter(s => s.class === classId);
    
    if (classStudents.length === 0) {
        document.getElementById('presencePlaceholder').innerHTML = 
            '<p class="text-center text-muted">Aucun élève dans cette classe</p>';
        document.getElementById('presenceFormContainer').style.display = 'none';
        return;
    }
    
    // Remplir le formulaire de présence
    const table = document.getElementById('presenceStudentsTable');
    table.innerHTML = '';
    
    classStudents.forEach(student => {
        // Vérifier si une présence existe déjà pour cette date
        const existingPresence = presences.find(p => 
            p.studentId === student.id && p.date === date
        );
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.lastName} ${student.firstName}</td>
            <td class="text-center">
                <input type="radio" name="presence-${student.id}" value="present" 
                       ${existingPresence?.status === 'present' ? 'checked' : ''}>
            </td>
            <td class="text-center">
                <input type="radio" name="presence-${student.id}" value="absent"
                       ${existingPresence?.status === 'absent' ? 'checked' : ''}>
            </td>
            <td class="text-center">
                <input type="radio" name="presence-${student.id}" value="late"
                       ${existingPresence?.status === 'late' ? 'checked' : ''}>
            </td>
            <td>
                <input type="text" class="form-control form-control-futurist" 
                       name="justification-${student.id}" 
                       value="${existingPresence?.justification || ''}"
                       placeholder="Justification">
            </td>
            <td>
                <input type="text" class="form-control form-control-futurist" 
                       name="remarks-${student.id}" 
                       value="${existingPresence?.remarks || ''}"
                       placeholder="Remarques">
            </td>
        `;
        table.appendChild(row);
    });
    
    document.getElementById('presencePlaceholder').style.display = 'none';
    document.getElementById('presenceFormContainer').style.display = 'block';
}

function savePresences() {
    const classId = document.getElementById('presenceClass').value;
    const date = document.getElementById('presenceDate').value;
    const classStudents = students.filter(s => s.class === classId);
    
    let presencesUpdated = 0;
    
    classStudents.forEach(student => {
        const presenceRadio = document.querySelector(`input[name="presence-${student.id}"]:checked`);
        const justification = document.querySelector(`input[name="justification-${student.id}"]`).value;
        const remarks = document.querySelector(`input[name="remarks-${student.id}"]`).value;
        
        if (!presenceRadio) return;
        
        const status = presenceRadio.value;
        
        // Chercher une présence existante
        const existingIndex = presences.findIndex(p => 
            p.studentId === student.id && p.date === date
        );
        
        const presenceData = {
            id: `PRES${Date.now()}_${student.id}`,
            studentId: student.id,
            studentName: `${student.lastName} ${student.firstName}`,
            classId: classId,
            date: date,
            status: status,
            justification: justification,
            remarks: remarks,
            recordedBy: currentUser.userId,
            recordedAt: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            // Mettre à jour la présence existante
            presences[existingIndex] = presenceData;
        } else {
            // Ajouter une nouvelle présence
            presences.push(presenceData);
        }
        
        presencesUpdated++;
    });
    
    saveData();
    
    // Recharger l'historique
    loadPresenceHistory();
    
    alert(`${presencesUpdated} présence(s) enregistrée(s) avec succès!`);
    addActivity(`Présences enregistrées pour la classe ${classId} (${date})`, 'presence');
}

function loadPresenceHistory() {
    const classId = document.getElementById('presenceHistoryClass').value;
    const table = document.getElementById('presenceHistoryTable');
    
    // Grouper les présences par date et classe
    const presenceByDate = {};
    
    presences.forEach(presence => {
        if (classId && presence.classId !== classId) return;
        
        if (!presenceByDate[presence.date]) {
            presenceByDate[presence.date] = {
                date: presence.date,
                classId: presence.classId,
                className: getClassName(presence.classId),
                presents: 0,
                absents: 0,
                lates: 0,
                total: 0
            };
        }
        
        presenceByDate[presence.date].total++;
        if (presence.status === 'present') presenceByDate[presence.date].presents++;
        if (presence.status === 'absent') presenceByDate[presence.date].absents++;
        if (presence.status === 'late') presenceByDate[presence.date].lates++;
    });
    
    const presenceArray = Object.values(presenceByDate)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    table.innerHTML = '';
    
    if (presenceArray.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">Aucune présence enregistrée</td>
            </tr>
        `;
        return;
    }
    
    presenceArray.forEach(presence => {
        const presenceRate = presence.total > 0 ? 
            Math.round((presence.presents / presence.total) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${presence.date}</td>
            <td>${presence.className}</td>
            <td>${presence.presents}</td>
            <td>${presence.absents}</td>
            <td>${presence.lates}</td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${presenceRate >= 80 ? 'bg-success' : presenceRate >= 60 ? 'bg-warning' : 'bg-danger'}" 
                         style="width: ${presenceRate}%" role="progressbar">
                        ${presenceRate}%
                    </div>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-futurist" onclick="viewPresenceDetails('${presence.date}', '${presence.classId}')">
                    Détails
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

function viewPresenceDetails(date, classId) {
    const classPresences = presences.filter(p => 
        p.date === date && p.classId === classId
    );
    
    if (classPresences.length === 0) return;
    
    let html = `
        <div class="modal fade modal-futurist" id="presenceDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails des présences - ${date}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h6>Classe: ${getClassName(classId)}</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Élève</th>
                                        <th>Statut</th>
                                        <th>Justification</th>
                                        <th>Remarques</th>
                                    </tr>
                                </thead>
                                <tbody>
    `;
    
    classPresences.forEach(presence => {
        const statusBadge = presence.status === 'present' ? 'bg-success' :
                          presence.status === 'absent' ? 'bg-danger' : 'bg-warning';
        const statusText = presence.status === 'present' ? 'Présent' :
                         presence.status === 'absent' ? 'Absent' : 'En retard';
        
        html += `
            <tr>
                <td>${presence.studentName}</td>
                <td><span class="badge ${statusBadge}">${statusText}</span></td>
                <td>${presence.justification || '-'}</td>
                <td>${presence.remarks || '-'}</td>
            </tr>
        `;
    });
    
    html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('presenceDetailsModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', html);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('presenceDetailsModal'));
    modal.show();
}

// ============================
// GESTION DE LA DISCIPLINE
// ============================

function showSanctionModal() {
    const modal = new bootstrap.Modal(document.getElementById('sanctionModal'));
    
    // Réinitialiser le formulaire
    document.getElementById('sanctionForm').reset();
    document.getElementById('sanctionDate').value = new Date().toISOString().split('T')[0];
    
    modal.show();
}

function saveSanction() {
    const studentId = document.getElementById('sanctionStudent').value;
    
    if (!studentId) {
        alert('Veuillez sélectionner un élève');
        return;
    }
    
    const sanctionId = 'SAN' + (sanctions.length + 1).toString().padStart(3, '0');
    const student = students.find(s => s.id === studentId);
    
    const sanction = {
        id: sanctionId,
        studentId: studentId,
        studentName: `${student.lastName} ${student.firstName}`,
        type: document.getElementById('sanctionType').value,
        date: document.getElementById('sanctionDate').value,
        description: document.getElementById('sanctionDescription').value,
        duration: document.getElementById('sanctionDuration').value,
        measures: document.getElementById('sanctionMeasures').value,
        status: 'active',
        issuedBy: currentUser.userId,
        issuedAt: new Date().toISOString()
    };
    
    sanctions.push(sanction);
    saveData();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('sanctionModal'));
    if (modal) modal.hide();
    
    // Recharger la table
    loadSanctions();
    updateDisciplineStats();
    
    alert('Sanction enregistrée avec succès!');
    addActivity(`Sanction donnée à ${student.lastName} ${student.firstName}`, 'discipline');
}

function loadSanctions() {
    const searchTerm = document.getElementById('searchSanction').value.toLowerCase();
    const table = document.getElementById('sanctionsTable');
    
    // Filtrer les sanctions
    let filteredSanctions = sanctions;
    
    if (searchTerm) {
        filteredSanctions = filteredSanctions.filter(s => 
            s.studentName.toLowerCase().includes(searchTerm) ||
            s.type.toLowerCase().includes(searchTerm) ||
            s.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Trier par date (plus récent d'abord)
    filteredSanctions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    table.innerHTML = '';
    
    if (filteredSanctions.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">Aucune sanction trouvée</td>
            </tr>
        `;
        return;
    }
    
    filteredSanctions.forEach(sanction => {
        const typeBadge = sanction.type === 'warning' ? 'bg-warning' :
                        sanction.type === 'detention' ? 'bg-orange' :
                        sanction.type === 'suspension' ? 'bg-danger' : 'bg-dark';
        
        const typeText = sanction.type === 'warning' ? 'Avertissement' :
                       sanction.type === 'detention' ? 'Retenue' :
                       sanction.type === 'suspension' ? 'Suspension' : 'Exclusion';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sanction.studentName}</td>
            <td><span class="badge ${typeBadge}">${typeText}</span></td>
            <td>${sanction.date}</td>
            <td>${sanction.description.length > 50 ? sanction.description.substring(0, 50) + '...' : sanction.description}</td>
            <td><span class="badge ${sanction.status === 'active' ? 'bg-warning' : 'bg-secondary'}">${sanction.status === 'active' ? 'Active' : 'Archivée'}</span></td>
            <td>
                <button class="btn btn-sm btn-futurist" onclick="viewSanction('${sanction.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

function viewSanction(sanctionId) {
    const sanction = sanctions.find(s => s.id === sanctionId);
    if (!sanction) return;
    
    const typeText = sanction.type === 'warning' ? 'Avertissement' :
                   sanction.type === 'detention' ? 'Retenue' :
                   sanction.type === 'suspension' ? 'Suspension' : 'Exclusion';
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="sanctionViewModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de la sanction</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Élève:</strong> ${sanction.studentName}</p>
                        <p><strong>Type:</strong> ${typeText}</p>
                        <p><strong>Date:</strong> ${sanction.date}</p>
                        <p><strong>Description:</strong></p>
                        <p>${sanction.description}</p>
                        ${sanction.duration ? `<p><strong>Durée:</strong> ${sanction.duration}</p>` : ''}
                        ${sanction.measures ? `<p><strong>Mesures correctives:</strong> ${sanction.measures}</p>` : ''}
                        <p><strong>Statut:</strong> ${sanction.status === 'active' ? 'Active' : 'Archivée'}</p>
                        <p><strong>Émise par:</strong> ${sanction.issuedBy}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        ${sanction.status === 'active' ? `
                        <button type="button" class="btn btn-danger" onclick="archiveSanction('${sanction.id}')">
                            Archiver
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('sanctionViewModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('sanctionViewModal'));
    modal.show();
}

function archiveSanction(sanctionId) {
    const sanction = sanctions.find(s => s.id === sanctionId);
    if (!sanction) return;
    
    sanction.status = 'archived';
    saveData();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('sanctionViewModal'));
    if (modal) modal.hide();
    
    // Recharger la table
    loadSanctions();
    
    alert('Sanction archivée!');
    addActivity(`Sanction archivée: ${sanction.id}`, 'discipline');
}

function updateDisciplineStats() {
    const statsDiv = document.getElementById('disciplineStats');
    
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().getMonth() + 1;
    const thisYear = new Date().getFullYear();
    
    const todaySanctions = sanctions.filter(s => s.date === today).length;
    const thisMonthSanctions = sanctions.filter(s => {
        const date = new Date(s.date);
        return date.getMonth() + 1 === thisMonth && date.getFullYear() === thisYear;
    }).length;
    
    const activeSanctions = sanctions.filter(s => s.status === 'active').length;
    const warnings = sanctions.filter(s => s.type === 'warning').length;
    const detentions = sanctions.filter(s => s.type === 'detention').length;
    const suspensions = sanctions.filter(s => s.type === 'suspension').length;
    const exclusions = sanctions.filter(s => s.type === 'exclusion').length;
    
    statsDiv.innerHTML = `
        <div class="text-center mb-3">
            <h4>${activeSanctions}</h4>
            <p class="text-light small">Sanctions actives</p>
        </div>
        <div class="row text-center">
            <div class="col-6 mb-2">
                <small>Aujourd'hui</small>
                <div><strong>${todaySanctions}</strong></div>
            </div>
            <div class="col-6 mb-2">
                <small>Ce mois</small>
                <div><strong>${thisMonthSanctions}</strong></div>
            </div>
        </div>
        <hr>
        <div>
            <p><strong>Répartition par type:</strong></p>
            <p><span class="badge bg-warning me-2">Avertissements:</span> ${warnings}</p>
            <p><span class="badge bg-orange me-2">Retenues:</span> ${detentions}</p>
            <p><span class="badge bg-danger me-2">Suspensions:</span> ${suspensions}</p>
            <p><span class="badge bg-dark me-2">Exclusions:</span> ${exclusions}</p>
        </div>
    `;
}

// ============================
// GESTION DES DEVOIRS
// ============================

function createHomework() {
    const classId = document.getElementById('homeworkClass').value;
    const subjectId = document.getElementById('homeworkSubject').value;
    
    if (!classId || !subjectId) {
        alert('Veuillez sélectionner une classe et une matière');
        return;
    }
    
    const homeworkId = 'HW' + (homework.length + 1).toString().padStart(3, '0');
    const subject = getSubjectById(subjectId);
    
    const newHomework = {
        id: homeworkId,
        classId: classId,
        className: getClassName(classId),
        subjectId: subjectId,
        subjectName: subject ? subject.name : subjectId,
        title: document.getElementById('homeworkTitle').value,
        description: document.getElementById('homeworkDescription').value,
        assignDate: document.getElementById('homeworkAssignDate').value,
        dueDate: document.getElementById('homeworkDueDate').value,
        maxGrade: parseInt(document.getElementById('homeworkMaxGrade').value),
        status: 'assigned',
        createdBy: currentUser.userId,
        createdAt: new Date().toISOString()
    };
    
    homework.push(newHomework);
    saveData();
    
    // Réinitialiser le formulaire
    document.getElementById('homeworkForm').reset();
    
    // Recharger la table
    loadHomework();
    
    alert('Devoir créé avec succès!');
    addActivity(`Devoir créé: ${newHomework.title} (${newHomework.className})`, 'homework');
}

function getSubjectById(subjectId) {
    for (const section in subjectsBySection) {
        const subject = subjectsBySection[section].find(s => s.id === subjectId);
        if (subject) return subject;
    }
    return null;
}

function loadHomework() {
    const table = document.getElementById('homeworkTable');
    
    // Trier par date de remise (plus proche d'abord)
    const sortedHomework = [...homework].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    table.innerHTML = '';
    
    if (sortedHomework.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">Aucun devoir assigné</td>
            </tr>
        `;
        return;
    }
    
    sortedHomework.forEach(hw => {
        // Vérifier le statut
        const today = new Date();
        const dueDate = new Date(hw.dueDate);
        let statusText, statusClass;
        
        if (hw.status === 'graded') {
            statusText = 'Noté';
            statusClass = 'badge bg-success';
        } else if (dueDate < today) {
            statusText = 'En retard';
            statusClass = 'badge bg-danger';
        } else {
            statusText = 'En cours';
            statusClass = 'badge bg-warning';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hw.className}</td>
            <td>${hw.subjectName}</td>
            <td>${hw.title}</td>
            <td>${hw.dueDate}</td>
            <td>${hw.maxGrade}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-sm btn-futurist me-1" onclick="viewHomework('${hw.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="gradeHomework('${hw.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
    
    // Mettre à jour le sélecteur de devoirs pour les notes
    updateHomeworkForGradesSelector();
}

function viewHomework(homeworkId) {
    const hw = homework.find(h => h.id === homeworkId);
    if (!hw) return;
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="homeworkViewModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails du devoir</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Classe:</strong> ${hw.className}</p>
                        <p><strong>Matière:</strong> ${hw.subjectName}</p>
                        <p><strong>Titre:</strong> ${hw.title}</p>
                        <p><strong>Description:</strong></p>
                        <p>${hw.description}</p>
                        <p><strong>Date d'attribution:</strong> ${hw.assignDate}</p>
                        <p><strong>Date de remise:</strong> ${hw.dueDate}</p>
                        <p><strong>Note maximale:</strong> ${hw.maxGrade}</p>
                        <p><strong>Statut:</strong> ${hw.status === 'graded' ? 'Noté' : 'En cours'}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('homeworkViewModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('homeworkViewModal'));
    modal.show();
}

function gradeHomework(homeworkId) {
    const hw = homework.find(h => h.id === homeworkId);
    if (!hw) return;
    
    // Sélectionner le devoir dans le sélecteur
    const select = document.getElementById('selectHomeworkForGrades');
    select.value = homeworkId;
    
    // Charger les notes pour ce devoir
    loadHomeworkForGrades();
    
    // Afficher la section devoirs si ce n'est pas déjà fait
    showSection('homework');
    
    // Scroll to grades section
    document.getElementById('homeworkGradesSection').scrollIntoView();
}

function updateHomeworkForGradesSelector() {
    const select = document.getElementById('selectHomeworkForGrades');
    select.innerHTML = '<option value="">Sélectionner un devoir</option>';
    
    homework.forEach(hw => {
        const option = document.createElement('option');
        option.value = hw.id;
        option.textContent = `${hw.title} - ${hw.className} (${hw.dueDate})`;
        select.appendChild(option);
    });
}

function loadHomeworkForGrades() {
    const homeworkId = document.getElementById('selectHomeworkForGrades').value;
    if (!homeworkId) return;
    
    const hw = homework.find(h => h.id === homeworkId);
    if (!hw) return;
    
    const classStudents = students.filter(s => s.class === hw.classId);
    
    // Remplir le titre
    document.getElementById('homeworkGradesTitle').textContent = `Notes pour: ${hw.title} (${hw.className})`;
    document.getElementById('homeworkMaxDisplay').textContent = hw.maxGrade;
    
    // Remplir la table des notes
    const table = document.getElementById('homeworkGradesList');
    table.innerHTML = '';
    
    classStudents.forEach(student => {
        // Chercher une note existante
        const existingGrade = homeworkGrades.find(g => 
            g.homeworkId === homeworkId && g.studentId === student.id
        );
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.lastName} ${student.firstName}</td>
            <td>
                <input type="number" class="form-control form-control-futurist grade-input" 
                       id="grade-${student.id}" 
                       value="${existingGrade?.grade || ''}"
                       min="0" max="${hw.maxGrade}" step="0.5">
            </td>
            <td>
                <input type="text" class="form-control form-control-futurist" 
                       id="remarks-${student.id}" 
                       value="${existingGrade?.remarks || ''}"
                       placeholder="Remarques">
            </td>
            <td>
                ${existingGrade ? `
                <button class="btn btn-sm btn-danger" onclick="deleteHomeworkGrade('${homeworkId}', '${student.id}')">
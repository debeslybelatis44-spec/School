// js/academic.js - Gestion académique (notes, bulletins, devoirs, présences, discipline)

// ============================
// GESTION DES PRÉSENCES (déjà présent)
// ============================

// ... (le code existant pour les présences reste inchangé jusqu'à la fonction loadHomeworkForGrades) ...

function deleteHomeworkGrade(homeworkId, studentId) {
    if (!confirm('Supprimer cette note de devoir?')) {
        return;
    }
    
    const index = homeworkGrades.findIndex(g => 
        g.homeworkId === homeworkId && g.studentId === studentId
    );
    
    if (index !== -1) {
        homeworkGrades.splice(index, 1);
        saveData();
        
        // Recharger les notes
        loadHomeworkForGrades();
        
        alert('Note de devoir supprimée!');
        addActivity(`Note de devoir supprimée pour l'élève ${studentId}`, 'homework');
    }
}

function saveHomeworkGrades() {
    const homeworkId = document.getElementById('selectHomeworkForGrades').value;
    if (!homeworkId) return;
    
    const hw = homework.find(h => h.id === homeworkId);
    if (!hw) return;
    
    const classStudents = students.filter(s => s.class === hw.classId);
    let gradesSaved = 0;
    
    classStudents.forEach(student => {
        const gradeInput = document.getElementById(`grade-${student.id}`);
        const remarksInput = document.getElementById(`remarks-${student.id}`);
        
        if (!gradeInput || gradeInput.value === '') return;
        
        const gradeValue = parseFloat(gradeInput.value);
        
        // Chercher une note existante
        const existingIndex = homeworkGrades.findIndex(g => 
            g.homeworkId === homeworkId && g.studentId === student.id
        );
        
        const gradeData = {
            id: `HWG${Date.now()}_${student.id}`,
            homeworkId: homeworkId,
            studentId: student.id,
            studentName: `${student.lastName} ${student.firstName}`,
            grade: gradeValue,
            remarks: remarksInput.value,
            gradedBy: currentUser.userId,
            gradedAt: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            homeworkGrades[existingIndex] = gradeData;
        } else {
            homeworkGrades.push(gradeData);
        }
        
        gradesSaved++;
    });
    
    saveData();
    
    // Mettre à jour le statut du devoir
    hw.status = 'graded';
    saveData();
    
    // Recharger les tables
    loadHomework();
    loadHomeworkForGrades();
    
    alert(`${gradesSaved} note(s) enregistrée(s) avec succès!`);
    addActivity(`Notes de devoir enregistrées pour ${hw.title}`, 'grades');
}

// ============================
// SAISIE DES NOTES
// ============================

function loadStudentsForGrades() {
    const classId = document.getElementById('gradeClass').value;
    const section = document.getElementById('gradeSection').value;
    const subjectId = document.getElementById('gradeSubject').value;
    const gradeType = document.getElementById('gradeType').value;
    const gradeMax = document.getElementById('gradeMax').value;
    
    if (!classId || !subjectId) {
        alert('Veuillez sélectionner une classe et une matière');
        return;
    }
    
    const classStudents = students.filter(s => s.class === classId);
    const subject = getSubjectById(subjectId);
    
    // Mettre à jour le titre
    document.getElementById('gradesTitle').textContent = 
        `Saisie des notes - ${subject ? subject.name : subjectId} - ${getClassName(classId)}`;
    document.getElementById('maxGradeDisplay').textContent = gradeMax;
    
    // Remplir la table
    const table = document.getElementById('gradesStudentsList');
    table.innerHTML = '';
    
    classStudents.forEach(student => {
        // Chercher les notes existantes
        const existingGrade = grades.find(g => 
            g.studentId === student.id && 
            g.subjectId === subjectId && 
            g.type === gradeType
        );
        
        // Chercher les notes de devoir
        const studentHomework = homeworkGrades.filter(g => 
            g.studentId === student.id
        );
        
        // Calculer la moyenne des devoirs
        let homeworkAverage = 0;
        if (studentHomework.length > 0) {
            const total = studentHomework.reduce((sum, h) => sum + h.grade, 0);
            homeworkAverage = total / studentHomework.length;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.lastName} ${student.firstName}</td>
            <td>
                <input type="number" class="form-control form-control-futurist grade-input" 
                       id="grade-${student.id}" 
                       value="${existingGrade?.grade || ''}"
                       min="0" max="${gradeMax}" step="0.5">
            </td>
            <td>${homeworkAverage.toFixed(2)}</td>
            <td id="total-${student.id}">${existingGrade?.grade || '0.00'}</td>
            <td>
                <button class="btn btn-sm btn-futurist" onclick="calculateStudentTotal('${student.id}')">
                    Calculer
                </button>
            </td>
        `;
        table.appendChild(row);
    });
    
    document.getElementById('gradesPlaceholder').style.display = 'none';
    document.getElementById('gradesEntry').style.display = 'block';
}

function calculateStudentTotal(studentId) {
    const gradeInput = document.getElementById(`grade-${studentId}`);
    const totalCell = document.getElementById(`total-${studentId}`);
    
    if (!gradeInput || !gradeInput.value) {
        totalCell.textContent = '0.00';
        return;
    }
    
    const grade = parseFloat(gradeInput.value);
    const gradeMax = document.getElementById('gradeMax').value;
    const coefficient = document.getElementById('gradeCoefficient').value;
    
    // Calculer la note pondérée
    const weightedGrade = (grade / gradeMax) * 20 * coefficient;
    
    totalCell.textContent = weightedGrade.toFixed(2);
}

function saveGrades() {
    const classId = document.getElementById('gradeClass').value;
    const subjectId = document.getElementById('gradeSubject').value;
    const gradeType = document.getElementById('gradeType').value;
    const coefficient = parseFloat(document.getElementById('gradeCoefficient').value);
    const gradeMax = parseFloat(document.getElementById('gradeMax').value);
    
    if (!classId || !subjectId) return;
    
    const classStudents = students.filter(s => s.class === classId);
    let gradesSaved = 0;
    
    classStudents.forEach(student => {
        const gradeInput = document.getElementById(`grade-${student.id}`);
        
        if (!gradeInput || gradeInput.value === '') return;
        
        const gradeValue = parseFloat(gradeInput.value);
        
        // Chercher une note existante
        const existingIndex = grades.findIndex(g => 
            g.studentId === student.id && 
            g.subjectId === subjectId && 
            g.type === gradeType
        );
        
        const gradeData = {
            id: `GRD${Date.now()}_${student.id}`,
            studentId: student.id,
            studentName: `${student.lastName} ${student.firstName}`,
            classId: classId,
            subjectId: subjectId,
            subjectName: getSubjectName(subjectId),
            type: gradeType,
            grade: gradeValue,
            maxGrade: gradeMax,
            coefficient: coefficient,
            weightedGrade: (gradeValue / gradeMax) * 20 * coefficient,
            recordedBy: currentUser.userId,
            recordedAt: new Date().toISOString(),
            trimester: getCurrentTrimester()
        };
        
        if (existingIndex !== -1) {
            grades[existingIndex] = gradeData;
        } else {
            grades.push(gradeData);
        }
        
        gradesSaved++;
    });
    
    saveData();
    
    alert(`${gradesSaved} note(s) enregistrée(s) avec succès!`);
    addActivity(`Notes enregistrées pour ${getSubjectName(subjectId)}`, 'grades');
    
    // Calculer les moyennes
    calculateAverages();
}

function getCurrentTrimester() {
    const month = new Date().getMonth() + 1;
    if (month >= 9 || month <= 1) return 1;
    if (month >= 2 && month <= 5) return 2;
    return 3;
}

function calculateAverages() {
    const classId = document.getElementById('gradeClass').value;
    const subjectId = document.getElementById('gradeSubject').value;
    
    if (!classId || !subjectId) {
        alert('Veuillez sélectionner une classe et une matière');
        return;
    }
    
    const classStudents = students.filter(s => s.class === classId);
    const subject = getSubjectById(subjectId);
    const averagesDiv = document.getElementById('averagesContent');
    
    let html = `
        <h6>Moyennes pour ${subject ? subject.name : subjectId} - ${getClassName(classId)}</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Élève</th>
                        <th>Notes examens</th>
                        <th>Notes devoirs</th>
                        <th>Moyenne générale</th>
                        <th>Appréciation</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    classStudents.forEach(student => {
        // Récupérer toutes les notes de cet élève pour cette matière
        const studentGrades = grades.filter(g => 
            g.studentId === student.id && g.subjectId === subjectId
        );
        
        const studentHomework = homeworkGrades.filter(g => 
            g.studentId === student.id
        );
        
        // Calculer la moyenne des examens
        let examAverage = 0;
        if (studentGrades.length > 0) {
            const totalWeighted = studentGrades.reduce((sum, g) => sum + g.weightedGrade, 0);
            const totalCoefficients = studentGrades.reduce((sum, g) => sum + g.coefficient, 0);
            examAverage = totalWeighted / totalCoefficients;
        }
        
        // Calculer la moyenne des devoirs
        let homeworkAverage = 0;
        if (studentHomework.length > 0) {
            const total = studentHomework.reduce((sum, h) => sum + h.grade, 0);
            homeworkAverage = total / studentHomework.length;
        }
        
        // Calculer la moyenne générale (40% devoirs, 60% examens)
        const generalAverage = (homeworkAverage * 0.4) + (examAverage * 0.6);
        
        // Déterminer l'appréciation
        let appreciation = '';
        if (generalAverage >= 16) appreciation = 'Excellent';
        else if (generalAverage >= 14) appreciation = 'Très bien';
        else if (generalAverage >= 12) appreciation = 'Bien';
        else if (generalAverage >= 10) appreciation = 'Assez bien';
        else if (generalAverage >= 8) appreciation = 'Passable';
        else appreciation = 'Insuffisant';
        
        html += `
            <tr>
                <td>${student.lastName} ${student.firstName}</td>
                <td>${examAverage.toFixed(2)}/20</td>
                <td>${homeworkAverage.toFixed(2)}/20</td>
                <td><strong>${generalAverage.toFixed(2)}/20</strong></td>
                <td><span class="badge ${generalAverage >= 10 ? 'bg-success' : 'bg-danger'}">${appreciation}</span></td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    averagesDiv.innerHTML = html;
    document.getElementById('averagesPreview').style.display = 'block';
}

// ============================
// GÉNÉRATION DES BULLETINS
// ============================

function generateBulletin() {
    const classId = document.getElementById('bulletinClass').value;
    const studentId = document.getElementById('bulletinStudent').value;
    const trimester = document.getElementById('bulletinTrimester').value;
    const includeHomework = document.getElementById('includeHomework').checked;
    
    if (!classId || !studentId) {
        alert('Veuillez sélectionner une classe et un élève');
        return;
    }
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Récupérer toutes les matières de la section de l'élève
    const sectionSubjects = subjectsBySection[student.section] || [];
    
    // Récupérer toutes les notes de l'élève
    const studentGrades = grades.filter(g => 
        g.studentId === studentId && g.trimester === parseInt(trimester)
    );
    
    const studentHomework = includeHomework ? 
        homeworkGrades.filter(g => g.studentId === studentId) : [];
    
    // Calculer les moyennes par matière
    const subjectAverages = [];
    let totalCoefficient = 0;
    let totalWeighted = 0;
    
    sectionSubjects.forEach(subject => {
        const subjectExamGrades = studentGrades.filter(g => g.subjectId === subject.id);
        const subjectHomework = studentHomework.filter(h => {
            const hw = homework.find(hw => hw.id === h.homeworkId);
            return hw && hw.subjectId === subject.id;
        });
        
        // Calculer la moyenne des examens
        let examAverage = 0;
        if (subjectExamGrades.length > 0) {
            const totalWeightedGrade = subjectExamGrades.reduce((sum, g) => sum + g.weightedGrade, 0);
            const totalCoeff = subjectExamGrades.reduce((sum, g) => sum + g.coefficient, 0);
            examAverage = totalWeightedGrade / totalCoeff;
        }
        
        // Calculer la moyenne des devoirs
        let homeworkAverage = 0;
        if (subjectHomework.length > 0) {
            const total = subjectHomework.reduce((sum, h) => sum + h.grade, 0);
            homeworkAverage = total / subjectHomework.length;
        }
        
        // Calculer la moyenne générale
        const generalAverage = includeHomework ? 
            (homeworkAverage * 0.4) + (examAverage * 0.6) : examAverage;
        
        const weightedAverage = generalAverage * subject.coefficient;
        
        subjectAverages.push({
            subjectName: subject.name,
            coefficient: subject.coefficient,
            examAverage: examAverage.toFixed(2),
            homeworkAverage: homeworkAverage.toFixed(2),
            generalAverage: generalAverage.toFixed(2),
            weightedAverage: weightedAverage
        });
        
        totalCoefficient += subject.coefficient;
        totalWeighted += weightedAverage;
    });
    
    // Calculer la moyenne générale
    const generalAverage = totalCoefficient > 0 ? totalWeighted / totalCoefficient : 0;
    
    // Déterminer la mention
    let mention = '';
    if (generalAverage >= 16) mention = 'EXCELLENT';
    else if (generalAverage >= 14) mention = 'TRÈS BIEN';
    else if (generalAverage >= 12) mention = 'BIEN';
    else if (generalAverage >= 10) mention = 'ASSEZ BIEN';
    else if (generalAverage >= 8) mention = 'PASSABLE';
    else mention = 'INSUFFISANT';
    
    // Générer le bulletin
    const bulletinContent = document.getElementById('bulletinContent');
    let html = `
        <div class="bulletin-header text-center mb-4">
            <h2>${schoolSettings.name}</h2>
            <h3>BULLETIN SCOLAIRE</h3>
            <p>Année scolaire ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</p>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <p><strong>Nom:</strong> ${student.lastName}</p>
                <p><strong>Prénom:</strong> ${student.firstName}</p>
                <p><strong>Date de naissance:</strong> ${student.birthDate}</p>
                <p><strong>Classe:</strong> ${getClassName(student.class)}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Trimestre:</strong> ${trimester === '1' ? '1er' : trimester === '2' ? '2ème' : '3ème'} trimestre</p>
                <p><strong>Date d'émission:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                <p><strong>Moyenne générale:</strong> <span class="badge ${generalAverage >= 10 ? 'bg-success' : 'bg-danger'}">${generalAverage.toFixed(2)}/20</span></p>
                <p><strong>Mention:</strong> <strong>${mention}</strong></p>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Matières</th>
                        <th>Coeff</th>
                        <th>Moyenne Examens</th>
                        ${includeHomework ? '<th>Moyenne Devoirs</th>' : ''}
                        <th>Moyenne Générale</th>
                        <th>Moyenne Pondérée</th>
                        <th>Appréciation</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    subjectAverages.forEach(subject => {
        const avg = parseFloat(subject.generalAverage);
        let appreciation = '';
        if (avg >= 16) appreciation = 'Excellent';
        else if (avg >= 14) appreciation = 'Très bien';
        else if (avg >= 12) appreciation = 'Bien';
        else if (avg >= 10) appreciation = 'Assez bien';
        else if (avg >= 8) appreciation = 'Passable';
        else appreciation = 'Insuffisant';
        
        html += `
            <tr>
                <td>${subject.subjectName}</td>
                <td>${subject.coefficient}</td>
                <td>${subject.examAverage}/20</td>
                ${includeHomework ? `<td>${subject.homeworkAverage}/20</td>` : ''}
                <td>${subject.generalAverage}/20</td>
                <td>${(subject.weightedAverage / subject.coefficient).toFixed(2)}</td>
                <td>${appreciation}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="${includeHomework ? '5' : '4'}">MOYENNE GÉNÉRALE</th>
                        <th colspan="2"><strong>${generalAverage.toFixed(2)}/20</strong></th>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-6">
                <h5>Observations du professeur principal:</h5>
                <p class="border p-3 min-height-100">${getTeacherComments(studentId, trimester)}</p>
            </div>
            <div class="col-md-6">
                <h5>Signature:</h5>
                <div class="mt-5 pt-5 text-center">
                    <p>Le Directeur</p>
                    <p class="signature-line">_________________________</p>
                </div>
            </div>
        </div>
    `;
    
    bulletinContent.innerHTML = html;
    document.getElementById('bulletinOutput').style.display = 'block';
    
    addActivity(`Bulletin généré pour ${student.lastName} ${student.firstName}`, 'bulletins');
}

function getTeacherComments(studentId, trimester) {
    // Cette fonction pourrait récupérer les commentaires sauvegardés
    // Pour l'instant, retourne un commentaire par défaut
    const comments = [
        "Élève sérieux et travailleur. Continue tes efforts.",
        "Bons résultats, peut encore progresser dans certaines matières.",
        "Doit redoubler d'efforts pour améliorer ses résultats.",
        "Excellent travail. Continue sur cette lancée.",
        "Progrès satisfaisants. Doit maintenir ses efforts."
    ];
    
    return comments[Math.floor(Math.random() * comments.length)];
}

function printBulletin() {
    window.print();
}

function saveBulletin() {
    const classId = document.getElementById('bulletinClass').value;
    const studentId = document.getElementById('bulletinStudent').value;
    
    const bulletinContent = document.getElementById('bulletinContent').innerHTML;
    
    // Ici, on pourrait sauvegarder le bulletin dans une base de données
    // Pour l'instant, on simule la sauvegarde
    alert('Bulletin sauvegardé avec succès!');
    addActivity(`Bulletin sauvegardé pour l'élève ${studentId}`, 'bulletins');
}

function exportPDF() {
    // Simulation d'export PDF
    alert('Fonctionnalité PDF à implémenter');
    // En production, utiliser une bibliothèque comme jsPDF
}

// ============================
// INITIALISATION
// ============================

// Initialiser les événements pour la section notes
document.addEventListener('DOMContentLoaded', function() {
    // Notes
    const loadStudentsBtn = document.getElementById('loadStudentsForGrades');
    if (loadStudentsBtn) {
        loadStudentsBtn.addEventListener('click', loadStudentsForGrades);
    }
    
    const saveGradesBtn = document.getElementById('saveGrades');
    if (saveGradesBtn) {
        saveGradesBtn.addEventListener('click', saveGrades);
    }
    
    const calculateAveragesBtn = document.getElementById('calculateAverages');
    if (calculateAveragesBtn) {
        calculateAveragesBtn.addEventListener('click', calculateAverages);
    }
    
    // Devoirs
    const loadHomeworkGradesBtn = document.getElementById('loadHomeworkGrades');
    if (loadHomeworkGradesBtn) {
        loadHomeworkGradesBtn.addEventListener('click', loadHomeworkForGrades);
    }
    
    const saveHomeworkGradesBtn = document.getElementById('saveHomeworkGrades');
    if (saveHomeworkGradesBtn) {
        saveHomeworkGradesBtn.addEventListener('click', saveHomeworkGrades);
    }
    
    // Bulletins
    const generateBulletinBtn = document.getElementById('generateBulletin');
    if (generateBulletinBtn) {
        generateBulletinBtn.addEventListener('click', generateBulletin);
    }
    
    const printBulletinBtn = document.getElementById('printBulletin');
    if (printBulletinBtn) {
        printBulletinBtn.addEventListener('click', printBulletin);
    }
    
    const saveBulletinBtn = document.getElementById('saveBulletin');
    if (saveBulletinBtn) {
        saveBulletinBtn.addEventListener('click', saveBulletin);
    }
    
    const exportPDFBtn = document.getElementById('exportPDF');
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', exportPDF);
    }
    
    // Présences
    const presenceForm = document.getElementById('presenceForm');
    if (presenceForm) {
        presenceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePresences();
        });
    }
    
    // Discipline
    const sanctionForm = document.getElementById('sanctionForm');
    if (sanctionForm) {
        sanctionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSanction();
        });
    }
    
    // Devoirs
    const homeworkForm = document.getElementById('homeworkForm');
    if (homeworkForm) {
        homeworkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createHomework();
        });
    }
});
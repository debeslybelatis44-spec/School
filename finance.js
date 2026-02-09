// js/finance.js - Gestion financière (frais, bourses, transactions, paiements)

// ============================
// GESTION DES FRAIS
// ============================

function saveFeeConfig() {
    const classId = document.getElementById('feeClass').value;
    
    if (!classId) {
        alert('Veuillez sélectionner une classe');
        return;
    }
    
    const feeConfig = {
        general: parseFloat(document.getElementById('feeGeneral').value) || 0,
        first: parseFloat(document.getElementById('feeFirst').value) || 0,
        second: parseFloat(document.getElementById('feeSecond').value) || 0,
        third: parseFloat(document.getElementById('feeThird').value) || 0,
        misc: parseFloat(document.getElementById('feeMisc').value) || 0,
        halfPercent: document.getElementById('feeHalfPercent').checked ? 50 : 0,
        fullFree: document.getElementById('feeFullFree').checked
    };
    
    fees[classId] = feeConfig;
    saveData();
    
    // Réinitialiser le formulaire
    document.getElementById('feeConfigForm').reset();
    
    // Recharger la table
    loadFeesTable();
    
    alert('Frais enregistrés avec succès!');
    addActivity(`Frais mis à jour pour la classe ${classId}`, 'fees');
}

function loadFeesTable() {
    const table = document.getElementById('feesTable');
    table.innerHTML = '';
    
    // Trier les classes
    const classIds = Object.keys(fees).sort();
    
    if (classIds.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">Aucun frais configuré</td>
            </tr>
        `;
        return;
    }
    
    classIds.forEach(classId => {
        const fee = fees[classId];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${getClassName(classId)}</td>
            <td>${fee.general.toLocaleString()} HTG</td>
            <td>${fee.first.toLocaleString()} HTG</td>
            <td>${fee.second.toLocaleString()} HTG</td>
            <td>${fee.third.toLocaleString()} HTG</td>
            <td>
                <button class="btn btn-sm btn-futurist me-1" onclick="editFeeConfig('${classId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteFeeConfig('${classId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

function editFeeConfig(classId) {
    const fee = fees[classId];
    if (!fee) return;
    
    // Remplir le formulaire
    document.getElementById('feeClass').value = classId;
    document.getElementById('feeGeneral').value = fee.general;
    document.getElementById('feeFirst').value = fee.first;
    document.getElementById('feeSecond').value = fee.second;
    document.getElementById('feeThird').value = fee.third;
    document.getElementById('feeMisc').value = fee.misc || 0;
    document.getElementById('feeHalfPercent').checked = fee.halfPercent === 50;
    document.getElementById('feeFullFree').checked = fee.fullFree || false;
    
    // Scroll to form
    document.getElementById('feeConfigForm').scrollIntoView();
}

function deleteFeeConfig(classId) {
    if (!confirm('Supprimer la configuration des frais pour cette classe?')) {
        return;
    }
    
    delete fees[classId];
    saveData();
    
    // Recharger la table
    loadFeesTable();
    
    alert('Configuration supprimée!');
    addActivity(`Configuration des frais supprimée pour la classe ${classId}`, 'fees');
}

function generateFeeReport() {
    const period = document.getElementById('feeReportPeriod').value;
    let startDate, endDate;
    
    const today = new Date();
    
    switch(period) {
        case 'today':
            startDate = today.toISOString().split('T')[0];
            endDate = startDate;
            break;
        case 'week':
            startDate = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0];
            endDate = new Date(today.setDate(today.getDate() + 6)).toISOString().split('T')[0];
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
            break;
        case 'year':
            startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
            endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
            break;
        case 'custom':
            startDate = document.getElementById('feeReportStart').value;
            endDate = document.getElementById('feeReportEnd').value;
            break;
    }
    
    if (!startDate || !endDate) {
        alert('Veuillez sélectionner une période valide');
        return;
    }
    
    // Calculer les statistiques
    const classStats = {};
    let totalGeneral = 0;
    let totalFirst = 0;
    let totalSecond = 0;
    let totalThird = 0;
    let totalMisc = 0;
    
    for (const [classId, fee] of Object.entries(fees)) {
        const studentCount = students.filter(s => s.class === classId).length;
        
        classStats[classId] = {
            className: getClassName(classId),
            studentCount: studentCount,
            general: fee.general * studentCount,
            first: fee.first * studentCount,
            second: fee.second * studentCount,
            third: fee.third * studentCount,
            misc: (fee.misc || 0) * studentCount,
            total: (fee.general + fee.first + fee.second + fee.third + (fee.misc || 0)) * studentCount
        };
        
        totalGeneral += classStats[classId].general;
        totalFirst += classStats[classId].first;
        totalSecond += classStats[classId].second;
        totalThird += classStats[classId].third;
        totalMisc += classStats[classId].misc;
    }
    
    const grandTotal = totalGeneral + totalFirst + totalSecond + totalThird + totalMisc;
    
    // Générer le rapport
    const reportContent = document.getElementById('feesSummary');
    let html = `
        <h6>Rapport des frais (${startDate} à ${endDate})</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Classe</th>
                        <th>Élèves</th>
                        <th>Général</th>
                        <th>1er Trim</th>
                        <th>2ème Trim</th>
                        <th>3ème Trim</th>
                        <th>Divers</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (const classId in classStats) {
        const stat = classStats[classId];
        html += `
            <tr>
                <td>${stat.className}</td>
                <td>${stat.studentCount}</td>
                <td>${stat.general.toLocaleString()} HTG</td>
                <td>${stat.first.toLocaleString()} HTG</td>
                <td>${stat.second.toLocaleString()} HTG</td>
                <td>${stat.third.toLocaleString()} HTG</td>
                <td>${stat.misc.toLocaleString()} HTG</td>
                <td><strong>${stat.total.toLocaleString()} HTG</strong></td>
            </tr>
        `;
    }
    
    html += `
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="2">TOTAL</th>
                        <th>${totalGeneral.toLocaleString()} HTG</th>
                        <th>${totalFirst.toLocaleString()} HTG</th>
                        <th>${totalSecond.toLocaleString()} HTG</th>
                        <th>${totalThird.toLocaleString()} HTG</th>
                        <th>${totalMisc.toLocaleString()} HTG</th>
                        <th><strong>${grandTotal.toLocaleString()} HTG</strong></th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    reportContent.innerHTML = html;
    addActivity(`Rapport des frais généré (${period})`, 'reports');
}

// ============================
// GESTION DES BOURSES
// ============================

function showScholarshipModal() {
    const modal = new bootstrap.Modal(document.getElementById('scholarshipModal'));
    
    // Réinitialiser le formulaire
    document.getElementById('scholarshipForm').reset();
    document.getElementById('scholarshipStartDate').value = new Date().toISOString().split('T')[0];
    
    // Définir la date d'expiration à 1 an
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    document.getElementById('scholarshipEndDate').value = endDate.toISOString().split('T')[0];
    
    modal.show();
}

function saveScholarship() {
    const studentId = document.getElementById('scholarshipStudent').value;
    
    if (!studentId) {
        alert('Veuillez sélectionner un élève');
        return;
    }
    
    const scholarshipId = 'SCH' + (scholarships.length + 1).toString().padStart(3, '0');
    const student = students.find(s => s.id === studentId);
    
    const scholarship = {
        id: scholarshipId,
        studentId: studentId,
        studentName: `${student.lastName} ${student.firstName}`,
        type: document.getElementById('scholarshipType').value,
        percentage: parseInt(document.getElementById('scholarshipPercentage').value),
        startDate: document.getElementById('scholarshipStartDate').value,
        endDate: document.getElementById('scholarshipEndDate').value,
        reason: document.getElementById('scholarshipReason').value,
        status: 'active',
        createdBy: currentUser.userId,
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    scholarships.push(scholarship);
    saveData();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('scholarshipModal'));
    if (modal) modal.hide();
    
    // Recharger la table
    loadScholarships();
    updateScholarshipStats();
    
    alert('Bourse attribuée avec succès!');
    addActivity(`Bourse attribuée à ${student.lastName} ${student.firstName} (${scholarshipId})`, 'scholarships');
}

function loadScholarships() {
    const searchTerm = document.getElementById('searchScholarship').value.toLowerCase();
    const table = document.getElementById('scholarshipsTable');
    
    // Filtrer les bourses
    let filteredScholarships = scholarships;
    
    if (searchTerm) {
        filteredScholarships = filteredScholarships.filter(s => 
            s.studentName.toLowerCase().includes(searchTerm) ||
            s.type.toLowerCase().includes(searchTerm) ||
            s.id.toLowerCase().includes(searchTerm)
        );
    }
    
    table.innerHTML = '';
    
    if (filteredScholarships.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">Aucune bourse trouvée</td>
            </tr>
        `;
        return;
    }
    
    // Trier par date d'expiration
    filteredScholarships.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    
    filteredScholarships.forEach(scholarship => {
        // Vérifier le statut
        const today = new Date();
        const endDate = new Date(scholarship.endDate);
        let statusText, statusClass;
        
        if (scholarship.status === 'revoked') {
            statusText = 'Révoquée';
            statusClass = 'badge bg-danger';
        } else if (endDate < today) {
            statusText = 'Expirée';
            statusClass = 'badge bg-warning';
        } else {
            statusText = 'Active';
            statusClass = 'badge bg-success';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${scholarship.studentName}</td>
            <td>${getScholarshipTypeName(scholarship.type)}</td>
            <td>${scholarship.percentage}%</td>
            <td>${scholarship.startDate}</td>
            <td>${scholarship.endDate}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-sm btn-futurist me-1" onclick="viewScholarship('${scholarship.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="revokeScholarship('${scholarship.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

function getScholarshipTypeName(type) {
    const types = {
        'academic': 'Académique',
        'social': 'Sociale',
        'sport': 'Sportive',
        'merit': 'Mérite',
        'other': 'Autre'
    };
    return types[type] || type;
}

function viewScholarship(scholarshipId) {
    const scholarship = scholarships.find(s => s.id === scholarshipId);
    if (!scholarship) return;
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="scholarshipViewModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de la bourse</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>ID:</strong> ${scholarship.id}</p>
                        <p><strong>Élève:</strong> ${scholarship.studentName}</p>
                        <p><strong>Type:</strong> ${getScholarshipTypeName(scholarship.type)}</p>
                        <p><strong>Pourcentage:</strong> ${scholarship.percentage}%</p>
                        <p><strong>Date d'attribution:</strong> ${scholarship.startDate}</p>
                        <p><strong>Date d'expiration:</strong> ${scholarship.endDate}</p>
                        <p><strong>Statut:</strong> ${scholarship.status === 'active' ? 'Active' : 'Révoquée'}</p>
                        <p><strong>Motivation:</strong></p>
                        <p>${scholarship.reason}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('scholarshipViewModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('scholarshipViewModal'));
    modal.show();
}

function revokeScholarship(scholarshipId) {
    if (!confirm('Révoquer cette bourse?')) {
        return;
    }
    
    const scholarship = scholarships.find(s => s.id === scholarshipId);
    if (!scholarship) return;
    
    scholarship.status = 'revoked';
    saveData();
    
    // Recharger la table
    loadScholarships();
    updateScholarshipStats();
    
    alert('Bourse révoquée!');
    addActivity(`Bourse révoquée: ${scholarship.id}`, 'scholarships');
}

function updateScholarshipStats() {
    const activeScholarships = scholarships.filter(s => s.status === 'active');
    const expiringThisMonth = activeScholarships.filter(s => {
        const endDate = new Date(s.endDate);
        const today = new Date();
        return endDate.getMonth() === today.getMonth() && endDate.getFullYear() === today.getFullYear();
    }).length;
    
    // Calculer le montant total des réductions (simulé)
    let totalAmount = 0;
    activeScholarships.forEach(scholarship => {
        const student = students.find(st => st.id === scholarship.studentId);
        if (student) {
            const classFee = fees[student.class];
            if (classFee) {
                const annualFee = classFee.general + classFee.first + classFee.second + classFee.third + (classFee.misc || 0);
                totalAmount += annualFee * (scholarship.percentage / 100);
            }
        }
    });
    
    document.getElementById('totalScholarships').textContent = activeScholarships.length;
    document.getElementById('totalScholarshipAmount').textContent = Math.round(totalAmount).toLocaleString();
    document.getElementById('expiringScholarships').textContent = expiringThisMonth;
}

// ============================
// GESTION DES TRANSACTIONS
// ============================

function showTransactionModal() {
    const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
    
    // Réinitialiser le formulaire
    document.getElementById('transactionForm').reset();
    document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('transactionAmount').value = '';
    
    modal.show();
}

function saveTransaction() {
    const transactionId = 'TRX' + (transactions.length + 1).toString().padStart(3, '0');
    
    const transaction = {
        id: transactionId,
        type: document.getElementById('transactionType').value,
        description: document.getElementById('transactionDescription').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        category: document.getElementById('transactionCategory').value,
        date: document.getElementById('transactionDate').value,
        method: document.getElementById('transactionMethod').value,
        reference: document.getElementById('transactionReference').value,
        remarks: document.getElementById('transactionRemarks').value,
        status: 'completed',
        createdBy: currentUser.userId,
        createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveData();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
    if (modal) modal.hide();
    
    // Recharger les tables
    loadTransactions();
    updateTransactionStats();
    
    alert('Transaction enregistrée avec succès!');
    addActivity(`Nouvelle transaction: ${transaction.description} (${transaction.amount} HTG)`, 'transactions');
}

function loadTransactions() {
    const dateFilter = document.getElementById('transactionDateFilter').value;
    const typeFilter = document.getElementById('transactionTypeFilter').value;
    const statusFilter = document.getElementById('transactionStatusFilter').value;
    
    let filteredTransactions = transactions;
    
    // Appliquer les filtres
    if (dateFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.date === dateFilter);
    }
    
    if (typeFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    if (statusFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.status === statusFilter);
    }
    
    // Trier par date (plus récent d'abord)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Remplir la table principale
    const table = document.getElementById('transactionsTable');
    table.innerHTML = '';
    
    if (filteredTransactions.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">Aucune transaction trouvée</td>
            </tr>
        `;
    } else {
        filteredTransactions.forEach(transaction => {
            const typeBadge = transaction.type === 'income' ? 'bg-success' : 
                            transaction.type === 'expense' ? 'bg-danger' : 'bg-info';
            const typeText = transaction.type === 'income' ? 'Entrée' : 
                           transaction.type === 'expense' ? 'Dépense' : 'Paiement';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.date}</td>
                <td><span class="badge ${typeBadge}">${typeText}</span></td>
                <td>${transaction.description}</td>
                <td>${transaction.amount.toLocaleString()} HTG</td>
                <td><span class="badge bg-success">${transaction.status === 'completed' ? 'Complété' : 'En attente'}</span></td>
                <td>
                    <button class="btn btn-sm btn-futurist" onclick="viewTransaction('${transaction.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            table.appendChild(row);
        });
    }
    
    // Mettre à jour les transactions récentes
    updateRecentTransactions();
}

function filterTransactions() {
    loadTransactions();
}

function updateRecentTransactions() {
    const recentDiv = document.getElementById('recentTransactions');
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (recentTransactions.length === 0) {
        recentDiv.innerHTML = '<p class="text-center text-muted">Aucune transaction récente</p>';
        return;
    }
    
    let html = '';
    recentTransactions.forEach(transaction => {
        const typeIcon = transaction.type === 'income' ? 'fa-arrow-down text-success' : 
                       transaction.type === 'expense' ? 'fa-arrow-up text-danger' : 'fa-exchange-alt text-info';
        
        html += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <i class="fas ${typeIcon} me-2"></i>
                    <small>${transaction.description}</small>
                </div>
                <div>
                    <small>${transaction.amount.toLocaleString()} HTG</small>
                </div>
            </div>
        `;
    });
    
    recentDiv.innerHTML = html;
}

function updateTransactionStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const todayIncome = transactions
        .filter(t => t.date === today && (t.type === 'income' || t.type === 'payment'))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const todayExpenses = transactions
        .filter(t => t.date === today && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = transactions
        .filter(t => t.type === 'income' || t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    document.getElementById('totalIncome').textContent = totalIncome.toLocaleString() + ' HTG';
    document.getElementById('totalExpenses').textContent = totalExpenses.toLocaleString() + ' HTG';
    document.getElementById('balanceAmount').textContent = balance.toLocaleString() + ' HTG';
}

function viewTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    const typeText = transaction.type === 'income' ? 'Entrée' : 
                   transaction.type === 'expense' ? 'Dépense' : 'Paiement';
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="transactionViewModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de la transaction</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>ID:</strong> ${transaction.id}</p>
                        <p><strong>Type:</strong> ${typeText}</p>
                        <p><strong>Description:</strong> ${transaction.description}</p>
                        <p><strong>Montant:</strong> ${transaction.amount.toLocaleString()} HTG</p>
                        <p><strong>Catégorie:</strong> ${transaction.category}</p>
                        <p><strong>Date:</strong> ${transaction.date}</p>
                        <p><strong>Mode de paiement:</strong> ${transaction.method}</p>
                        <p><strong>Référence:</strong> ${transaction.reference || '-'}</p>
                        <p><strong>Statut:</strong> ${transaction.status === 'completed' ? 'Complété' : 'En attente'}</p>
                        <p><strong>Remarques:</strong></p>
                        <p>${transaction.remarks || 'Aucune'}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('transactionViewModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('transactionViewModal'));
    modal.show();
}

// ============================
// GESTION DES PAIEMENTS
// ============================

function updatePaymentDetails() {
    const studentId = document.getElementById('paymentStudent').value;
    const detailsDiv = document.getElementById('studentPaymentDetails');
    
    if (!studentId) {
        detailsDiv.innerHTML = '<p class="text-center text-muted">Sélectionnez un élève pour voir les détails</p>';
        document.getElementById('paymentDue').value = '';
        return;
    }
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const classFee = fees[student.class] || {};
    const scholarship = scholarships.find(s => s.studentId === studentId && s.status === 'active');
    
    let generalDue = classFee.general || 0;
    let firstDue = classFee.first || 0;
    let secondDue = classFee.second || 0;
    let thirdDue = classFee.third || 0;
    let miscDue = classFee.misc || 0;
    
    // Appliquer la réduction de bourse si applicable
    if (scholarship) {
        const reduction = scholarship.percentage / 100;
        generalDue *= (1 - reduction);
        firstDue *= (1 - reduction);
        secondDue *= (1 - reduction);
        thirdDue *= (1 - reduction);
        miscDue *= (1 - reduction);
    }
    
    detailsDiv.innerHTML = `
        <p><strong>Élève:</strong> ${student.lastName} ${student.firstName}</p>
        <p><strong>Classe:</strong> ${getClassName(student.class)}</p>
        ${scholarship ? `<p><strong>Bourse:</strong> ${scholarship.percentage}%</p>` : ''}
        <hr>
        <p><strong>Frais généraux:</strong> ${generalDue.toLocaleString()} HTG</p>
        <p><strong>1er trimestre:</strong> ${firstDue.toLocaleString()} HTG</p>
        <p><strong>2ème trimestre:</strong> ${secondDue.toLocaleString()} HTG</p>
        <p><strong>3ème trimestre:</strong> ${thirdDue.toLocaleString()} HTG</p>
        <p><strong>Frais divers:</strong> ${miscDue.toLocaleString()} HTG</p>
    `;
    
    // Mettre à jour le montant dû selon le type sélectionné
    updatePaymentDue();
}

function updatePaymentDue() {
    const studentId = document.getElementById('paymentStudent').value;
    const paymentType = document.getElementById('paymentType').value;
    
    if (!studentId || !paymentType) return;
    
    const student = students.find(s => s.id === studentId);
    const classFee = fees[student.class] || {};
    const scholarship = scholarships.find(s => s.studentId === studentId && s.status === 'active');
    
    let dueAmount = 0;
    
    switch(paymentType) {
        case 'general':
            dueAmount = classFee.general || 0;
            break;
        case 'first':
            dueAmount = classFee.first || 0;
            break;
        case 'second':
            dueAmount = classFee.second || 0;
            break;
        case 'third':
            dueAmount = classFee.third || 0;
            break;
        case 'misc':
            dueAmount = classFee.misc || 0;
            break;
    }
    
    // Appliquer la réduction de bourse
    if (scholarship) {
        dueAmount *= (1 - (scholarship.percentage / 100));
    }
    
    document.getElementById('paymentDue').value = dueAmount.toFixed(2);
}

function savePayment() {
    const studentId = document.getElementById('paymentStudent').value;
    
    if (!studentId) {
        alert('Veuillez sélectionner un élève');
        return;
    }
    
    const paymentId = 'PAY' + (payments.length + 1).toString().padStart(3, '0');
    const student = students.find(s => s.id === studentId);
    
    const payment = {
        id: paymentId,
        studentId: studentId,
        studentName: `${student.lastName} ${student.firstName}`,
        type: document.getElementById('paymentType').value,
        dueAmount: parseFloat(document.getElementById('paymentDue').value),
        amount: parseFloat(document.getElementById('paymentAmount').value),
        method: document.getElementById('paymentMethod').value,
        reference: document.getElementById('paymentReference').value,
        date: document.getElementById('paymentDate').value,
        remarks: document.getElementById('paymentRemarks').value,
        status: 'completed',
        recordedBy: currentUser.userId,
        recordedAt: new Date().toISOString()
    };
    
    payments.push(payment);
    saveData();
    
    // Réinitialiser le formulaire
    document.getElementById('paymentForm').reset();
    
    // Mettre à jour les affichages
    updatePaymentStatusSummary();
    loadPaymentHistory();
    updateDashboard();
    
    // Ajouter une transaction correspondante
    const transaction = {
        id: 'TRX' + (transactions.length + 1).toString().padStart(3, '0'),
        type: 'payment',
        description: `Paiement de ${student.lastName} ${student.firstName} - ${payment.type}`,
        amount: payment.amount,
        category: 'tuition',
        date: payment.date,
        method: payment.method,
        reference: payment.reference,
        remarks: payment.remarks,
        status: 'completed',
        createdBy: currentUser.userId,
        createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveData();
    
    alert('Paiement enregistré avec succès!');
    addActivity(`Paiement enregistré: ${student.lastName} ${student.firstName} (${payment.amount} HTG)`, 'payments');
}

function loadPaymentHistory() {
    const table = document.getElementById('paymentsHistoryTable');
    
    // Trier par date (plus récent d'abord)
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    table.innerHTML = '';
    
    if (sortedPayments.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">Aucun paiement enregistré</td>
            </tr>
        `;
        return;
    }
    
    sortedPayments.forEach(payment => {
        const typeText = getPaymentTypeName(payment.type);
        const methodText = getPaymentMethodName(payment.method);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.date}</td>
            <td>${payment.studentName}</td>
            <td>${typeText}</td>
            <td>${payment.amount.toLocaleString()} HTG</td>
            <td>${methodText}</td>
            <td><span class="badge bg-success">${payment.status === 'completed' ? 'Complété' : 'En attente'}</span></td>
            <td>
                <button class="btn btn-sm btn-futurist" onclick="viewPayment('${payment.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        table.appendChild(row);
    });
}

function getPaymentTypeName(type) {
    const types = {
        'general': 'Frais généraux',
        'first': '1er trimestre',
        'second': '2ème trimestre',
        'third': '3ème trimestre',
        'misc': 'Frais divers',
        'other': 'Autre'
    };
    return types[type] || type;
}

function getPaymentMethodName(method) {
    const methods = {
        'cash': 'Espèces',
        'check': 'Chèque',
        'transfer': 'Virement',
        'mobile': 'Mobile Money'
    };
    return methods[method] || method;
}

function viewPayment(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="paymentViewModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails du paiement</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>ID:</strong> ${payment.id}</p>
                        <p><strong>Élève:</strong> ${payment.studentName}</p>
                        <p><strong>Type:</strong> ${getPaymentTypeName(payment.type)}</p>
                        <p><strong>Montant dû:</strong> ${payment.dueAmount.toLocaleString()} HTG</p>
                        <p><strong>Montant payé:</strong> ${payment.amount.toLocaleString()} HTG</p>
                        <p><strong>Mode de paiement:</strong> ${getPaymentMethodName(payment.method)}</p>
                        <p><strong>Référence:</strong> ${payment.reference || '-'}</p>
                        <p><strong>Date:</strong> ${payment.date}</p>
                        <p><strong>Statut:</strong> ${payment.status === 'completed' ? 'Complété' : 'En attente'}</p>
                        <p><strong>Remarques:</strong></p>
                        <p>${payment.remarks || 'Aucune'}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-futurist" onclick="generateReceiptForPayment('${payment.id}')">
                            <i class="fas fa-receipt me-1"></i>Générer reçu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('paymentViewModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('paymentViewModal'));
    modal.show();
}

function updatePaymentStatusSummary() {
    const summaryDiv = document.getElementById('paymentStatusSummary');
    
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().getMonth() + 1;
    const thisYear = new Date().getFullYear();
    
    const todayPayments = payments.filter(p => p.date === today);
    const thisMonthPayments = payments.filter(p => {
        const date = new Date(p.date);
        return date.getMonth() + 1 === thisMonth && date.getFullYear() === thisYear;
    });
    
    const totalToday = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalAll = payments.reduce((sum, p) => sum + p.amount, 0);
    
    summaryDiv.innerHTML = `
        <div class="row text-center">
            <div class="col-6 mb-3">
                <h5>${todayPayments.length}</h5>
                <p class="text-light small">Aujourd'hui</p>
            </div>
            <div class="col-6 mb-3">
                <h5>${totalToday.toLocaleString()} HTG</h5>
                <p class="text-light small">Montant</p>
            </div>
        </div>
        <div class="row text-center">
            <div class="col-6 mb-3">
                <h5>${thisMonthPayments.length}</h5>
                <p class="text-light small">Ce mois</p>
            </div>
            <div class="col-6 mb-3">
                <h5>${totalMonth.toLocaleString()} HTG</h5>
                <p class="text-light small">Montant</p>
            </div>
        </div>
        <hr>
        <div class="text-center">
            <h4>${totalAll.toLocaleString()} HTG</h4>
            <p class="text-light small">Total collecté</p>
        </div>
    `;
}

function generateReceipt() {
    const paymentId = document.getElementById('receiptPayment').value;
    
    if (!paymentId) {
        alert('Veuillez sélectionner un paiement');
        return;
    }
    
    generateReceiptForPayment(paymentId);
}

function generateReceiptForPayment(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const student = students.find(s => s.id === payment.studentId);
    if (!student) return;
    
    const receiptContent = `
        <div class="printable-area">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2>${schoolSettings.name}</h2>
                <h3>REÇU DE PAIEMENT</h3>
                <p>Année scolaire ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                <table style="width: 100%;">
                    <tr>
                        <td style="width: 50%;">
                            <p><strong>Numéro de reçu:</strong> ${payment.id}</p>
                            <p><strong>Date:</strong> ${payment.date}</p>
                            <p><strong>Heure:</strong> ${new Date().toLocaleTimeString('fr-FR')}</p>
                        </td>
                        <td style="width: 50%;">
                            <p><strong>Élève:</strong> ${student.lastName} ${student.firstName}</p>
                            <p><strong>Classe:</strong> ${getClassName(student.class)}</p>
                            <p><strong>Matricule:</strong> ${student.id}</p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-bottom: 30px;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="border: 1px solid #000; padding: 10px; width: 60%;">Description</th>
                            <th style="border: 1px solid #000; padding: 10px; width: 20%; text-align: center;">Montant dû</th>
                            <th style="border: 1px solid #000; padding: 10px; width: 20%; text-align: center;">Montant payé</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #000; padding: 10px;">${getPaymentTypeName(payment.type)}</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${payment.dueAmount.toLocaleString()} HTG</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: center;">${payment.amount.toLocaleString()} HTG</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="border: 1px solid #000; padding: 10px; text-align: right;"><strong>TOTAL:</strong></td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: center;"><strong>${payment.amount.toLocaleString()} HTG</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div style="margin-bottom: 30px;">
                <p><strong>Mode de paiement:</strong> ${getPaymentMethodName(payment.method)}</p>
                <p><strong>Référence:</strong> ${payment.reference || 'Non applicable'}</p>
                <p><strong>Remarques:</strong> ${payment.remarks || 'Aucune'}</p>
            </div>
            
            <div style="margin-top: 50px; border-top: 1px solid #000; padding-top: 20px;">
                <div style="float: left; width: 50%;">
                    <p><strong>Signature de l'élève/tuteur</strong></p>
                    <p style="margin-top: 50px;">_________________________</p>
                </div>
                <div style="float: right; width: 50%; text-align: right;">
                    <p><strong>Signature du responsable</strong></p>
                    <p style="margin-top: 50px;">_________________________</p>
                </div>
                <div style="clear: both;"></div>
            </div>
        </div>
    `;
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reçu de paiement - ${payment.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${receiptContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
    
    addActivity(`Reçu généré pour le paiement ${payment.id}`, 'reports');
}
// js/communication.js - Gestion des messages et réunions

// ============================
// GESTION DES MESSAGES
// ============================

let currentMessageFilter = 'all';

function loadMessages() {
    const filter = document.getElementById('messageFilter').value || currentMessageFilter;
    currentMessageFilter = filter;
    
    const messagesList = document.getElementById('messagesList');
    
    // Filtrer les messages selon le filtre
    let filteredMessages = messages;
    
    if (filter === 'unread') {
        filteredMessages = filteredMessages.filter(m => !m.read && m.to.includes(currentUser.role));
    } else if (filter === 'sent') {
        filteredMessages = filteredMessages.filter(m => m.from === currentUser.userId);
    } else {
        // Pour 'all', afficher les messages reçus et envoyés
        filteredMessages = filteredMessages.filter(m => 
            m.to.includes(currentUser.role) || m.from === currentUser.userId
        );
    }
    
    // Trier par date (plus récent d'abord)
    filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    messagesList.innerHTML = '';
    
    if (filteredMessages.length === 0) {
        messagesList.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-envelope fa-3x mb-3"></i>
                <p>Aucun message trouvé</p>
            </div>
        `;
        updateUnreadCount();
        return;
    }
    
    filteredMessages.forEach(message => {
        const isSent = message.from === currentUser.userId;
        const isUnread = !message.read && !isSent;
        const time = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const date = new Date(message.timestamp).toLocaleDateString('fr-FR');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-item ${isUnread ? 'unread' : ''} ${isSent ? 'sent' : ''}`;
        messageDiv.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="message-avatar me-3">
                    <i class="fas ${isSent ? 'fa-paper-plane text-info' : 'fa-envelope text-success'} fa-2x"></i>
                </div>
                <div class="message-content flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${message.subject}</h6>
                            <small class="text-muted">
                                ${isSent ? 'À: ' : 'De: '} ${message.recipientName || message.to.join(', ')}
                            </small>
                        </div>
                        <div class="text-end">
                            <small class="text-muted">${date} ${time}</small>
                            ${isUnread ? '<span class="badge bg-danger ms-2">Nouveau</span>' : ''}
                        </div>
                    </div>
                    <p class="mb-1 message-preview">${message.content.substring(0, 150)}${message.content.length > 150 ? '...' : ''}</p>
                    ${message.attachments ? `<small><i class="fas fa-paperclip"></i> Pièce jointe</small>` : ''}
                </div>
                <div class="message-actions ms-2">
                    <button class="btn btn-sm btn-futurist" onclick="viewMessage('${message.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
        
        messageDiv.addEventListener('click', function(e) {
            if (!e.target.closest('.message-actions')) {
                viewMessage(message.id);
            }
        });
        
        messagesList.appendChild(messageDiv);
    });
    
    updateUnreadCount();
}

function sendMessage() {
    const to = document.getElementById('messageTo').value;
    const specificRecipient = document.getElementById('specificRecipient').value;
    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;
    const attachment = document.getElementById('messageAttachment').files[0];
    
    if (!to || !subject || !content) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const messageId = 'MSG' + (messages.length + 1).toString().padStart(3, '0');
    
    // Déterminer les destinataires
    let recipients = [];
    if (to === 'all') {
        recipients = ['admin', 'secretary', 'surveillant', 'economat', 'censeur', 'teacher', 'parent', 'student'];
    } else if (to === 'teachers') {
        recipients = ['teacher'];
    } else if (to === 'parents') {
        recipients = ['parent'];
    } else if (to === 'students') {
        recipients = ['student'];
    } else {
        recipients = [to];
    }
    
    const message = {
        id: messageId,
        from: currentUser.userId,
        fromName: currentUser.fullName,
        to: recipients,
        recipientName: specificRecipient || getRoleName(to),
        subject: subject,
        content: content,
        attachments: attachment ? attachment.name : null,
        read: false,
        timestamp: new Date().toISOString(),
        type: 'message'
    };
    
    messages.push(message);
    saveData();
    
    // Réinitialiser le formulaire
    document.getElementById('messageForm').reset();
    
    // Recharger les messages
    loadMessages();
    
    alert('Message envoyé avec succès!');
    addActivity(`Message envoyé: ${subject}`, 'messages');
}

function viewMessage(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    // Marquer comme lu si c'est un message reçu
    if (!message.read && message.from !== currentUser.userId) {
        message.read = true;
        saveData();
        updateUnreadCount();
    }
    
    const time = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const date = new Date(message.timestamp).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="messageViewModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${message.subject}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <p><strong>De:</strong> ${message.fromName}</p>
                            <p><strong>À:</strong> ${message.recipientName}</p>
                            <p><strong>Date:</strong> ${date} à ${time}</p>
                        </div>
                        
                        <div class="message-content-view mb-4">
                            ${message.content.replace(/\n/g, '<br>')}
                        </div>
                        
                        ${message.attachments ? `
                        <div class="mb-4">
                            <h6>Pièce jointe:</h6>
                            <div class="attachment">
                                <i class="fas fa-paperclip me-2"></i>
                                ${message.attachments}
                                <button class="btn btn-sm btn-futurist ms-2">
                                    <i class="fas fa-download"></i> Télécharger
                                </button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-futurist" onclick="replyToMessage('${message.id}')">
                            <i class="fas fa-reply me-2"></i>Répondre
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('messageViewModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('messageViewModal'));
    modal.show();
    
    // Recharger la liste des messages
    loadMessages();
}

function replyToMessage(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    // Pré-remplir le formulaire de réponse
    document.getElementById('messageTo').value = message.from === currentUser.userId ? message.to[0] : 'specific';
    document.getElementById('specificRecipient').value = message.fromName;
    document.getElementById('messageSubject').value = `Re: ${message.subject}`;
    document.getElementById('messageContent').value = `\n\n--- Message original ---\n${message.content}`;
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('messageViewModal'));
    if (modal) modal.hide();
    
    // Scroll to message form
    document.getElementById('messageForm').scrollIntoView();
}

function updateUnreadCount() {
    const unreadMessages = messages.filter(m => 
        !m.read && m.to.includes(currentUser.role) && m.from !== currentUser.userId
    ).length;
    
    const unreadCountElement = document.getElementById('unreadCount');
    if (unreadCountElement) {
        if (unreadMessages > 0) {
            unreadCountElement.textContent = unreadMessages;
            unreadCountElement.style.display = 'inline';
        } else {
            unreadCountElement.style.display = 'none';
        }
    }
}

// ============================
// GESTION DES RÉUNIONS
// ============================

function createMeeting() {
    const type = document.getElementById('meetingType').value;
    const title = document.getElementById('meetingTitle').value;
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;
    const duration = document.getElementById('meetingDuration').value;
    const participants = Array.from(document.getElementById('meetingParticipants').selectedOptions).map(opt => opt.value);
    const link = document.getElementById('meetingLink').value;
    const description = document.getElementById('meetingDescription').value;
    
    if (!type || !title || !date || !time) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const meetingId = 'MTG' + (meetings.length + 1).toString().padStart(3, '0');
    const startTime = `${date}T${time}`;
    const endTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString();
    
    const meeting = {
        id: meetingId,
        type: type,
        title: title,
        date: date,
        startTime: time,
        duration: duration,
        endTime: endTime.split('T')[1].substring(0, 5),
        participants: participants,
        link: link,
        description: description,
        organizer: currentUser.userId,
        organizerName: currentUser.fullName,
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };
    
    meetings.push(meeting);
    saveData();
    
    // Réinitialiser le formulaire
    document.getElementById('meetingForm').reset();
    
    // Recharger les réunions
    loadMeetings();
    loadUpcomingMeetings();
    
    alert('Réunion créée avec succès!');
    addActivity(`Réunion créée: ${title}`, 'meetings');
}

function loadMeetings() {
    const historyTable = document.getElementById('meetingsHistoryTable');
    
    // Trier par date (plus récent d'abord)
    const sortedMeetings = [...meetings].sort((a, b) => new Date(b.date + 'T' + b.startTime) - new Date(a.date + 'T' + a.startTime));
    
    historyTable.innerHTML = '';
    
    if (sortedMeetings.length === 0) {
        historyTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">Aucune réunion planifiée</td>
            </tr>
        `;
        return;
    }
    
    sortedMeetings.forEach(meeting => {
        // Vérifier le statut
        const now = new Date();
        const meetingDate = new Date(meeting.date + 'T' + meeting.startTime);
        let statusText, statusClass;
        
        if (meeting.status === 'cancelled') {
            statusText = 'Annulée';
            statusClass = 'badge bg-danger';
        } else if (meetingDate < now) {
            statusText = 'Terminée';
            statusClass = 'badge bg-secondary';
        } else if (meetingDate > now) {
            statusText = 'Planifiée';
            statusClass = 'badge bg-success';
        } else {
            statusText = 'En cours';
            statusClass = 'badge bg-warning';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${meeting.title}</td>
            <td>${getMeetingTypeName(meeting.type)}</td>
            <td>${meeting.date} ${meeting.startTime}</td>
            <td>${meeting.participants.map(p => getRoleName(p)).join(', ')}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-sm btn-futurist me-1" onclick="viewMeeting('${meeting.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${meeting.status === 'scheduled' ? `
                <button class="btn btn-sm btn-warning me-1" onclick="editMeeting('${meeting.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="cancelMeeting('${meeting.id}')">
                    <i class="fas fa-times"></i>
                </button>
                ` : ''}
            </td>
        `;
        historyTable.appendChild(row);
    });
}

function getMeetingTypeName(type) {
    const types = {
        'meeting': 'Réunion',
        'class': 'Cours en ligne',
        'parent_meeting': 'Réunion parents',
        'staff_meeting': 'Réunion personnel'
    };
    return types[type] || type;
}

function loadUpcomingMeetings() {
    const upcomingDiv = document.getElementById('upcomingMeetings');
    const activeClassesDiv = document.getElementById('activeOnlineClasses');
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Réunions à venir (aujourd'hui et futures)
    const upcoming = meetings.filter(m => 
        m.status === 'scheduled' && 
        (m.date > today || (m.date === today && m.startTime > now.toTimeString().substring(0, 5)))
    ).sort((a, b) => new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime));
    
    // Cours en ligne actifs (en cours maintenant)
    const activeClasses = meetings.filter(m => 
        m.type === 'class' && 
        m.status === 'scheduled' &&
        m.date === today &&
        m.startTime <= now.toTimeString().substring(0, 5) &&
        m.endTime > now.toTimeString().substring(0, 5)
    );
    
    // Afficher les réunions à venir
    if (upcoming.length === 0) {
        upcomingDiv.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-calendar fa-2x mb-2"></i>
                <p>Aucune réunion à venir</p>
            </div>
        `;
    } else {
        let html = '<div class="list-group">';
        upcoming.slice(0, 5).forEach(meeting => {
            const isToday = meeting.date === today;
            
            html += `
                <div class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${meeting.title}</h6>
                        <small>${isToday ? 'Aujourd\'hui' : meeting.date} ${meeting.startTime}</small>
                    </div>
                    <p class="mb-1">${getMeetingTypeName(meeting.type)}</p>
                    <small>Organisé par: ${meeting.organizerName}</small>
                    ${meeting.link ? `
                    <div class="mt-2">
                        <button class="btn btn-sm btn-futurist" onclick="joinMeeting('${meeting.id}')">
                            <i class="fas fa-video me-1"></i>Rejoindre
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
        });
        html += '</div>';
        upcomingDiv.innerHTML = html;
    }
    
    // Afficher les cours en ligne actifs
    if (activeClasses.length === 0) {
        activeClassesDiv.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-video fa-2x mb-2"></i>
                <p>Aucun cours en ligne actif</p>
            </div>
        `;
    } else {
        let html = '<div class="list-group">';
        activeClasses.forEach(meeting => {
            html += `
                <div class="list-group-item list-group-item-action active-class">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${meeting.title}</h6>
                        <span class="badge bg-danger">EN DIRECT</span>
                    </div>
                    <p class="mb-1">${meeting.description.substring(0, 100)}...</p>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-futurist w-100" onclick="joinMeeting('${meeting.id}')">
                            <i class="fas fa-play me-1"></i>Rejoindre le cours
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        activeClassesDiv.innerHTML = html;
    }
}

function viewMeeting(meetingId) {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    const modalHtml = `
        <div class="modal fade modal-futurist" id="meetingViewModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${meeting.title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p><strong>Type:</strong> ${getMeetingTypeName(meeting.type)}</p>
                                <p><strong>Date:</strong> ${meeting.date}</p>
                                <p><strong>Heure:</strong> ${meeting.startTime} - ${meeting.endTime}</p>
                                <p><strong>Durée:</strong> ${meeting.duration} minutes</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Organisateur:</strong> ${meeting.organizerName}</p>
                                <p><strong>Statut:</strong> ${meeting.status === 'scheduled' ? 'Planifiée' : 'Annulée'}</p>
                                <p><strong>Participants:</strong> ${meeting.participants.map(p => getRoleName(p)).join(', ')}</p>
                            </div>
                        </div>
                        
                        ${meeting.link ? `
                        <div class="mb-3">
                            <p><strong>Lien de connexion:</strong></p>
                            <div class="input-group">
                                <input type="text" class="form-control" value="${meeting.link}" readonly>
                                <button class="btn btn-futurist" onclick="copyToClipboard('${meeting.link}')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="mb-3">
                            <p><strong>Description:</strong></p>
                            <p>${meeting.description || 'Aucune description'}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        ${meeting.link ? `
                        <button type="button" class="btn btn-futurist" onclick="joinMeeting('${meeting.id}')">
                            <i class="fas fa-video me-1"></i>Rejoindre
                        </button>
                        ` : ''}
                        ${meeting.status === 'scheduled' ? `
                        <button type="button" class="btn btn-warning" onclick="editMeeting('${meeting.id}')">
                            <i class="fas fa-edit me-1"></i>Modifier
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer l'ancien modal s'il existe
    const oldModal = document.getElementById('meetingViewModal');
    if (oldModal) oldModal.remove();
    
    // Ajouter le nouveau modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('meetingViewModal'));
    modal.show();
}

function joinMeeting(meetingId) {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    if (meeting.link) {
        window.open(meeting.link, '_blank');
        addActivity(`Rejoint la réunion: ${meeting.title}`, 'meetings');
    } else {
        alert('Aucun lien disponible pour cette réunion');
    }
}

function editMeeting(meetingId) {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    // Remplir le formulaire
    document.getElementById('meetingType').value = meeting.type;
    document.getElementById('meetingTitle').value = meeting.title;
    document.getElementById('meetingDate').value = meeting.date;
    document.getElementById('meetingTime').value = meeting.startTime;
    document.getElementById('meetingDuration').value = meeting.duration;
    document.getElementById('meetingLink').value = meeting.link || '';
    document.getElementById('meetingDescription').value = meeting.description || '';
    
    // Sélectionner les participants
    const participantsSelect = document.getElementById('meetingParticipants');
    Array.from(participantsSelect.options).forEach(option => {
        option.selected = meeting.participants.includes(option.value);
    });
    
    // Changer l'action du formulaire
    const form = document.getElementById('meetingForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateMeeting(meetingId);
    };
    
    // Changer le texte du bouton
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Mettre à jour la réunion';
    
    // Scroll to form
    form.scrollIntoView();
}

function updateMeeting(meetingId) {
    const meetingIndex = meetings.findIndex(m => m.id === meetingId);
    if (meetingIndex === -1) return;
    
    const meeting = meetings[meetingIndex];
    
    // Mettre à jour les informations
    meeting.type = document.getElementById('meetingType').value;
    meeting.title = document.getElementById('meetingTitle').value;
    meeting.date = document.getElementById('meetingDate').value;
    meeting.startTime = document.getElementById('meetingTime').value;
    meeting.duration = parseInt(document.getElementById('meetingDuration').value);
    meeting.participants = Array.from(document.getElementById('meetingParticipants').selectedOptions).map(opt => opt.value);
    meeting.link = document.getElementById('meetingLink').value;
    meeting.description = document.getElementById('meetingDescription').value;
    
    // Recalculer l'heure de fin
    const startTime = `${meeting.date}T${meeting.startTime}`;
    meeting.endTime = new Date(new Date(startTime).getTime() + meeting.duration * 60000)
        .toISOString().split('T')[1].substring(0, 5);
    
    saveData();
    
    // Restaurer le formulaire original
    const form = document.getElementById('meetingForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        createMeeting();
    };
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-calendar-plus me-2"></i>Créer la réunion';
    
    // Recharger les réunions
    loadMeetings();
    loadUpcomingMeetings();
    
    alert('Réunion mise à jour avec succès!');
    addActivity(`Réunion modifiée: ${meeting.title}`, 'meetings');
}

function cancelMeeting(meetingId) {
    if (!confirm('Annuler cette réunion?')) {
        return;
    }
    
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    meeting.status = 'cancelled';
    saveData();
    
    // Recharger les réunions
    loadMeetings();
    loadUpcomingMeetings();
    
    alert('Réunion annulée!');
    addActivity(`Réunion annulée: ${meeting.title}`, 'meetings');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Lien copié dans le presse-papier!');
    }).catch(err => {
        console.error('Erreur lors de la copie:', err);
    });
}

// ============================
// INITIALISATION
// ============================

document.addEventListener('DOMContentLoaded', function() {
    // Messages
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
    
    const refreshMessagesBtn = document.getElementById('refreshMessages');
    if (refreshMessagesBtn) {
        refreshMessagesBtn.addEventListener('click', loadMessages);
    }
    
    const messageFilter = document.getElementById('messageFilter');
    if (messageFilter) {
        messageFilter.addEventListener('change', loadMessages);
    }
    
    // Réunions
    const meetingForm = document.getElementById('meetingForm');
    if (meetingForm) {
        meetingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createMeeting();
        });
    }
    
    const joinClassBtn = document.getElementById('joinClassBtn');
    if (joinClassBtn) {
        joinClassBtn.addEventListener('click', function() {
            // Ouvrir une modal pour sélectionner un cours
            alert('Sélectionnez un cours dans la liste des cours en ligne actifs');
        });
    }
    
    // Charger les données initiales
    loadMessages();
    loadMeetings();
    loadUpcomingMeetings();
    
    // Mettre à jour périodiquement les réunions (toutes les minutes)
    setInterval(loadUpcomingMeetings, 60000);
});
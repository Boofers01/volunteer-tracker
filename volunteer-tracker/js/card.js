// Create a card element
function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.id = card.id;
    cardElement.draggable = true;
    
    // Card title
    const cardTitle = document.createElement('div');
    cardTitle.className = 'card-title';
    cardTitle.textContent = `${card.firstName} ${card.lastName}`;
    
    // Checklist progress bar
    let completedCount = 0;
    let totalCount = 0;
    
    if (card.checklist && card.checklist.length > 0) {
        totalCount = card.checklist.length;
        completedCount = card.checklist.filter(item => item.completed).length;
    }
    
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    const checklistProgress = document.createElement('div');
    checklistProgress.className = 'checklist-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'checklist-progress-bar';
    progressBar.style.width = `${progressPercentage}%`;
    
    checklistProgress.appendChild(progressBar);
    
    // Card badges
    const cardBadges = document.createElement('div');
    cardBadges.className = 'card-badges';
    
    const checklistBadge = document.createElement('div');
    checklistBadge.className = 'card-badge';
    checklistBadge.innerHTML = `<i class="fas fa-check-square"></i> ${completedCount}/${totalCount}`;
    
    let attachmentCount = 0;
    if (card.attachments && card.attachments.length > 0) {
        attachmentCount = card.attachments.length;
    }
    
    const attachmentBadge = document.createElement('div');
    attachmentBadge.className = 'card-badge';
    attachmentBadge.innerHTML = `<i class="fas fa-paperclip"></i> ${attachmentCount}`;
    
    cardBadges.appendChild(checklistBadge);
    cardBadges.appendChild(attachmentBadge);
    
    // Assemble the card
    cardElement.appendChild(cardTitle);
    cardElement.appendChild(checklistProgress);
    cardElement.appendChild(cardBadges);
    
    // Add click event to open card modal
    cardElement.addEventListener('click', function() {
        openCardModal(card);
    });
    
    return cardElement;
}

// Add a new card to a list
function addNewCard(listId, cardData = null) {
    // If no card data provided, create a new empty card
    if (!cardData) {
        const firstName = prompt('Enter first name:');
        const lastName = prompt('Enter last name:');
        
        if (!firstName || !lastName) return;
        
        cardData = {
            id: 'card-' + generateId(),
            firstName: firstName,
            lastName: lastName,
            email: '',
            phone: '',
            notes: '',
            dateAdded: new Date().toISOString(),
            checklist: JSON.parse(JSON.stringify(masterChecklist)).map(item => {
                return {
                    id: item.id,
                    text: item.text,
                    required: item.required,
                    completed: false
                };
            }),
            attachments: [],
            tags: []
        };
    }
    
    // Find the list and add the card
    const list = boardData.lists.find(list => list.id === listId);
    
    if (list) {
        list.cards.push(cardData);
        saveBoardData();
        renderBoard();
    }
}

// Open the card modal
function openCardModal(card) {
    const modal = document.getElementById('cardModal');
    const currentCard = card;
    
    // Store the current card ID in the modal for reference
    modal.setAttribute('data-card-id', card.id);
    
    // Populate card details
    document.getElementById('volunteerName').textContent = `${card.firstName} ${card.lastName}`;
    document.getElementById('addedDate').textContent = `Added on ${formatDate(card.dateAdded)}`;
    document.getElementById('volunteerEmail').textContent = card.email || 'Not provided';
    document.getElementById('volunteerPhone').textContent = card.phone || 'Not provided';
    document.getElementById('volunteerNotes').textContent = card.notes || 'No notes available';
    
    // Set initials
    const initialsElement = document.querySelector('.volunteer-initials');
    initialsElement.textContent = getInitials(`${card.firstName} ${card.lastName}`);
    
    // Load attachments
    loadAttachments(card);
    
    // Load checklist
    loadChecklist(card);
    
    // Load tags
    loadTags(card);
    
    // Show the modal
    modal.style.display = 'block';
    
    // Set active tab to Details
    document.querySelector('.tab-button[data-tab="details"]').click();
}

// Format a date string
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Load attachments for a card
function loadAttachments(card) {
    const attachmentsContainer = document.getElementById('attachmentsList');
    attachmentsContainer.innerHTML = '';
    
    if (!card.attachments || card.attachments.length === 0) {
        attachmentsContainer.innerHTML = '<p>No attachments</p>';
        return;
    }
    
    card.attachments.forEach(attachment => {
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-item';
        
        const attachmentName = document.createElement('div');
        attachmentName.textContent = attachment.name;
        
        const attachmentActions = document.createElement('div');
        attachmentActions.className = 'attachment-actions';
        
        const downloadButton = document.createElement('button');
        downloadButton.innerHTML = '<i class="fas fa-download"></i>';
        downloadButton.title = 'Download';
        downloadButton.addEventListener('click', function(e) {
            e.stopPropagation();
            downloadAttachment(attachment);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = 'Delete';
        deleteButton.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteAttachment(card.id, attachment.id);
        });
        
        attachmentActions.appendChild(downloadButton);
        attachmentActions.appendChild(deleteButton);
        
        attachmentItem.appendChild(attachmentName);
        attachmentItem.appendChild(attachmentActions);
        
        attachmentsContainer.appendChild(attachmentItem);
    });
}

// Handle file upload
function handleFileUpload(e) {
    const files = e.target.files;
    const cardId = document.getElementById('cardModal').getAttribute('data-card-id');
    
    if (!files.length || !cardId) return;
    
    // Find the card
    let targetCard = null;
    let targetList = null;
    
    for (const list of boardData.lists) {
        const card = list.cards.find(card => card.id === cardId);
        if (card) {
            targetCard = card;
            targetList = list;
            break;
        }
    }
    
    if (!targetCard) return;
    
    // Initialize attachments array if it doesn't exist
    if (!targetCard.attachments) {
        targetCard.attachments = [];
    }
    
    // Process each file
    Array.from(files).forEach(file => {
        // In a real application, you'd upload this file to a server
        // For now, we'll just store the file information
        const attachment = {
            id: 'attachment-' + generateId(),
            name: file.name,
            type: file.type,
            size: file.size,
            // In a real app, this would be a URL to the uploaded file
            // For now, we'll create a data URL
            data: URL.createObjectURL(file)
        };
        
        targetCard.attachments.push(attachment);
    });
    
    // Save data and refresh
    saveBoardData();
    loadAttachments(targetCard);
    
    // Reset the file input
    e.target.value = '';
}

// Download an attachment
function downloadAttachment(attachment) {
    // In a real application, this would download from the server
    // For this demo, we'll use the data URL we created
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Delete an attachment
function deleteAttachment(cardId, attachmentId) {
    // Find the card
    let targetCard = null;
    
    for (const list of boardData.lists) {
        const card = list.cards.find(card => card.id === cardId);
        if (card) {
            targetCard = card;
            break;
        }
    }
    
    if (!targetCard || !targetCard.attachments) return;
    
    // Filter out the deleted attachment
    targetCard.attachments = targetCard.attachments.filter(attachment => attachment.id !== attachmentId);
    
    // Save data and refresh
    saveBoardData();
    loadAttachments(targetCard);
    renderBoard(); // Update card badges
}

// Save card details
function saveCardDetails() {
    const modal = document.getElementById('cardModal');
    const cardId = modal.getAttribute('data-card-id');
    
    // Find the card
    let targetCard = null;
    let targetList = null;
    
    for (const list of boardData.lists) {
        const card = list.cards.find(card => card.id === cardId);
        if (card) {
            targetCard = card;
            targetList = list;
            break;
        }
    }
    
    if (!targetCard) return;
    
    // Get updated values
    const fullName = document.getElementById('volunteerName').textContent.trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const email = document.getElementById('volunteerEmail').textContent.trim();
    const phone = document.getElementById('volunteerPhone').textContent.trim();
    const notes = document.getElementById('volunteerNotes').textContent.trim();
    
    // Update card data
    targetCard.firstName = firstName;
    targetCard.lastName = lastName;
    targetCard.email = email;
    targetCard.phone = phone;
    targetCard.notes = notes;
    
    // Save data and close modal
    saveBoardData();
    modal.style.display = 'none';
    
    // Refresh the board to show updated info
    renderBoard();
}

// Delete a card
function deleteCard() {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    const modal = document.getElementById('cardModal');
    const cardId = modal.getAttribute('data-card-id');
    
    // Find and remove the card
    for (const list of boardData.lists) {
        const cardIndex = list.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            list.cards.splice(cardIndex, 1);
            break;
        }
    }
    
    // Save data and close modal
    saveBoardData();
    modal.style.display = 'none';
    
    // Refresh the board
    renderBoard();
}

// Add a tag to a card
function addTag() {
    const modal = document.getElementById('cardModal');
    const cardId = modal.getAttribute('data-card-id');
    const tagInput = document.getElementById('newTagInput');
    const tagText = tagInput.value.trim();
    
    if (!tagText) return;
    
    // Find the card
    let targetCard = null;
    
    for (const list of boardData.lists) {
        const card = list.cards.find(card => card.id === cardId);
        if (card) {
            targetCard = card;
            break;
        }
    }
    
    if (!targetCard) return;
    
    // Initialize tags array if it doesn't exist
    if (!targetCard.tags) {
        targetCard.tags = [];
    }
    
    // Check if tag already exists
    if (targetCard.tags.includes(tagText)) {
        alert('This tag already exists!');
        return;
    }
    
    // Add the new tag
    targetCard.tags.push(tagText);
    
    // Save data and refresh
    saveBoardData();
    loadTags(targetCard);
    
    // Clear the input
    tagInput.value = '';
}

// Load tags for a card
function loadTags(card) {
    const tagsContainer = document.getElementById('volunteerTags');
    tagsContainer.innerHTML = '';
    
    if (!card.tags || card.tags.length === 0) {
        return;
    }
    
    card.tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        
        const tagText = document.createElement('span');
        tagText.textContent = tag;
        
        const removeButton = document.createElement('span');
        removeButton.className = 'tag-remove';
        removeButton.textContent = '×';
        removeButton.addEventListener('click', function() {
            removeTag(card.id, tag);
        });
        
        tagElement.appendChild(tagText);
        tagElement.appendChild(removeButton);
        
        tagsContainer.appendChild(tagElement);
    });
}

// Remove a tag from a card
function removeTag(cardId, tagText) {
    // Find the card
    let targetCard = null;
    
    for (const list of boardData.lists) {
        const card = list.cards.find(card => card.id === cardId);
        if (card) {
            targetCard = card;
            break;
        }
    }
    
    if (!targetCard || !targetCard.tags) return;
    
    // Remove the tag
    targetCard.tags = targetCard.tags.filter(tag => tag !== tagText);
    
    // Save data and refresh
    saveBoardData();
    loadTags(targetCard);
}

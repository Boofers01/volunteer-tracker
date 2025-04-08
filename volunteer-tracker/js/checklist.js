// Load checklist for a card
function loadChecklist(card) {
    const checklistContainer = document.getElementById('volunteerChecklist');
    checklistContainer.innerHTML = '';
    
    if (!card.checklist || card.checklist.length === 0) {
        checklistContainer.innerHTML = '<p>No checklist items</p>';
        return;
    }
    
    card.checklist.forEach(item => {
        const checklistItem = document.createElement('div');
        checklistItem.className = 'checklist-item';
        if (item.completed) {
            checklistItem.classList.add('completed');
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.completed;
        checkbox.addEventListener('change', function() {
            toggleChecklistItem(card.id, item.id, this.checked);
        });
        
        const itemText = document.createElement('div');
        itemText.className = 'checklist-text';
        itemText.textContent = item.text;
        
        if (item.required) {
            const requiredMark = document.createElement('span');
            requiredMark.className = 'item-required';
            requiredMark.textContent = '*';
            itemText.appendChild(requiredMark);
        }
        
        const itemDates = document.createElement('div');
        itemDates.className = 'checklist-dates';
        
        if (item.completed && item.completedDate) {
            itemDates.textContent = `Completed ${formatDate(item.completedDate)}`;
            if (item.completedBy) {
                itemDates.textContent += ` by ${item.completedBy}`;
            }
        }
        
        checklistItem.appendChild(checkbox);
        checklistItem.appendChild(itemText);
        checklistItem.appendChild(itemDates);
        
        checklistContainer.appendChild(checklistItem);
    });
    
    // Update checklist percentage
    updateChecklistPercentage(card);
}

// Toggle checklist item completion
function toggleChecklistItem(cardId, itemId, completed) {
    // Find the card
    let targetCard = null;
    
    for (const list of boardData.lists) {
        const card = list.cards.find(card => card.id === cardId);
        if (card) {
            targetCard = card;
            break;
        }
    }
    
    if (!targetCard || !targetCard.checklist) return;
    
    // Find and update the checklist item
    const item = targetCard.checklist.find(item => item.id === itemId);
    if (item) {
        item.completed = completed;
        
        if (completed) {
            item.completedDate = new Date().toISOString();
            item.completedBy = 'Jane Admin'; // In a real app, use the current user's name
        } else {
            delete item.completedDate;
            delete item.completedBy;
        }
    }
    
    // Save data and refresh
    saveBoardData();
    loadChecklist(targetCard);
    renderBoard(); // Update card badges
}

// Update checklist percentage in modal
function updateChecklistPercentage(card) {
    if (!card.checklist || card.checklist.length === 0) {
        document.getElementById('checklistPercentage').textContent = '0';
        return;
    }
    
    const total = card.checklist.length;
    const completed = card.checklist.filter(item => item.completed).length;
    const percentage = Math.round((completed / total) * 100);
    
    document.getElementById('checklistPercentage').textContent = percentage;
}

// Open master checklist modal
function openMasterChecklistModal() {
    const modal = document.getElementById('masterChecklistModal');
    
    // Load master checklist items
    loadMasterChecklist();
    
    // Show the modal
    modal.style.display = 'block';
}

// Load master checklist
function loadMasterChecklist() {
    const container = document.getElementById('masterChecklistItems');
    container.innerHTML = '';
    
    masterChecklist.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'master-checklist-item';
        itemElement.setAttribute('data-id', item.id);
        
        const handle = document.createElement('div');
        handle.className = 'item-handle';
        handle.innerHTML = '⋮⋮';
        
        const itemText = document.createElement('div');
        itemText.className = 'item-text';
        itemText.contentEditable = true;
        itemText.textContent = item.text;
        
        const requiredCheckbox = document.createElement('input');
        requiredCheckbox.type = 'checkbox';
        requiredCheckbox.checked = item.required;
        requiredCheckbox.title = 'Required';
        
        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';
        
        const moveUpButton = document.createElement('button');
        moveUpButton.innerHTML = '↑';
        moveUpButton.title = 'Move Up';
        moveUpButton.disabled = index === 0;
        moveUpButton.addEventListener('click', function() {
            moveMasterChecklistItem(item.id, 'up');
        });
        
        const moveDownButton = document.createElement('button');
        moveDownButton.innerHTML = '↓';
        moveDownButton.title = 'Move Down';
        moveDownButton.disabled = index === masterChecklist.length - 1;
        moveDownButton.addEventListener('click', function() {
            moveMasterChecklistItem(item.id, 'down');
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'danger';
        deleteButton.innerHTML = '×';
        deleteButton.title = 'Delete';
        deleteButton.addEventListener('click', function() {
            deleteMasterChecklistItem(item.id);
        });
        
        itemActions.appendChild(moveUpButton);
        itemActions.appendChild(moveDownButton);
        itemActions.appendChild(deleteButton);
        
        itemElement.appendChild(handle);
        itemElement.appendChild(itemText);
        itemElement.appendChild(requiredCheckbox);
        itemElement.appendChild(itemActions);
        
        container.appendChild(itemElement);
    });
    
    // Setup drag and drop for master checklist items
    setupMasterChecklistDragAndDrop();
}

// Setup drag and drop for master checklist items
function setupMasterChecklistDragAndDrop() {
    const container = document.getElementById('masterChecklistItems');
    const items = container.querySelectorAll('.master-checklist-item');
    
    items.forEach(item => {
        const handle = item.querySelector('.item-handle');
        
        handle.addEventListener('mousedown', function() {
            item.draggable = true;
            
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('itemId', item.getAttribute('data-id'));
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', function() {
                item.classList.remove('dragging');
                item.draggable = false;
            });
        });
        
        handle.addEventListener('mouseup', function() {
            item.draggable = false;
        });
    });
    
    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        
        const draggingItem = document.querySelector('.master-checklist-item.dragging');
        if (draggingItem) {
            const items = [...container.querySelectorAll('.master-checklist-item:not(.dragging)')];
            const nextItem = items.find(item => {
                const box = item.getBoundingClientRect();
                return e.clientY < box.top + box.height / 2;
            });
            
            if (nextItem) {
                container.insertBefore(draggingItem, nextItem);
            } else {
                container.appendChild(draggingItem);
            }
        }
    });
    
    container.addEventListener('drop', function(e) {
        const itemId = e.dataTransfer.getData('itemId');
        if (itemId) {
            // Update the masterChecklist array to match the DOM order
            const itemElements = [...container.querySelectorAll('.master-checklist-item')];
            masterChecklist = itemElements.map(element => {
                const id = parseInt(element.getAttribute('data-id'));
                const text = element.querySelector('.item-text').textContent;
                const required = element.querySelector('input[type="checkbox"]').checked;
                
                return { id, text, required };
            });
        }
    });
}

// Move a master checklist item up or down
function moveMasterChecklistItem(itemId, direction) {
    const index = masterChecklist.findIndex(item => item.id === itemId);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
        // Swap with previous item
        [masterChecklist[index], masterChecklist[index - 1]] = [masterChecklist[index - 1], masterChecklist[index]];
    } else if (direction === 'down' && index < masterChecklist.length - 1) {
        // Swap with next item
        [masterChecklist[index], masterChecklist[index + 1]] = [masterChecklist[index + 1], masterChecklist[index]];
    }
    
    loadMasterChecklist();
}

// Delete a master checklist item
function deleteMasterChecklistItem(itemId) {
    if (!confirm('Are you sure you want to delete this checklist item?')) return;
    
    masterChecklist = masterChecklist.filter(item => item.id !== itemId);
    loadMasterChecklist();
}

// Add a new master checklist item
function addMasterChecklistItem() {
    const input = document.getElementById('newChecklistItem');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Find the highest ID and add 1
    const highestId = masterChecklist.reduce((max, item) => Math.max(max, item.id), 0);
    
    const newItem = {
        id: highestId + 1,
        text: text,
        required: false
    };
    
    masterChecklist.push(newItem);
    
    input.value = '';
    loadMasterChecklist();
}

// Save master checklist
function saveMasterChecklist() {
    // Update masterChecklist from DOM
    const container = document.getElementById('masterChecklistItems');
    const itemElements = container.querySelectorAll('.master-checklist-item');
    
    masterChecklist = Array.from(itemElements).map(element => {
        return {
            id: parseInt(element.getAttribute('data-id')),
            text: element.querySelector('.item-text').textContent,
            required: element.querySelector('input[type="checkbox"]').checked
        };
    });
    
    // Save to localStorage
    saveBoardData();
    
    // Update all existing cards with new master checklist
    updateAllCardsWithMasterChecklist();
    
    // Close modal
    document.getElementById('masterChecklistModal').style.display = 'none';
}

// Update all cards with current master checklist
function updateAllCardsWithMasterChecklist() {
    boardData.lists.forEach(list => {
        list.cards.forEach(card => {
            // Create a mapping of existing checklist items by ID
            const existingItemsMap = {};
            if (card.checklist) {
                card.checklist.forEach(item => {
                    existingItemsMap[item.id] = item;
                });
            }
            
            // Create new checklist with updated master items
            card.checklist = masterChecklist.map(masterItem => {
                // If item already exists in card, keep its completion status
                if (existingItemsMap[masterItem.id]) {
                    return {
                        ...existingItemsMap[masterItem.id],
                        text: masterItem.text,
                        required: masterItem.required
                    };
                } else {
                    // Otherwise create a new uncompleted item
                    return {
                        id: masterItem.id,
                        text: masterItem.text,
                        required: masterItem.required,
                        completed: false
                    };
                }
            });
        });
    });
    
    // Save changes
    saveBoardData();
    
    // Refresh the board
    renderBoard();
}

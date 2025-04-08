// Render the entire board
function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    // Create and append lists
    boardData.lists.forEach(list => {
        const listElement = createListElement(list);
        boardElement.appendChild(listElement);
    });
    
    // Make lists draggable
    setupDragAndDrop();
}

// Create a list element
function createListElement(list) {
    const listElement = document.createElement('div');
    listElement.className = 'list';
    listElement.id = list.id;
    listElement.draggable = true;
    
    // List header
    const listHeader = document.createElement('div');
    listHeader.className = 'list-header';
    
    const listTitle = document.createElement('div');
    listTitle.className = 'list-title';
    listTitle.textContent = list.title;
    listTitle.contentEditable = true;
    listTitle.addEventListener('blur', function() {
        updateListTitle(list.id, this.textContent);
    });
    
    const listMenu = document.createElement('div');
    listMenu.className = 'list-menu';
    listMenu.innerHTML = '⋯';
    listMenu.addEventListener('click', function() {
        if (confirm('Delete this list?')) {
            deleteList(list.id);
        }
    });
    
    listHeader.appendChild(listTitle);
    listHeader.appendChild(listMenu);
    
    // List cards container
    const listCards = document.createElement('div');
    listCards.className = 'list-cards';
    
    // Add cards to list
    list.cards.forEach(card => {
        const cardElement = createCardElement(card);
        listCards.appendChild(cardElement);
    });
    
    // List footer with add card button
    const listFooter = document.createElement('div');
    listFooter.className = 'list-footer';
    
    const addCardButton = document.createElement('button');
    addCardButton.className = 'add-card-button';
    addCardButton.textContent = '+ Add Card';
    addCardButton.addEventListener('click', function() {
        addNewCard(list.id);
    });
    
    listFooter.appendChild(addCardButton);
    
    // Assemble the list
    listElement.appendChild(listHeader);
    listElement.appendChild(listCards);
    listElement.appendChild(listFooter);
    
    return listElement;
}

// Update a list title
function updateListTitle(listId, newTitle) {
    const list = boardData.lists.find(list => list.id === listId);
    if (list) {
        list.title = newTitle;
        saveBoardData();
    }
}

// Add a new list
function addNewList() {
    const titleInput = document.getElementById('newListTitle');
    const title = titleInput.value.trim();
    
    if (title) {
        const newList = {
            id: 'list-' + generateId(),
            title: title,
            cards: []
        };
        
        boardData.lists.push(newList);
        saveBoardData();
        renderBoard();
        
        titleInput.value = '';
    }
}

// Delete a list
function deleteList(listId) {
    boardData.lists = boardData.lists.filter(list => list.id !== listId);
    saveBoardData();
    renderBoard();
}

// Set up drag and drop functionality
function setupDragAndDrop() {
    const lists = document.querySelectorAll('.list');
    const cards = document.querySelectorAll('.card');
    
    // Make lists draggable
    lists.forEach(list => {
        list.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            e.dataTransfer.setData('listId', this.id);
        });
        
        list.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    // Make cards draggable
    cards.forEach(card => {
        card.addEventListener('dragstart', function(e) {
            // Prevent opening the card modal during drag
            this.removeEventListener('click', openCardModal);
            
            this.classList.add('dragging');
            e.dataTransfer.setData('cardId', this.id);
            e.dataTransfer.setData('sourceListId', this.closest('.list').id);
        });
        
        card.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            
            // Re-add click event listener after drag ends
            this.addEventListener('click', openCardModal);
        });
    });
    
    // Set up drop zones for lists
    const board = document.getElementById('board');
    board.addEventListener('dragover', function(e) {
        e.preventDefault();
        
        const draggingList = document.querySelector('.list.dragging');
        if (draggingList) {
            // Get the list we're dragging over
            const lists = [...document.querySelectorAll('.list:not(.dragging)')];
            const nextList = lists.find(list => {
                const box = list.getBoundingClientRect();
                return e.clientX < box.left + box.width / 2;
            });
            
            if (nextList) {
                board.insertBefore(draggingList, nextList);
            } else {
                board.appendChild(draggingList);
            }
        }
    });
    
    // Handle list drops to update data
    board.addEventListener('drop', function(e) {
        const listId = e.dataTransfer.getData('listId');
        if (listId) {
            // Update the lists array to match the DOM order
            const listElements = [...document.querySelectorAll('.list')];
            boardData.lists = listElements.map(element => {
                return boardData.lists.find(list => list.id === element.id);
            });
            
            saveBoardData();
        }
    });
    
    // Set up drop zones for cards
    const cardContainers = document.querySelectorAll('.list-cards');
    cardContainers.forEach(container => {
        container.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
            
            const draggingCard = document.querySelector('.card.dragging');
            if (draggingCard) {
                // Get the card we're dragging over
                const cards = [...this.querySelectorAll('.card:not(.dragging)')];
                const nextCard = cards.find(card => {
                    const box = card.getBoundingClientRect();
                    return e.clientY < box.top + box.height / 2;
                });
                
                if (nextCard) {
                    this.insertBefore(draggingCard, nextCard);
                } else {
                    this.appendChild(draggingCard);
                }
            }
        });
        
        container.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        container.addEventListener('drop', function(e) {
            this.classList.remove('drag-over');
            
            const cardId = e.dataTransfer.getData('cardId');
            const sourceListId = e.dataTransfer.getData('sourceListId');
            
            if (cardId && sourceListId) {
                const targetListId = this.closest('.list').id;
                
                // Move card in data
                moveCard(cardId, sourceListId, targetListId);
            }
        });
    });
}

// Move a card from one list to another
function moveCard(cardId, sourceListId, targetListId) {
    // Find the source and target lists
    const sourceList = boardData.lists.find(list => list.id === sourceListId);
    const targetList = boardData.lists.find(list => list.id === targetListId);
    
    if (sourceList && targetList) {
        // Find the card to move
        const cardIndex = sourceList.cards.findIndex(card => card.id === cardId);
        
        if (cardIndex !== -1) {
            // Remove the card from source list
            const [card] = sourceList.cards.splice(cardIndex, 1);
            
            // Add the card to the target list
            const targetCardContainer = document.querySelector(`#${targetListId} .list-cards`);
            const cardElements = [...targetCardContainer.querySelectorAll('.card')];
            
            // Find the index where to insert the card in the target list
            const draggedCardElement = document.getElementById(cardId);
            const nextCardElement = draggedCardElement.nextElementSibling;
            
            let insertIndex;
            if (nextCardElement) {
                // Get the index of the next card in the array
                const nextCardId = nextCardElement.id;
                insertIndex = targetList.cards.findIndex(card => card.id === nextCardId);
            } else {
                // Append to the end
                insertIndex = targetList.cards.length;
            }
            
            // Insert the card at the correct position
            targetList.cards.splice(insertIndex, 0, card);
            
            saveBoardData();
        }
    }
}

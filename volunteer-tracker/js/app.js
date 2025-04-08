// Global variables for app state
let masterChecklist = [
    { id: 1, text: 'Complete application form', required: true },
    { id: 2, text: 'Background check submitted', required: true },
    { id: 3, text: 'Background check cleared', required: true },
    { id: 4, text: 'Orientation completed', required: true },
    { id: 5, text: 'Training session 1 completed', required: true },
    { id: 6, text: 'Training session 2 completed', required: false },
    { id: 7, text: 'Signed confidentiality agreement', required: true }
];

// Store for our volunteer data
let boardData = {
    lists: [
        {
            id: 'new-applicants',
            title: 'New Applicants',
            cards: []
        },
        {
            id: 'background-check',
            title: 'Background Check',
            cards: []
        },
        {
            id: 'training',
            title: 'Training',
            cards: []
        },
        {
            id: 'active-volunteers',
            title: 'Active Volunteers',
            cards: []
        }
    ]
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Load any saved data from localStorage
    loadBoardData();
    
    // Initialize board UI
    renderBoard();
    
    // Set up event listeners
    document.getElementById('syncWithLGL').addEventListener('click', syncWithLGL);
    document.getElementById('editMasterChecklist').addEventListener('click', openMasterChecklistModal);
    document.getElementById('addList').addEventListener('click', addNewList);
    
    // Set up modal event listeners
    setupModalEventListeners();
});

// Save and load data from localStorage
function saveBoardData() {
    localStorage.setItem('boardData', JSON.stringify(boardData));
    localStorage.setItem('masterChecklist', JSON.stringify(masterChecklist));
}

function loadBoardData() {
    const savedBoardData = localStorage.getItem('boardData');
    const savedMasterChecklist = localStorage.getItem('masterChecklist');
    
    if (savedBoardData) {
        boardData = JSON.parse(savedBoardData);
    }
    
    if (savedMasterChecklist) {
        masterChecklist = JSON.parse(savedMasterChecklist);
    }
}

// Set up modal event listeners
function setupModalEventListeners() {
    // Close modals when clicking on X or outside the modal
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Tab switching in card modal
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = button.getAttribute('data-tab');
            
            // Hide all tab contents and deactivate all tab buttons
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected tab content and activate the clicked button
            document.getElementById(tabName + 'Tab').classList.add('active');
            button.classList.add('active');
        });
    });
    
    // Master checklist modal events
    document.getElementById('addChecklistItem').addEventListener('click', addMasterChecklistItem);
    document.getElementById('saveMasterChecklist').addEventListener('click', saveMasterChecklist);
    
    // Card modal events
    document.getElementById('attachButton').addEventListener('click', function() {
        document.getElementById('fileUpload').click();
    });
    
    document.getElementById('fileUpload').addEventListener('change', handleFileUpload);
    document.getElementById('saveCardButton').addEventListener('click', saveCardDetails);
    document.getElementById('deleteCardButton').addEventListener('click', deleteCard);
    document.getElementById('addTagButton').addEventListener('click', addTag);
}

// Basic utility functions
function generateId() {
    return Date.now().toString();
}

function getInitials(name) {
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

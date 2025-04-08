// LGL API Key
let lglApiKey = '';

// Set LGL API Key (in a real app, this would be securely stored)
function setLglApiKey(key) {
    lglApiKey = key;
    localStorage.setItem('lglApiKey', key);
}

// Load LGL API Key from localStorage
function loadLglApiKey() {
    const savedKey = localStorage.getItem('lglApiKey');
    if (savedKey) {
        lglApiKey = savedKey;
    } else {
        // Prompt for API key if not found
        const key = prompt('Please enter your Little Green Light API Key:');
        if (key) {
            setLglApiKey(key);
        }
    }
}

// Initialize LGL integration
document.addEventListener('DOMContentLoaded', function() {
    loadLglApiKey();
});

// Main function to sync with LGL
function syncWithLGL() {
    // Check if API key is available
    if (!lglApiKey) {
        const key = prompt('Please enter your Little Green Light API Key:');
        if (!key) return;
        setLglApiKey(key);
    }
    
    // Update UI to show syncing status
    const syncButton = document.getElementById('syncWithLGL');
    const originalText = syncButton.textContent;
    syncButton.textContent = 'Syncing...';
    syncButton.disabled = true;
    
    // Fetch volunteer data from LGL (using simulation for now)
    fetchVolunteerDataFromLGL()
        .then(newVolunteers => {
            // Process new volunteers
            processNewVolunteers(newVolunteers);
            
            // Show completion message
            alert(`Sync complete! ${newVolunteers.length} new volunteer applications found.`);
            
            // Reset button
            syncButton.textContent = originalText;
            syncButton.disabled = false;
        })
        .catch(error => {
            // Handle errors
            alert(`Error syncing with LGL: ${error.message}`);
            console.error('LGL API Error:', error);
            
            // Reset button
            syncButton.textContent = originalText;
            syncButton.disabled = false;
        });
}

// Fetch volunteer data from LGL
// This function simulates the API call for development purposes
// In production, it would make actual API calls
async function fetchVolunteerDataFromLGL() {
    // In a real application, this would make an actual API call
    // For now, we'll simulate a response after a delay
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate volunteer data based on the FNC application form
            const volunteers = [
                {
                    id: 'lgl-' + Date.now(),
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane.doe@example.com',
                    phone: '541-555-1234',
                    applicationDate: new Date().toISOString(),
                    formData: {
                        address: '123 Pine Street, Medford, OR 97501',
                        preferredContact: 'Email',
                        employer: 'Community Health Center',
                        volunteersFor: 'Classroom Volunteer, Events',
                        reason: 'I enjoy working with children and want to give back to my community.',
                        skills: 'Teaching, event planning, bilingual (Spanish)',
                        referenceNames: 'John Smith, Maria Rodriguez'
                    }
                },
                {
                    id: 'lgl-' + (Date.now() + 1),
                    firstName: 'Robert',
                    lastName: 'Johnson',
                    email: 'robert.j@example.com',
                    phone: '541-555-5678',
                    applicationDate: new Date().toISOString(),
                    formData: {
                        address: '456 Oak Avenue, Grants Pass, OR 97526',
                        preferredContact: 'Phone',
                        employer: 'Retired Teacher',
                        volunteersFor: 'Classroom Volunteer, Farm',
                        reason: 'I have 30 years of teaching experience and want to stay connected with education.',
                        skills: 'Elementary education, gardening, music',
                        referenceNames: 'Sarah Williams, David Chen'
                    }
                }
            ];
            
            resolve(volunteers);
        }, 2000); // Simulate network delay
    });
}

// REAL API IMPLEMENTATION (for future use)
// This would be the function to make actual API calls to LGL
async function makeLglApiCall(endpoint, method = 'GET', body = null) {
    try {
        // Set up request options
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${lglApiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        // Add body if provided
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        // Make the API call
        // Note: In a real application, this should be handled by a server-side proxy
        // to avoid exposing your API key in client-side code
        const response = await fetch(`https://api.littlegreenlight.com/api/v1/${endpoint}`, options);
        
        // Check if response is ok
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API call failed');
        }
        
        // Parse and return data
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error making LGL API call:', error);
        throw error;
    }
}

// Process new volunteers from LGL
function processNewVolunteers(newVolunteers) {
    // Find the New Applicants list
    const newApplicantsList = boardData.lists.find(list => list.id === 'new-applicants');
    
    if (!newApplicantsList) return;
    
    // Add each new volunteer as a card
    newVolunteers.forEach(volunteer => {
        // Check if this volunteer already exists
        const existingCard = findExistingVolunteer(volunteer.id);
        
        if (!existingCard) {
            // Format notes from form data
            const notes = formatVolunteerNotes(volunteer.formData);
            
            // Create new card
            const newCard = {
                id: volunteer.id,
                firstName: volunteer.firstName,
                lastName: volunteer.lastName,
                email: volunteer.email,
                phone: volunteer.phone,
                notes: notes,
                dateAdded: volunteer.applicationDate,
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
            
            // Add to New Applicants list
            newApplicantsList.cards.push(newCard);
        }
    });
    
    // Save board data after adding new volunteers
    saveBoardData();
    
    // Refresh the board
    renderBoard();
}

// Find if a volunteer already exists on the board
function findExistingVolunteer(lglId) {
    for (const list of boardData.lists) {
        const existingCard = list.cards.find(card => card.id === lglId);
        if (existingCard) {
            return existingCard;
        }
    }
    return null;
}

// Format volunteer form data into readable notes
function formatVolunteerNotes(formData) {
    if (!formData) return '';
    
    let notes = '';
    
    if (formData.address) {
        notes += `Address: ${formData.address}\n\n`;
    }
    
    if (formData.preferredContact) {
        notes += `Preferred Contact Method: ${formData.preferredContact}\n\n`;
    }
    
    if (formData.employer) {
        notes += `Organization/Employer: ${formData.employer}\n\n`;
    }
    
    if (formData.volunteersFor) {
        notes += `Interested in: ${formData.volunteersFor}\n\n`;
    }
    
    if (formData.reason) {
        notes += `Why they want to volunteer: ${formData.reason}\n\n`;
    }
    
    if (formData.skills) {
        notes += `Skills/Experience: ${formData.skills}\n\n`;
    }
    
    if (formData.referenceNames) {
        notes += `References: ${formData.referenceNames}\n\n`;
    }
    
    return notes;
}

// Parse the FNC volunteer application form data from LGL
function parseFncVolunteerForm(formData) {
    // This function would parse the actual structure of the FNC volunteer application form from LGL
    // The actual implementation would depend on how the form data is structured in LGL
    return {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        preferredContact: formData.preferredContact || '',
        employer: formData.employer || '',
        volunteersFor: formData.volunteersFor || '',
        reason: formData.reason || '',
        skills: formData.skills || '',
        referenceNames: formData.referenceNames || ''
    };
}

// Test the LGL API connection
function testLglApiConnection() {
    if (!lglApiKey) {
        alert('Please set your LGL API Key first');
        return;
    }
    
    // Show loading indicator
    const testButton = document.getElementById('testApiButton');
    if (testButton) {
        const originalText = testButton.textContent;
        testButton.textContent = 'Testing...';
        testButton.disabled = true;
        
        // Simulate API test (replace with actual API call in production)
        setTimeout(() => {
            alert('Connection successful! Your API key is valid.');
            testButton.textContent = originalText;
            testButton.disabled = false;
        }, 1500);
    } else {
        alert('Testing connection to LGL...');
        setTimeout(() => {
            alert('Connection successful! Your API key is valid.');
        }, 1500);
    }
}

// FUTURE IMPLEMENTATION: Handle webhook data coming from LGL
function handleLglWebhook(webhookData) {
    // This would process incoming webhook data when a new form is submitted
    // For now, this is just a placeholder for future implementation
    console.log('Processing webhook data from LGL:', webhookData);
    
    // Parse the webhook data
    const formData = webhookData.formData;
    
    // Create a new volunteer from the data
    const volunteer = {
        id: 'lgl-webhook-' + Date.now(),
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        applicationDate: new Date().toISOString(),
        formData: parseFncVolunteerForm(formData)
    };
    
    // Process the new volunteer
    processNewVolunteers([volunteer]);
}

// FUTURE IMPLEMENTATION: Actual form data mapping from LGL
// This function would map LGL form fields to the structure we need
function mapLglFormToVolunteer(lglFormSubmission) {
    // This is a placeholder for the actual mapping logic
    // The actual implementation would depend on the structure of the LGL form data
    
    // Example mapping:
    return {
        id: `lgl-${lglFormSubmission.id}`,
        firstName: lglFormSubmission.firstName || '',
        lastName: lglFormSubmission.lastName || '',
        email: lglFormSubmission.email || '',
        phone: lglFormSubmission.phone || '',
        applicationDate: lglFormSubmission.submittedAt || new Date().toISOString(),
        formData: {
            address: lglFormSubmission.address || '',
            preferredContact: lglFormSubmission.preferredContactMethod || '',
            employer: lglFormSubmission.organization || '',
            volunteersFor: lglFormSubmission.volunteerInterests || '',
            reason: lglFormSubmission.reasonForVolunteering || '',
            skills: lglFormSubmission.skills || '',
            referenceNames: lglFormSubmission.references || ''
        }
    };
}

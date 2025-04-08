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

// In a real application, this would be a function to fetch data from the LGL API
// For demonstration, we'll create a placeholder for future implementation
async function fetchVolunteersFromLGL(apiKey) {
    // This would make actual API calls to LGL
    // For example:
    /*
    const response = await fetch('https://api.littlegreenlight.com/api/v1/constituents', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data;
    */
    
    // For now, return a placeholder message
    console.log('In a real application, this would fetch volunteer data from LGL API');
    return [];
}

// Test the LGL API connection
function testLglApiConnection() {
    if (!lglApiKey) {
        alert('Please set your LGL API Key first');
        return;
    }
    
    // Show loading indicator
    alert('Testing connection to LGL...');
    
    // In a real app, this would make an actual API call to test the connection
    // For this demo, we'll simulate a successful connection after a delay
    setTimeout(() => {
        alert('Connection successful! Your API key is valid.');
    }, 1000);
}

// Parse the FNC volunteer application form data from LGL
function parseFncVolunteerForm(formData) {
    // This function would parse the specific structure of the FNC volunteer application form
    // For demonstration, we'll just return a placeholder object
    return {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: `${formData.addressLine1 || ''} ${formData.addressLine2 || ''}, ${formData.city || ''}, ${formData.state || ''} ${formData.zip || ''}`,
        preferredContact: formData.preferredContactMethod || '',
        employer: formData.organization || '',
        volunteersFor: formData.volunteerActivities ? formData.volunteerActivities.join(', ') : '',
        reason: formData.whyVolunteer || '',
        skills: formData.skillsExperience || '',
        referenceNames: [
            formData.reference1Name,
            formData.reference2Name,
            formData.reference3Name
        ].filter(Boolean).join(', ')
    };
}

// In a real implementation, this would handle webhook data coming from LGL
function handleLglWebhook(webhookData) {
    // This would process incoming webhook data when a new form is submitted
    console.log('Processing webhook data from LGL:', webhookData);
    
    // Extract the relevant data and create a new volunteer card
    // Then save and refresh the board
}

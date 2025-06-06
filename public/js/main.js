// Handle Form Submission and Data Fetching
document.getElementById("leadForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const leadData = {
        businessName: document.getElementById("businessName").value,
        category: document.getElementById("category").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        website: document.getElementById("website").value
    };

    fetch('/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Lead added successfully!');
        fetchLeads(); // Refresh the lead list
    })
    .catch(error => console.error('Error:', error));
});

// Fetch and Display Leads
function fetchLeads() {
    fetch('/get-leads')
        .then(response => response.json())
        .then(leads => {
            let leadsHTML = '';
            leads.forEach(lead => {
                leadsHTML += `
                    <tr>
                        <td class="py-2 px-4 border">${lead.businessName}</td>
                        <td class="py-2 px-4 border">${lead.category}</td>
                        <td class="py-2 px-4 border">${lead.email}</td>
                        <td class="py-2 px-4 border">${lead.phone}</td>
                        <td class="py-2 px-4 border">${lead.address}</td>
                        <td class="py-2 px-4 border">${lead.website}</td>
                        <td class="py-2 px-4 border flex space-x-2">
                            <button onclick="deleteLead('${lead._id}')" class="bg-red-500 text-white p-2 rounded">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            <button onclick="updateLead('${lead._id}')" class="bg-yellow-500 text-white p-2 rounded">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            document.getElementById('leadsList').innerHTML = leadsHTML;
        })
        .catch(error => console.error('Error:', error));
}

// Delete Lead
function deleteLead(leadId) {
    fetch(`/delete-lead/${leadId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            alert('Lead deleted successfully!');
            fetchLeads(); // Refresh the lead list
        })
        .catch(error => console.error('Error:', error));
}

// Update Lead
function updateLead(leadId) {
    const updatedData = {
        businessName: prompt("Enter new Business Name:"),
        category: prompt("Enter new Category:"),
        email: prompt("Enter new Email:"),
        phone: prompt("Enter new Phone:"),
        address: prompt("Enter new Address:"),
        website: prompt("Enter new Website:")
    };

    fetch(`/update-lead/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Lead updated successfully!');
        fetchLeads(); // Refresh the lead list
    })
    .catch(error => console.error('Error:', error));
}

// Export Leads as CSV
function exportCSV() {
    fetch('/get-leads')
        .then(response => response.json())
        .then(leads => {
            const csvContent = leads.map(lead => `${lead.businessName},${lead.category},${lead.email},${lead.phone},${lead.address},${lead.website}`).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.setAttribute("href", URL.createObjectURL(blob));
            link.setAttribute("download", "leads.csv");
            document.body.appendChild(link);
            link.click();
        })
        .catch(error => console.error('Error:', error));
}

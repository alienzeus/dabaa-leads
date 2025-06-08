// DOM Elements
const leadForm = document.getElementById('leadForm');
const leadsList = document.getElementById('leadsList');
const categorySelect = document.getElementById('category');
const otherCategoryBtn = document.getElementById('otherCategoryBtn');
const otherCategoryContainer = document.getElementById('otherCategoryContainer');
const otherCategoryInput = document.getElementById('otherCategoryInput');
const saveCategoryBtn = document.getElementById('saveCategoryBtn');
const rememberCategoryCheckbox = document.getElementById('rememberCategory');
const exportBtn = document.getElementById('exportBtn');

// On page load, fetch and display leads and categories
document.addEventListener('DOMContentLoaded', async function() {
    await fetchCategories();
    await fetchLeads();
});

// Fetch and populate categories
async function fetchCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const categories = await response.json();
        
        // Clear existing options except the first one
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        // Add categories to select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Add "Others" option at the end
        const othersOption = document.createElement('option');
        othersOption.value = 'Others';
        othersOption.textContent = 'Others';
        categorySelect.appendChild(othersOption);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to load categories', 'error');
    }
}

// Handle "Others" category button click
otherCategoryBtn.addEventListener('click', function() {
    otherCategoryContainer.classList.toggle('hidden');
    if (!otherCategoryContainer.classList.contains('hidden')) {
        otherCategoryInput.focus();
        categorySelect.value = 'Others';
    }
});

// Handle save new category
saveCategoryBtn.addEventListener('click', async function() {
    const newCategory = otherCategoryInput.value.trim();
    if (!newCategory) {
        showNotification('Please enter a category name', 'error');
        return;
    }
    
    try {
        // Check if remember checkbox is checked
        if (rememberCategoryCheckbox.checked) {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory })
            });
            
            if (!response.ok) throw new Error('Failed to save category');
            
            // Refresh categories list
            await fetchCategories();
        }
        
        // Set the new category as selected
        categorySelect.value = newCategory;
        
        // Hide the other category input
        otherCategoryContainer.classList.add('hidden');
        otherCategoryInput.value = '';
        rememberCategoryCheckbox.checked = false;
        
        showNotification('Category selected successfully', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to save category', 'error');
    }
});

// Handle category select change
categorySelect.addEventListener('change', function() {
    if (this.value === 'Others') {
        otherCategoryContainer.classList.remove('hidden');
        otherCategoryInput.focus();
    } else {
        otherCategoryContainer.classList.add('hidden');
    }
});

// Handle Form Submission
leadForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const leadData = {
        businessName: document.getElementById("businessName").value,
        category: document.getElementById("category").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        website: document.getElementById("website").value,
        socialMedia: getSocialMediaData()
    };

    try {
        let response;
        if (this.dataset.mode === 'update') {
            // Update existing lead
            response = await fetch(`/api/leads/${this.dataset.leadId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
        } else {
            // Add new lead
            response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to save lead');
        }

        showNotification(
            this.dataset.mode === 'update' 
                ? 'Lead updated successfully!' 
                : 'Lead added successfully!', 
            'success'
        );
        
        // Reset the form
        this.reset();
        document.getElementById('socialMediaContainer').innerHTML = '';
        if (this.dataset.mode === 'update') {
            delete this.dataset.mode;
            delete this.dataset.leadId;
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i><span>Add Lead</span>';
        }
        
        // Refresh the table
        fetchLeads();
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    }
});

// Fetch and Display Leads from the database
async function fetchLeads() {
    try {
        const response = await fetch('/api/leads');
        if (!response.ok) {
            throw new Error('Failed to fetch leads');
        }
        const leads = await response.json();
        
        let leadsHTML = '';
        leads.forEach(lead => {
            leadsHTML += `
                <tr class="table-row-hover">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-building text-blue-600"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${lead.businessName}</div>
                                <div class="text-sm text-gray-500">${lead.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${getCategoryColorClass(lead.category)}">
                            ${lead.category}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${lead.phone}</div>
                        <div class="text-sm text-gray-500">${lead.email}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${lead.address}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${lead.website ? `<a href="${lead.website}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
                            <i class="fas fa-external-link-alt mr-1"></i> Visit
                        </a>` : 'N/A'}
                        ${lead.socialMedia?.length > 0 ? `
                            <div class="mt-1 flex flex-wrap gap-1">
                                ${lead.socialMedia.map(sm => `
                                    <a href="${sm.url}" target="_blank" class="text-xs px-2 py-1 rounded-full ${getSocialMediaColorClass(sm.platform)}">
                                        <i class="${getSocialMediaIconClass(sm.platform)} mr-1"></i>
                                        ${sm.platform}
                                    </a>
                                `).join('')}
                            </div>
                        ` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="editLead('${lead._id}')" 
                                class="action-btn text-yellow-600 hover:text-yellow-900 mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteLead('${lead._id}')" 
                                class="action-btn text-red-600 hover:text-red-900">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        leadsList.innerHTML = leadsHTML;
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to load leads', 'error');
    }
}

// Helper function for category colors
function getCategoryColorClass(category) {
    switch(category) {
        case 'Retail': return 'bg-purple-100 text-purple-800';
        case 'Restaurant': return 'bg-red-100 text-red-800';
        case 'Healthcare': return 'bg-green-100 text-green-800';
        case 'Technology': return 'bg-blue-100 text-blue-800';
        case 'Finance': return 'bg-yellow-100 text-yellow-800';
        case 'Education': return 'bg-indigo-100 text-indigo-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Social Media Helper Functions
function getSocialMediaColorClass(platform) {
    const colors = {
        'Facebook': 'bg-blue-100 text-blue-800',
        'Instagram': 'bg-pink-100 text-pink-800',
        'Twitter': 'bg-sky-100 text-sky-800',
        'LinkedIn': 'bg-blue-200 text-blue-800',
        'YouTube': 'bg-red-100 text-red-800',
        'TikTok': 'bg-black text-white',
        'Pinterest': 'bg-red-100 text-red-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
}

function getSocialMediaIconClass(platform) {
    const icons = {
        'Facebook': 'fab fa-facebook-f',
        'Instagram': 'fab fa-instagram',
        'Twitter': 'fab fa-twitter',
        'LinkedIn': 'fab fa-linkedin-in',
        'YouTube': 'fab fa-youtube',
        'TikTok': 'fab fa-tiktok',
        'Pinterest': 'fab fa-pinterest-p'
    };
    return icons[platform] || 'fas fa-share-alt';
}

// Social Media Field Management
function addSocialMediaField(socialMedia = { platform: '', url: '' }) {
    const container = document.getElementById('socialMediaContainer');
    const fieldId = Date.now(); // Unique ID for each field
    
    const fieldHTML = `
        <div class="social-media-field flex items-end space-x-3" id="sm-${fieldId}">
            <div class="flex-1">
                <select class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 social-platform">
                    <option value="">Select Platform</option>
                    <option value="Facebook" ${socialMedia.platform === 'Facebook' ? 'selected' : ''}>Facebook</option>
                    <option value="Instagram" ${socialMedia.platform === 'Instagram' ? 'selected' : ''}>Instagram</option>
                    <option value="Twitter" ${socialMedia.platform === 'Twitter' ? 'selected' : ''}>Twitter</option>
                    <option value="LinkedIn" ${socialMedia.platform === 'LinkedIn' ? 'selected' : ''}>LinkedIn</option>
                    <option value="YouTube" ${socialMedia.platform === 'YouTube' ? 'selected' : ''}>YouTube</option>
                    <option value="TikTok" ${socialMedia.platform === 'TikTok' ? 'selected' : ''}>TikTok</option>
                    <option value="Pinterest" ${socialMedia.platform === 'Pinterest' ? 'selected' : ''}>Pinterest</option>
                </select>
            </div>
            <div class="flex-1">
                <input type="url" value="${socialMedia.url || ''}" 
                       class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 social-url" 
                       placeholder="Profile URL">
            </div>
            <button type="button" onclick="removeSocialMediaField('sm-${fieldId}')" 
                    class="text-red-500 hover:text-red-700 p-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', fieldHTML);
}

function removeSocialMediaField(id) {
    document.getElementById(id)?.remove();
}

function getSocialMediaData() {
    const fields = document.querySelectorAll('.social-media-field');
    return Array.from(fields).map(field => {
        return {
            platform: field.querySelector('.social-platform').value,
            url: field.querySelector('.social-url').value
        };
    }).filter(sm => sm.platform && sm.url); // Only return fields with both values
}

// Delete Lead
async function deleteLead(leadId) {
    if(!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
        const response = await fetch(`/api/leads/${leadId}`, { 
            method: 'DELETE' 
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete lead');
        }
        
        showNotification('Lead deleted successfully!', 'success');
        fetchLeads();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to delete lead', 'error');
    }
}

// Edit Lead
async function editLead(leadId) {
    try {
        const response = await fetch(`/api/leads/${leadId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch lead');
        }
        const lead = await response.json();
        
        // Fill the form with the lead data
        document.getElementById('businessName').value = lead.businessName || '';
        document.getElementById('category').value = lead.category || '';
        document.getElementById('email').value = lead.email || '';
        document.getElementById('phone').value = lead.phone || '';
        document.getElementById('address').value = lead.address || '';
        document.getElementById('website').value = lead.website || '';
        
        // Clear existing social media fields
        document.getElementById('socialMediaContainer').innerHTML = '';
        
        // Add social media fields if they exist
        if (lead.socialMedia?.length > 0) {
            lead.socialMedia.forEach(sm => addSocialMediaField(sm));
        }
        
        // Change the form to update mode
        leadForm.dataset.mode = 'update';
        leadForm.dataset.leadId = leadId;
        
        // Change the button text
        const submitBtn = leadForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i><span>Update Lead</span>';
        
        // Scroll to form
        leadForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Failed to load lead for editing', 'error');
    }
}

// Export Leads as CSV
exportBtn.addEventListener('click', async function() {
    try {
        const response = await fetch('/api/leads');
        if (!response.ok) {
            throw new Error('Failed to fetch leads for export');
        }
        const leads = await response.json();
        
        // Create CSV content
        const headers = ['Business Name', 'Category', 'Email', 'Phone', 'Address', 'Website', 'Social Media'];
        const rows = leads.map(lead => [
            `"${lead.businessName}"`,
            `"${lead.category}"`,
            `"${lead.email}"`,
            `"${lead.phone}"`,
            `"${lead.address}"`,
            `"${lead.website || ''}"`,
            `"${lead.socialMedia?.map(sm => `${sm.platform}: ${sm.url}`).join(' | ') || ''}"`
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('CSV exported successfully!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to export leads', 'error');
    }
});

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium 
                              ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
                              animate-fade-in-up`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('animate-fade-in-up');
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to style
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
    .animate-fade-out { animation: fadeOut 0.3s ease-in forwards; }
`;
document.head.appendChild(style);
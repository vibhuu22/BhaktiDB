// index.js
document.addEventListener('DOMContentLoaded', () => {
    const placeOptions = document.getElementById('placeOptions');
    const placeDetailsContainer = document.getElementById('placeDetails');
    const saintForm = document.getElementById('saintForm');
    const messageBox = document.getElementById('messageBox');

    // --- Function to fetch and display all saints ---
    const fetchAndDisplaySaints = async () => {
        try {
            const response = await fetch('/api/saints');
            if (!response.ok) {
                throw new Error('Failed to fetch saints data.');
            }
            const saints = await response.json();
            const saintsListContainer = document.getElementById('saintsList');
            saintsListContainer.innerHTML = ''; // Clear previous entries

            if (saints.length === 0) {
                saintsListContainer.innerHTML = '<p class="text-center text-slate-500">No entries in the database yet.</p>';
                return;
            }

            saints.forEach(saint => {
                const saintCard = document.createElement('div');
                saintCard.className = 'bg-white p-6 rounded-lg shadow-md border border-slate-200';

                // Helper to format array data, like Influence or Texts
                const formatArray = (arr) => arr && arr.length > 0 ? arr.join(', ') : 'N/A';
                
                // Helper to format the place details map into a list
                let placeDetailsHTML = '<p class="text-slate-500 italic">N/A</p>';
                if (saint.placeAssociatedDetails && Object.keys(saint.placeAssociatedDetails).length > 0) {
                     placeDetailsHTML = Object.entries(saint.placeAssociatedDetails)
                        .map(([key, value]) => `<li><strong>${key}:</strong> ${value || 'Not specified'}</li>`)
                        .join('');
                     placeDetailsHTML = `<ul class="list-disc list-inside pl-4">${placeDetailsHTML}</ul>`;
                }

                saintCard.innerHTML = `
                    <h3 class="text-xl font-bold text-teal-700 mb-3">${saint.name}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-slate-600 text-sm">
                        <p><strong>Tradition:</strong> ${saint.tradition || 'N/A'}</p>
                        <p><strong>Period:</strong> ${saint.period || 'N/A'}</p>
                        <p><strong>Gender:</strong> ${saint.gender || 'N/A'}</p>
                        <p><strong>Deity:</strong> ${saint.deity || 'N/A'}</p>
                        <p><strong>Language:</strong> ${saint.language || 'N/A'}</p>
                        <p><strong>Tradition Type:</strong> ${saint.traditionType || 'N/A'}</p>
                        <p class="md:col-span-2"><strong>Influence:</strong> ${formatArray(saint.influence)}</p>
                        <p class="md:col-span-2"><strong>Poetic Texts:</strong> ${formatArray(saint.texts)}</p>
                        <div class="md:col-span-2 mt-2">
                            <p class="font-semibold">Place Details:</p>
                            ${placeDetailsHTML}
                        </div>
                        <p class="md:col-span-2 mt-2"><strong>Philosophy:</strong><br>${saint.philosophy || 'N/A'}</p>
                    </div>
                `;
                saintsListContainer.appendChild(saintCard);
            });

        } catch (error) {
            console.error('Error fetching saints:', error);
            const saintsListContainer = document.getElementById('saintsList');
            saintsListContainer.innerHTML = '<p class="text-center text-red-500">Could not load data. Is the server running?</p>';
        }
    };

document.getElementById('traditionType').addEventListener('change', function() {
    const customTraditionInput = document.getElementById('customTradition');
    
    if (this.value === 'Others') {
        customTraditionInput.style.display = 'block';
        customTraditionInput.required = true;
    } else {
        customTraditionInput.style.display = 'none';
        customTraditionInput.required = false;
        customTraditionInput.value = ''; // Clear the input when hidden
    }
});

    // --- Dynamic Textbox Logic ---
    placeOptions.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const value = e.target.value;
            const groupId = `group-${value}`;
            const existingGroup = document.getElementById(groupId);

            if (e.target.checked && !existingGroup) {
                const inputGroup = document.createElement('div');
                inputGroup.id = groupId;
                inputGroup.innerHTML = `
                    <label for="placeDetail-${value}" class="block text-sm font-medium text-slate-600">Details for ${value}</label>
                    <input type="text" id="placeDetail-${value}" name="placeDetail-${value}" class="mt-1 block w-full rounded-md bg-slate-100 border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-3 px-4">
                `;
                placeDetailsContainer.appendChild(inputGroup);
            } else if (!e.target.checked && existingGroup) {
                existingGroup.remove();
            }
        }
    });

    // --- Form Submission Logic ---
    saintForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const showMessage = (message, isError = false) => {
            messageBox.textContent = message;
            messageBox.className = 'fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg';
            messageBox.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
            messageBox.classList.remove('hidden');
            setTimeout(() => messageBox.classList.add('hidden'), 4000);
        };
        
        const formData = new FormData(saintForm);

        const saintName = formData.get('name');
        if (!saintName || saintName.trim() === '') {
            showMessage('"Name of Saint" is a required field.', true);
            return; 
        }

        const structuredData = {
            name: saintName,
            tradition: formData.get('tradition'),
            influence: formData.get('influence') ? formData.get('influence').split(',').map(item => item.trim()) : [],
            period: formData.get('period'),
            traditionType: formData.get('traditionType') === 'Others' ? formData.get('customTradition') : formData.get('traditionType'),
            gender: formData.get('gender'),
            language: formData.get('language'),
            deity: formData.get('deity'),
            texts: formData.get('texts') ? formData.get('texts').split(',').map(item => item.trim()) : [],
            philosophy: formData.get('philosophy'),
            placeAssociated: formData.getAll('placeAssociated'),
            placeAssociatedDetails: {}
        };
        
        structuredData.placeAssociated.forEach(place => {
            const detailValue = formData.get(`placeDetail-${place}`);
            if (detailValue) {
                structuredData.placeAssociatedDetails[place] = detailValue;
            }
        });
        
        try {
            const response = await fetch('/api/saints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(structuredData),
            });

            if (response.ok) {
                const result = await response.json();
                showMessage(`Success: '${result.name}' added!`);
                saintForm.reset();
                placeDetailsContainer.innerHTML = '';
                fetchAndDisplaySaints(); // Refresh the list after adding a new saint
            } else {
                const errorData = await response.json();
                showMessage(`Error: ${errorData.message}`, true);
            }
        } catch (error) {
            console.error('Submission Error:', error);
            showMessage('Network error. Is the server running?', true);
        }
    });

    // Initial fetch of data when the page loads
    fetchAndDisplaySaints();
});

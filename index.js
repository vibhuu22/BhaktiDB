// index.js
document.addEventListener('DOMContentLoaded', () => {
    const placeOptions = document.getElementById('placeOptions');
    const placeDetailsContainer = document.getElementById('placeDetails');
    const saintForm = document.getElementById('saintForm');
    const messageBox = document.getElementById('messageBox');

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

        // THE FIX: Add frontend validation for the required 'name' field.
        const saintName = formData.get('name');
        if (!saintName || saintName.trim() === '') {
            showMessage('"Name of Saint" is a required field.', true);
            return; // Stop the submission if the name is empty
        }

        const structuredData = {
            name: saintName,
            tradition: formData.get('tradition'),
            influence: formData.get('influence') ? formData.get('influence').split(',').map(item => item.trim()) : [],
            period: formData.get('period'),
            traditionType: formData.get('traditionType'),
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
        
        // Send data to the server
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
            } else {
                const errorData = await response.json();
                showMessage(`Error: ${errorData.message}`, true);
            }
        } catch (error) {
            console.error('Submission Error:', error);
            showMessage('Network error. Is the server running?', true);
        }
    });
});

// index.js
document.addEventListener('DOMContentLoaded', () => {
    const placeOptions = document.getElementById('placeOptions');
    const placeDetailsContainer = document.getElementById('placeDetails');
    const saintForm = document.getElementById('saintForm');
    const messageBox = document.getElementById('messageBox');

    // --- Dynamic Textbox Logic (FIXED) ---
    placeOptions.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const value = e.target.value;
            // The group (label + input) will have this ID
            const groupId = `group-${value}`;
            const existingGroup = document.getElementById(groupId);

            if (e.target.checked && !existingGroup) {
                // Add a new textbox if checked and it doesn't exist
                const inputGroup = document.createElement('div');
                inputGroup.id = groupId; // Use the group ID here
                inputGroup.innerHTML = `
                    <label for="placeDetail-${value}" class="block text-sm font-medium text-slate-600">Details for ${value}</label>
                    <input type="text" id="placeDetail-${value}" name="placeDetail-${value}" class="mt-1 block w-full rounded-md bg-slate-100 border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-3 px-4">
                `;
                placeDetailsContainer.appendChild(inputGroup);
            } else if (!e.target.checked && existingGroup) {
                // Remove the entire group if unchecked
                existingGroup.remove();
            }
        }
    });

    // --- Form Submission Logic ---
    saintForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop page from reloading

        // Helper function to show messages
        const showMessage = (message, isError = false) => {
            messageBox.textContent = message;
            messageBox.className = 'fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg'; // Reset classes
            messageBox.classList.add(isError ? 'bg-red-500' : 'bg-green-500');
            messageBox.classList.remove('hidden');
            setTimeout(() => messageBox.classList.add('hidden'), 4000);
        };
        
        const formData = new FormData(saintForm);
        const data = {};

        // This approach is simpler and less error-prone.
        // We let FormData do the work and then structure the data.
        for (const [key, value] of formData.entries()) {
            // This handles multiple checkboxes with the same name correctly.
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        // Format the data for the backend schema
        const structuredData = {
            name: data.name,
            tradition: data.tradition,
            influence: data.influence ? data.influence.split(',').map(item => item.trim()) : [],
            period: data.period,
            traditionType: data.traditionType,
            gender: data.gender,
            language: data.language,
            deity: data.deity,
            texts: data.texts ? data.texts.split(',').map(item => item.trim()) : [],
            philosophy: data.philosophy,
            placeAssociated: data.placeAssociated || [],
            placeAssociatedDetails: {}
        };
        
        if (structuredData.placeAssociated) {
            structuredData.placeAssociated.forEach(place => {
                const detailKey = `placeDetail-${place}`;
                if (data[detailKey]) {
                    structuredData.placeAssociatedDetails[place] = data[detailKey];
                }
            });
        }
        
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
                placeDetailsContainer.innerHTML = ''; // Clear dynamic fields
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

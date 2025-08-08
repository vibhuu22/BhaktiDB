// index.js

document.addEventListener('DOMContentLoaded', () => {
    const placeOptions = document.getElementById('placeOptions');
    const placeDetails = document.getElementById('placeDetails');
    const form = document.getElementById('saintForm');
    const messageBox = document.getElementById('messageBox');

    // This object will hold the dynamically created input fields
    const dynamicInputs = {};

    placeOptions.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const value = e.target.value;
            if (e.target.checked) {
                // Create a new input field if it doesn't exist
                if (!dynamicInputs[value]) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'relative';
                    
                    const label = document.createElement('label');
                    label.htmlFor = `place_${value}`;
                    label.textContent = `Details for ${value}`;
                    label.className = 'block text-sm font-medium text-slate-600';

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = `place_${value}`;
                    input.name = `place_${value}`;
                    input.className = 'mt-1 block w-full rounded-md bg-slate-100 border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm py-3 px-4';
                    input.placeholder = `Enter details for ${value}...`;
                    
                    wrapper.appendChild(label);
                    wrapper.appendChild(input);
                    
                    placeDetails.appendChild(wrapper);
                    dynamicInputs[value] = wrapper;
                }
            } else {
                // Remove the input field if the checkbox is unchecked
                if (dynamicInputs[value]) {
                    placeDetails.removeChild(dynamicInputs[value]);
                    delete dynamicInputs[value];
                }
            }
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {};
        
        // Standard form fields
        for (let [key, value] of formData.entries()) {
            if (!key.startsWith('place_')) {
                 // Handle multiple selections for checkboxes
                if (data[key]) {
                    if (!Array.isArray(data[key])) {
                        data[key] = [data[key]];
                    }
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }
        }
        
        // --- ROBUST HANDLING OF COMMA-SEPARATED FIELDS ---
        data.influence = data.influence ? data.influence.split(',').map(s => s.trim()) : [];
        data.texts = data.texts ? data.texts.split(',').map(s => s.trim()) : [];


        // Dynamic 'placeAssociated' fields
        data.placeAssociatedDetails = {};
        const checkedPlaces = formData.getAll('placeAssociated');
        checkedPlaces.forEach(place => {
            const input = document.getElementById(`place_${place}`);
            if (input) {
                data.placeAssociatedDetails[place] = input.value;
            }
        });

        // --- ADDED FOR DEBUGGING ---
        console.log("Data being sent to server:", JSON.stringify(data, null, 2));

        try {
            const response = await fetch('/api/saints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(`Success: Saint '${result.name}' added with ID: ${result._id}`, 'success');
                form.reset();
                placeDetails.innerHTML = ''; // Clear dynamic fields
                Object.keys(dynamicInputs).forEach(key => delete dynamicInputs[key]); // Reset state
            } else {
                showMessage(`Error: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showMessage('An error occurred while submitting the form.', 'error');
        }
    });

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `fixed top-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 5000);
    }
});

// Initialize form data from local storage if available
window.onload = function() {
    loadFormData();
    updateIEPGoal();
};

// Event listeners
document.getElementById('generate-button').addEventListener('click', generateIEPGoal);
document.getElementById('iep-form').addEventListener('input', updateIEPGoal);
document.getElementById('download-button').addEventListener('click', downloadGoal);
document.getElementById('clear-button').addEventListener('click', clearFormData);

function generateIEPGoal() {
    // Get form values
    const deadline = document.getElementById('deadline').value;
    const studentName = document.getElementById('student-name').value.trim();
    const skills = document.getElementById('skills').value.trim();
    const accuracy = document.getElementById('accuracy').value;
    const specificNumber = document.getElementById('specific-number').value;
    const totalNumber = document.getElementById('total-number').value;

    // Validate required fields
    if (!deadline || !studentName || !skills || !accuracy || !specificNumber || !totalNumber) {
        return;
    }

    // Get selected conditions
    let selectedConditions = getCheckedValues('condition-checkboxes');
    const customConditions = document.getElementById('custom-conditions').value.split(',').map(item => item.trim()).filter(item => item);
    selectedConditions = selectedConditions.concat(customConditions);

    // Get selected measurements
    let selectedMeasurements = getCheckedValues('measurement-checkboxes');
    const customMeasurements = document.getElementById('custom-measurements').value.split(',').map(item => item.trim()).filter(item => item);
    selectedMeasurements = selectedMeasurements.concat(customMeasurements);

    // Format deadline
    const deadlineDate = new Date(deadline);
    const options = { year: 'numeric', month: 'long' };
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', options);

    // Process skills
    const skillsList = skills.split(';').map(skill => skill.trim()).filter(skill => skill);
    const skillsText = skillsList.length > 1 ? listToString(skillsList) : skillsList[0];

    // Create the IEP goal string
    let iepGoal = `By ${formattedDeadline}, given ${listToString(selectedConditions)}, ${studentName} will ${skillsText} with ${accuracy}% accuracy on ${specificNumber} out of ${totalNumber} trials/sessions as measured by ${listToString(selectedMeasurements)}.`;

    // Display the generated IEP goal
    document.getElementById('iep-goal-output').innerText = iepGoal;
}

function updateIEPGoal() {
    generateIEPGoal();
    saveFormData();
    validateForm();
}

function listToString(list) {
    if (list.length === 0) {
        return '';
    } else if (list.length === 1) {
        return list[0];
    } else if (list.length === 2) {
        return `${list[0]} and ${list[1]}`;
    } else {
        const lastItem = list.pop();
        return `${list.join(', ')}, and ${lastItem}`;
    }
}

function filterCheckboxes(containerId, searchInputId) {
    const searchInput = document.getElementById(searchInputId).value.toLowerCase();
    const container = document.getElementById(containerId);
    const categories = container.getElementsByClassName('category');

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const labels = category.getElementsByTagName('label');
        let anyVisible = false;

        for (let j = 0; j < labels.length; j++) {
            const labelText = labels[j].innerText.toLowerCase();
            if (labelText.includes(searchInput)) {
                labels[j].style.display = '';
                anyVisible = true;
            } else {
                labels[j].style.display = 'none';
            }
        }

        // Hide or show the category based on label visibility
        if (anyVisible) {
            category.style.display = '';
        } else {
            category.style.display = 'none';
        }
    }
}

function getCheckedValues(containerId) {
    const container = document.getElementById(containerId);
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

function saveFormData() {
    const formData = {
        deadline: document.getElementById('deadline').value,
        studentName: document.getElementById('student-name').value,
        skills: document.getElementById('skills').value,
        accuracy: document.getElementById('accuracy').value,
        specificNumber: document.getElementById('specific-number').value,
        totalNumber: document.getElementById('total-number').value,
        selectedConditions: getCheckedValues('condition-checkboxes'),
        customConditions: document.getElementById('custom-conditions').value,
        selectedMeasurements: getCheckedValues('measurement-checkboxes'),
        customMeasurements: document.getElementById('custom-measurements').value,
        iepGoal: document.getElementById('iep-goal-output').innerText
    };
    localStorage.setItem('iepFormData', JSON.stringify(formData));
}

function loadFormData() {
    const formData = JSON.parse(localStorage.getItem('iepFormData'));
    if (formData) {
        document.getElementById('deadline').value = formData.deadline;
        document.getElementById('student-name').value = formData.studentName;
        document.getElementById('skills').value = formData.skills;
        document.getElementById('accuracy').value = formData.accuracy;
        document.getElementById('specific-number').value = formData.specificNumber;
        document.getElementById('total-number').value = formData.totalNumber;
        // Set selected conditions
        const conditionCheckboxes = document.getElementById('condition-checkboxes').querySelectorAll('input[type="checkbox"]');
        conditionCheckboxes.forEach(checkbox => {
            checkbox.checked = formData.selectedConditions.includes(checkbox.value);
        });
        document.getElementById('custom-conditions').value = formData.customConditions;
        // Set selected measurements
        const measurementCheckboxes = document.getElementById('measurement-checkboxes').querySelectorAll('input[type="checkbox"]');
        measurementCheckboxes.forEach(checkbox => {
            checkbox.checked = formData.selectedMeasurements.includes(checkbox.value);
        });
        document.getElementById('custom-measurements').value = formData.customMeasurements;
        document.getElementById('iep-goal-output').innerText = formData.iepGoal;
    }
}

function clearFormData() {
    if (confirm('Are you sure you want to clear the form?')) {
        localStorage.removeItem('iepFormData');
        document.getElementById('iep-form').reset();
        document.getElementById('iep-goal-output').innerText = '';
        // Clear checkboxes
        const conditionCheckboxes = document.getElementById('condition-checkboxes').querySelectorAll('input[type="checkbox"]');
        conditionCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        const measurementCheckboxes = document.getElementById('measurement-checkboxes').querySelectorAll('input[type="checkbox"]');
        measurementCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        // Clear validation
        const inputs = document.querySelectorAll('#iep-form input[required], #iep-form textarea[required]');
        inputs.forEach(input => {
            input.classList.remove('invalid');
        });
    }
}

function validateForm() {
    const inputs = document.querySelectorAll('#iep-form input[required], #iep-form textarea[required]');
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    });
}

function downloadGoal() {
    const iepGoal = document.getElementById('iep-goal-output').innerText.trim();
    if (!iepGoal) {
        alert('Please generate the IEP goal before downloading.');
        return;
    }
    const blob = new Blob([iepGoal], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'IEP_Goal.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

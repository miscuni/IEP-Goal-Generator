// Global variables to store standards data
let mathStandards = [];
let elaStandards = [];
let filteredStandards = [];

// Replace the URLs below with the raw URLs of your GitHub JSON files
const MATH_JSON_URL = 'https://raw.githubusercontent.com/your-username/your-repository/main/math.json';
const ELA_JSON_URL = 'https://raw.githubusercontent.com/your-username/your-repository/main/ela.json';

// Initialize form data from local storage if available
window.onload = function() {
    loadFormData();
    updateIEPGoal();
    fetchStandardsData();
};

// Function to fetch standards data from GitHub JSON files
function fetchStandardsData() {
    document.getElementById('standards-loading').style.display = 'block';
    document.getElementById('standards-checkboxes').style.display = 'none';

    // Fetch Math Standards
    fetch(MATH_JSON_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for math.json');
            }
            return response.json();
        })
        .then(data => {
            mathStandards = data;
            // Fetch ELA Standards after Math Standards are fetched
            return fetch(ELA_JSON_URL);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for ela.json');
            }
            return response.json();
        })
        .then(data => {
            elaStandards = data;
            document.getElementById('standards-loading').style.display = 'none';
            document.getElementById('standards-checkboxes').style.display = 'block';
            // If content area and grade level are already selected, populate standards
            const contentArea = document.getElementById('content-area').value;
            const gradeLevel = document.getElementById('grade-level').value;
            if (contentArea && gradeLevel) {
                filterStandards();
            }
        })
        .catch(error => {
            console.error('Error fetching standards:', error);
            document.getElementById('standards-loading').innerText = 'Failed to load standards.';
        });
}

// Event listeners for content area and grade level selectors
document.getElementById('content-area').addEventListener('change', filterStandards);
document.getElementById('grade-level').addEventListener('change', filterStandards);

// Function to filter and display standards based on selections and search query
function filterStandards() {
    const contentArea = document.getElementById('content-area').value;
    const gradeLevel = document.getElementById('grade-level').value.toLowerCase();
    const searchQuery = document.getElementById('standard-search').value.toLowerCase();

    let standards = [];

    if (contentArea === 'math') {
        standards = mathStandards.filter(standard => standard.grade.toLowerCase() === gradeLevel);
    } else if (contentArea === 'ela') {
        standards = elaStandards.filter(standard => standard.grade.toLowerCase() === gradeLevel);
    }

    // Further filter based on search query
    if (searchQuery) {
        standards = standards.filter(standard => standard.description.toLowerCase().includes(searchQuery));
    }

    filteredStandards = standards; // Update global variable for potential future use

    displayStandards(standards);
}

// Function to display standards as checkboxes
function displayStandards(standards) {
    const container = document.getElementById('standards-checkboxes');
    container.innerHTML = ''; // Clear previous standards

    if (standards.length === 0) {
        container.innerHTML = '<p>No standards available for the selected content area and grade level.</p>';
        return;
    }

    standards.forEach(standard => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${standard.id}"> ${standard.description}`;
        container.appendChild(label);
    });

    // If there are saved standards in localStorage, check them
    const savedStandards = getSavedStandards();
    if (savedStandards.length > 0) {
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (savedStandards.includes(checkbox.value) || savedStandards.includes(checkbox.nextSibling.textContent.trim())) {
                checkbox.checked = true;
            }
        });
    }
}

// Function to get checked values from a container
function getCheckedValues(containerId) {
    const container = document.getElementById(containerId);
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

// Function to generate the IEP Goal
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

    // Get selected standards
    let selectedStandards = getCheckedValues('standards-checkboxes');
    const customStandards = document.getElementById('custom-standards').value.split(',').map(item => item.trim()).filter(item => item);
    selectedStandards = selectedStandards.concat(customStandards);

    // Format deadline
    const deadlineDate = new Date(deadline);
    const options = { year: 'numeric', month: 'long' };
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', options);

    // Process skills
    const skillsList = skills.split(';').map(skill => skill.trim()).filter(skill => skill);
    const skillsText = skillsList.length > 1 ? listToString(skillsList) : skillsList[0];

    // Process selected standards
    let standardsText = '';
    if (selectedStandards.length > 0) {
        standardsText = ` Aligned to the following Maryland standards: ${listToString(selectedStandards)}.`;
    }

    // Create the IEP goal string
    let iepGoal = `By ${formattedDeadline}, given ${listToString(selectedConditions)}, ${studentName} will ${skillsText} with ${accuracy}% accuracy on ${specificNumber} out of ${totalNumber} trials/sessions as measured by ${listToString(selectedMeasurements)}.${standardsText}`;

    // Display the generated IEP goal
    document.getElementById('iep-goal-output').innerText = iepGoal;
}

// Function to update the IEP Goal in real-time
function updateIEPGoal() {
    generateIEPGoal();
    saveFormData();
    validateForm();
}

// Utility function to convert list to a formatted string
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

// Function to save form data to local storage
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
        selectedStandards: getCheckedValues('standards-checkboxes'),
        customStandards: document.getElementById('custom-standards').value,
        iepGoal: document.getElementById('iep-goal-output').innerText,
        contentArea: document.getElementById('content-area').value,
        gradeLevel: document.getElementById('grade-level').value
    };
    localStorage.setItem('iepFormData', JSON.stringify(formData));
}

// Function to get saved standards from localStorage
function getSavedStandards() {
    const formData = JSON.parse(localStorage.getItem('iepFormData'));
    if (formData && formData.selectedStandards) {
        return formData.selectedStandards;
    }
    return [];
}

// Function to load form data from local storage
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

        // Set selected standards
        if (formData.contentArea && formData.gradeLevel) {
            document.getElementById('content-area').value = formData.contentArea;
            document.getElementById('grade-level').value = formData.gradeLevel;
            filterStandards(); // This will populate the standards-checkboxes
            // Delay checking the checkboxes until standards are loaded
            setTimeout(() => {
                const standardsCheckboxes = document.getElementById('standards-checkboxes').querySelectorAll('input[type="checkbox"]');
                standardsCheckboxes.forEach(checkbox => {
                    if (formData.selectedStandards.includes(checkbox.value) || formData.selectedStandards.includes(checkbox.nextSibling.textContent.trim())) {
                        checkbox.checked = true;
                    }
                });
            }, 1500); // Adjust delay as needed based on fetch time
        }
        document.getElementById('custom-standards').value = formData.customStandards;

        document.getElementById('iep-goal-output').innerText = formData.iepGoal;
    }
}

// Function to clear form data
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
        const standardsCheckboxes = document.getElementById('standards-checkboxes').querySelectorAll('input[type="checkbox"]');
        standardsCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        // Clear validation
        const inputs = document.querySelectorAll('#iep-form input[required], #iep-form textarea[required]');
        inputs.forEach(input => {
            input.classList.remove('invalid');
        });
    }
}

// Function to validate form inputs
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

// Function to download the IEP Goal as a text file
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

// Event listeners
document.getElementById('generate-button').addEventListener('click', generateIEPGoal);
document.getElementById('iep-form').addEventListener('input', updateIEPGoal);
document.getElementById('download-button').addEventListener('click', downloadGoal);
document.getElementById('clear-button').addEventListener('click', clearFormData);


document.addEventListener("DOMContentLoaded", function() {
    console.log("🔧 Admin Create User page loaded");
    
    // Initialize the page
    initializePage();
    
    // Check authentication
    checkAdminAuth();
    
    // Load current user info
    loadCurrentUser();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup role selection
    setupRoleSelection();
    
    // Setup password strength checker
    setupPasswordValidation();
    
    // Setup form submission
    setupFormSubmission();
    
    // Setup test button
    setupTestButton();
});

// ============ INITIALIZATION ============
function initializePage() {
    console.log("Initializing create user page...");
    
    // Make sure all required elements exist
    if (!document.getElementById('userCreationForm')) {
        console.error('❌ Form element not found!');
        showToast('Error: Form not found on page', 'danger');
        return;
    }
    
    console.log('✅ Page initialized successfully');
}

// ============ AUTHENTICATION ============
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    
    console.log('Auth check - Logged in:', isLoggedIn, 'Role:', userRole);
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        showToast('Please login first', 'warning');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return false;
    }
    
    if (userRole !== 'admin') {
        showToast('Access denied. Admin privileges required.', 'danger');
        setTimeout(() => {
            const dashboards = {
                'officer': 'officer_dashboard.html',
                'analyst': 'analyst_dashboard.html',
                'court': 'court_presentation.html'
            };
            window.location.href = dashboards[userRole] || 'index.html';
        }, 2000);
        return false;
    }
    
    return true;
}

function loadCurrentUser() {
    const fullName = localStorage.getItem('fullName');
    const username = localStorage.getItem('username');
    
    if (fullName) {
        document.getElementById('currentUser').textContent = fullName;
    } else if (username) {
        document.getElementById('currentUser').textContent = username;
    }
}

// ============ FORM SETUP ============
function setupFormValidation() {
    const form = document.getElementById('userCreationForm');
    const resetBtn = document.getElementById('resetFormBtn');
    
    // Reset form button
    resetBtn.addEventListener('click', function() {
        if (confirm('Reset the form? All entered data will be lost.')) {
            form.reset();
            resetRoleSelection();
            showToast('Form reset successfully', 'info');
        }
    });
    
    // Real-time validation
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            validateUsername(this.value);
        });
    }
}

function setupRoleSelection() {
    const roleCards = document.querySelectorAll('.user-role-card');
    const roleInput = document.getElementById('userRole');
    
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selection from all cards
            roleCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            this.classList.add('selected');
            
            // Set the hidden input value
            const selectedRole = this.getAttribute('data-role');
            roleInput.value = selectedRole;
            
            console.log('Selected role:', selectedRole);
            showToast(`Role selected: ${getRoleDisplayName(selectedRole)}`, 'info');
        });
    });
    
    // Auto-select first role
    if (roleCards.length > 0 && !roleInput.value) {
        roleCards[0].click();
    }
}

function resetRoleSelection() {
    const roleCards = document.querySelectorAll('.user-role-card');
    const roleInput = document.getElementById('userRole');
    
    roleCards.forEach(card => card.classList.remove('selected'));
    roleInput.value = '';
    
    // Re-select first role
    if (roleCards.length > 0) {
        roleCards[0].click();
    }
}

function getRoleDisplayName(role) {
    const roleNames = {
        'admin': 'Administrator',
        'officer': 'Evidence Officer',
        'analyst': 'Forensic Analyst',
        'court': 'Court Officer',
        'investigator': 'Investigator',
        'legal': 'Legal Officer'
    };
    return roleNames[role] || role;
}

// ============ PASSWORD VALIDATION ============
function setupPasswordValidation() {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    if (confirmInput) {
        confirmInput.addEventListener('input', function() {
            checkPasswordMatch();
        });
    }
}

function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrength');
    const lengthCheck = document.getElementById('lengthCheck');
    const numberCheck = document.getElementById('numberCheck');
    const caseCheck = document.getElementById('caseCheck');
    
    let strength = 0;
    
    // Check length
    if (password.length >= 8) {
        strength += 33;
        lengthCheck.innerHTML = '<i class="bi bi-check-circle text-success"></i> At least 8 characters';
    } else {
        lengthCheck.innerHTML = '<i class="bi bi-dot text-muted"></i> At least 8 characters';
    }
    
    // Check for numbers
    if (/\d/.test(password)) {
        strength += 33;
        numberCheck.innerHTML = '<i class="bi bi-check-circle text-success"></i> Contains a number';
    } else {
        numberCheck.innerHTML = '<i class="bi bi-dot text-muted"></i> Contains a number';
    }
    
    // Check for mixed case
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
        strength += 34;
        caseCheck.innerHTML = '<i class="bi bi-check-circle text-success"></i> Mixed case letters';
    } else {
        caseCheck.innerHTML = '<i class="bi bi-dot text-muted"></i> Mixed case letters';
    }
    
    // Update strength bar
    strengthBar.style.width = `${strength}%`;
    
    // Set color based on strength
    if (strength < 33) {
        strengthBar.style.backgroundColor = '#dc3545';
    } else if (strength < 66) {
        strengthBar.style.backgroundColor = '#ffc107';
    } else {
        strengthBar.style.backgroundColor = '#28a745';
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const matchElement = document.getElementById('passwordMatch');
    
    if (!confirm) {
        matchElement.innerHTML = '';
        return;
    }
    
    if (password === confirm) {
        matchElement.innerHTML = '<i class="bi bi-check-circle text-success"></i> Passwords match';
        matchElement.className = 'form-text text-success';
    } else {
        matchElement.innerHTML = '<i class="bi bi-x-circle text-danger"></i> Passwords do not match';
        matchElement.className = 'form-text text-danger';
    }
}

// ============ FORM SUBMISSION ============
function setupFormSubmission() {
    const form = document.getElementById('userCreationForm');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('🚀 Form submission started');
        
        // Validate form
        if (!validateForm()) {
            showToast('Please fix the errors in the form', 'warning');
            return;
        }
        
        // Prepare form data
        const formData = {
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            fullName: document.getElementById('fullName').value.trim(),
            userRole: document.getElementById('userRole').value,
            email: document.getElementById('email').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            station: document.getElementById('station').value.trim()
        };
        
        console.log('📤 Submitting form data:', formData);
        
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');
        
        submitBtn.disabled = true;
        submitText.textContent = 'Creating User...';
        submitSpinner.classList.remove('d-none');
        
        try {
            // Send request to server
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            console.log('📥 Server response status:', response.status);
            
            const data = await response.json();
            console.log('📥 Server response data:', data);
            
            if (data.success) {
                // SUCCESS
                showToast(
                    `✅ User created successfully!<br>
                    <small>Username: ${formData.username}<br>
                    Name: ${formData.fullName}<br>
                    Role: ${getRoleDisplayName(formData.userRole)}</small>`,
                    'success',
                    5000
                );
                
                // Reset form
                setTimeout(() => {
                    form.reset();
                    resetRoleSelection();
                    submitBtn.disabled = false;
                    submitText.innerHTML = '<i class="bi bi-person-plus me-2"></i>Create User Account';
                    submitSpinner.classList.add('d-none');
                    
                    // Optionally redirect to view users page
                    // window.location.href = 'admin_view_users.html';
                }, 2000);
                
            } else {
                // ERROR from server
                throw new Error(data.message || 'Server returned an error');
            }
            
        } catch (error) {
            console.error('❌ Form submission error:', error);
            
            // Show error message
            showToast(
                `❌ Failed to create user<br>
                <small>${error.message || 'Please try again'}</small>`,
                'danger',
                5000
            );
            
            // Reset button state
            submitBtn.disabled = false;
            submitText.innerHTML = '<i class="bi bi-person-plus me-2"></i>Create User Account';
            submitSpinner.classList.add('d-none');
        }
    });
}

function validateForm() {
    let isValid = true;
    
    // Check required fields
    const requiredFields = ['fullName', 'username', 'userRole', 'password', 'confirmPassword', 'station'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Check password match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        isValid = false;
        document.getElementById('confirmPassword').classList.add('is-invalid');
        showToast('Passwords do not match', 'warning');
    }
    
    // Check password strength
    if (password.length < 6) {
        isValid = false;
        document.getElementById('password').classList.add('is-invalid');
        showToast('Password must be at least 6 characters', 'warning');
    }
    
    return isValid;
}

async function validateUsername(username) {
    if (!username || username.length < 3) return;
    
    try {
        // Check if username already exists by fetching all users
        const response = await fetch('/api/users');
        const data = await response.json();
        
        if (data.success) {
            const existingUser = data.users.find(user => 
                user.username.toLowerCase() === username.toLowerCase()
            );
            
            if (existingUser) {
                document.getElementById('username').classList.add('is-invalid');
                showToast(`Username "${username}" already exists`, 'warning');
                return false;
            }
        }
        
        document.getElementById('username').classList.remove('is-invalid');
        return true;
        
    } catch (error) {
        console.error('Error validating username:', error);
        return true; // Assume valid if we can't check
    }
}

// ============ TEST CONNECTION ============
function setupTestButton() {
    const testBtn = document.getElementById('testApiBtn');
    
    testBtn.addEventListener('click', async function() {
        console.log('🧪 Testing API connection...');
        
        testBtn.disabled = true;
        const originalText = testBtn.innerHTML;
        testBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Testing...';
        
        try {
            // Test 1: Health endpoint
            const healthResponse = await fetch('/api/health');
            const healthData = await healthResponse.json();
            
            if (!healthData.success) {
                throw new Error('Health check failed: ' + healthData.message);
            }
            
            // Test 2: Users endpoint
            const usersResponse = await fetch('/api/users');
            const usersData = await usersResponse.json();
            
            showToast(
                `✅ Connection successful!<br>
                <small>Server: ${healthData.status}<br>
                Users in system: ${usersData.users?.length || 0}</small>`,
                'success',
                4000
            );
            
            console.log('✅ API tests passed:', { healthData, usersData });
            
        } catch (error) {
            console.error('❌ API test failed:', error);
            
            showToast(
                `❌ Connection test failed<br>
                <small>${error.message}</small>`,
                'danger',
                5000
            );
            
        } finally {
            testBtn.disabled = false;
            testBtn.innerHTML = originalText;
        }
    });
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast ID
    const toastId = 'toast-' + Date.now();
    
    // Toast HTML
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">
                    ${type === 'success' ? '✅ Success' : 
                      type === 'danger' ? '❌ Error' : 
                      type === 'warning' ? '⚠️ Warning' : 'ℹ️ Info'}
                </strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body bg-dark">
                ${message}
            </div>
        </div>
    `;
    
    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Initialize Bootstrap toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        delay: duration,
        autohide: true
    });
    
    // Show toast
    toast.show();
    
    // Remove toast after it hides
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// ============ DEBUG FUNCTIONS ============
// Add this to test the form directly from browser console
window.testUserCreation = function() {
    console.log('🧪 Testing user creation...');
    
    // Fill form with test data
    document.getElementById('fullName').value = 'Test User';
    document.getElementById('username').value = 'testuser_' + Date.now().toString().slice(-6);
    document.getElementById('email').value = 'test@example.com';
    document.getElementById('phoneNumber').value = '+254700000000';
    document.getElementById('station').value = 'Test Station';
    document.getElementById('password').value = 'Test123';
    document.getElementById('confirmPassword').value = 'Test123';
    
    // Select officer role
    document.querySelector('[data-role="officer"]').click();
    
    console.log('✅ Test data filled. Click "Create User Account" to submit.');
};
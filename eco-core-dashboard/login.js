document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authMessage = document.getElementById('authMessage');

    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // --- Toggle between Login and Register forms ---
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
        authMessage.textContent = '';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        authMessage.textContent = '';
    });

    // --- Login Form Handler ---
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        setAuthMessage(''); // Clear previous messages

        const username = loginForm.loginUsername.value;
        const password = loginForm.loginPassword.value;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('jwtToken', data.token);
                window.location.href = 'index.html';
            } else {
                setAuthMessage(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setAuthMessage('Could not connect to the server.', 'error');
        }
    });

    // --- Registration Form Handler ---
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        setAuthMessage('');

        const username = registerForm.registerUsername.value;
        const password = registerForm.registerPassword.value;
        const confirmPassword = registerForm.confirmPassword.value;

        if (password !== confirmPassword) {
            setAuthMessage('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setAuthMessage('Registration successful! Please log in.', 'success');
                // Switch to the login form
                registerSection.classList.add('hidden');
                loginSection.classList.remove('hidden');
            } else {
                setAuthMessage(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setAuthMessage('Could not connect to the server.', 'error');
        }
    });

    function setAuthMessage(message, type = 'error') {
        authMessage.textContent = message;
        authMessage.className = `message-box ${type}`;
    }
});
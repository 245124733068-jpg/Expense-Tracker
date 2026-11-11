// ==========================================
// AUTHENTICATION API
// ==========================================

const AUTH_URL = 'auth';


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById('login-form');

if (loginForm) {

    loginForm.addEventListener('submit', async function (e) {

        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const message = document.getElementById('login-message');

        const formData = new URLSearchParams();

        formData.append('action', 'login');
        formData.append('email', email);
        formData.append('password', password);

        try {

            const response = await fetch(AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            message.textContent = 'Login successful!';
            message.style.color = 'green';

            window.location.href = 'index.html';

        } catch (error) {

            console.error('Login error:', error);

            message.textContent = 'Invalid email or password.';
            message.style.color = 'red';
        }
    });
}


// ==========================================
// REGISTRATION
// ==========================================

const registerForm = document.getElementById('register-form');

if (registerForm) {

    registerForm.addEventListener('submit', async function (e) {

        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword =
            document.getElementById('confirm-password').value;

        const message = document.getElementById('register-message');

        if (password.length < 8) {
            message.textContent =
                'Password must contain at least 8 characters.';
            message.style.color = 'red';
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = 'Passwords do not match.';
            message.style.color = 'red';
            return;
        }

        const formData = new URLSearchParams();

        formData.append('action', 'register');
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);

        try {

            const response = await fetch(AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(
                    response.status === 409
                        ? 'This email is already registered.'
                        : await response.text()
                );
            }

            message.textContent =
                'Registration successful! Redirecting to login...';

            message.style.color = 'green';

            registerForm.reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1200);

        } catch (error) {

            console.error('Registration error:', error);

            message.textContent = error.message;
            message.style.color = 'red';
        }
    });
}

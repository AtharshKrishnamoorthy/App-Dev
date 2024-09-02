document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const popup = document.getElementById('popup');
    const closePopupBtn = document.querySelector('.close-btn');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        if (password.type === 'password') {
            password.type = 'text';
            togglePassword.classList.remove('fa-eye');
            togglePassword.classList.add('fa-eye-slash');
        } else {
            password.type = 'password';
            togglePassword.classList.remove('fa-eye-slash');
            togglePassword.classList.add('fa-eye');
        }
    });

    // Toggle confirm password visibility
    toggleConfirmPassword.addEventListener('click', () => {
        if (confirmPassword.type === 'password') {
            confirmPassword.type = 'text';
            toggleConfirmPassword.classList.remove('fa-eye');
            toggleConfirmPassword.classList.add('fa-eye-slash');
        } else {
            confirmPassword.type = 'password';
            toggleConfirmPassword.classList.remove('fa-eye-slash');
            toggleConfirmPassword.classList.add('fa-eye');
        }
    });

    // Show popup on successful signup
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form from submitting normally

        // Here you would typically handle form submission via AJAX or a server call
        // Simulating successful signup
        popup.style.display = 'flex';
    });

    // Close popup
    closePopupBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Redirect to login page
    function redirectToLogin() {
        window.location.href = 'login.html'; // Adjust if login page URL is different
    }

    // Attach redirect to login button
    document.querySelector('.popup-content button').addEventListener('click', redirectToLogin);
});

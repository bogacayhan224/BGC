document.addEventListener('DOMContentLoaded', () => {
    // Example: Toggle switch functionality
    document.querySelectorAll('.toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            console.log(`${e.target.id} is now ${e.target.checked ? 'ON' : 'OFF'}`);
            // In a real app, you'd send this state change to the backend
        });
    });

    // Placeholder for other button interactions
    document.querySelectorAll('.form-actions .btn').forEach(button => {
        button.addEventListener('click', (e) => {
            console.log(`Button clicked: ${e.target.textContent.trim()}`);
            // Implement specific logic for each button here
        });
    });

    // Theme Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
            const icon = themeToggle.querySelector('i');
            if (document.body.dataset.theme === 'dark') {
                icon.setAttribute('data-lucide', 'sun');
            } else {
                icon.setAttribute('data-lucide', 'moon');
            }
            lucide.createIcons();
        });
    }

    // Ripple Effect for Buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            this.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                this.removeChild(ripple);
            });
        });
    });

    // Global error handler for debugging
    window.onerror = function(message, source, lineno, colno, error) {
        console.log("Global Error:", message, "at", source + ":" + lineno);
    };
});
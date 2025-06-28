document.addEventListener('DOMContentLoaded', () => {
    // No specific charts or complex interactions for this hub yet, 
    // but this file is ready for future enhancements.

    // Example: Acknowledge button functionality for alerts
    document.querySelectorAll('.alert-item .btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const alertItem = e.target.closest('.alert-item');
            if (alertItem) {
                alertItem.style.opacity = '0.5'; // Visually acknowledge
                alertItem.querySelector('.alert-actions').innerHTML = 'Acknowledged';
                // In a real app, you'd send this to the backend
                console.log('Alert acknowledged!', alertItem);
            }
        });
    });

    // Example: Component selector (for future filtering)
    const componentSelector = document.getElementById('componentSelector');
    componentSelector.addEventListener('change', (e) => {
        console.log('Selected component:', e.target.value);
        // Here you would filter the displayed health items
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
document.addEventListener('DOMContentLoaded', () => {
    const addRuleBtn = document.getElementById('addRuleBtn');
    const automationRulesList = document.getElementById('automationRulesList');

    // Function to create a new rule item (simplified for now)
    const createRuleItem = (name, summary) => {
        const ruleItem = document.createElement('div');
        ruleItem.className = 'rule-item';
        ruleItem.innerHTML = `
            <div class="rule-summary">
                <h4>${name}</h4>
                <p>${summary}</p>
            </div>
            <div class="rule-actions">
                <div class="toggle-switch">
                    <input type="checkbox" id="ruleToggle_${Date.now()}" checked>
                    <span class="toggle-slider"></span>
                </div>
                <button class="btn btn--sm btn--outline edit-rule-btn"><i data-lucide="edit"></i></button>
                <button class="btn btn--sm btn--outline btn--danger delete-rule-btn"><i data-lucide="trash-2"></i></button>
            </div>
        `;
        lucide.createIcons({ nodes: [ruleItem] });

        // Add event listeners for edit and delete (simplified)
        ruleItem.querySelector('.edit-rule-btn').addEventListener('click', () => {
            alert('Edit rule: ' + name);
        });
        ruleItem.querySelector('.delete-rule-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this rule?')) {
                ruleItem.remove();
            }
        });

        return ruleItem;
    };

    // Event listener for adding a new rule
    addRuleBtn.addEventListener('click', () => {
        const ruleName = prompt('Enter rule name:');
        if (ruleName) {
            const ruleSummary = prompt('Enter rule summary (e.g., WHEN X, IF Y, THEN Z):');
            if (ruleSummary) {
                automationRulesList.appendChild(createRuleItem(ruleName, ruleSummary));
            }
        }
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

    // Initialize existing Lucide icons
    lucide.createIcons();
});

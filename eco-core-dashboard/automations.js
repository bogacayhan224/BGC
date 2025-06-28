document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const automationForm = document.getElementById('automationForm');
    const conditionsContainer = document.getElementById('conditionsContainer');
    const actionsContainer = document.getElementById('actionsContainer');
    const addConditionBtn = document.getElementById('addCondition');
    const addActionBtn = document.getElementById('addAction');
    const automationsGrid = document.getElementById('automationsGrid');

    // --- Initial Data & Templates ---

    // Option values for the form dropdowns
    const systemValues = {
        'Energy': ['Battery Level', 'Solar Input', 'Wind Input'],
        'Water': ['Tank Level', 'Filter Status'],
        'Waste': ['Compost Temperature', 'Compost Progress'],
    };

    const systemActions = {
        'Controls': ['Turn Heater', 'Enable Rainwater Collection'],
        'Notifications': ['Send Notification']
    };

    // --- Core Functions ---

    /**
     * Creates a new condition row for the form
     */
    const createConditionRow = () => {
        const row = document.createElement('div');
        row.className = 'condition-row';

        let systemOptions = '';
        for (const category in systemValues) {
            systemOptions += `<optgroup label="${category}">`;
            systemValues[category].forEach(value => {
                systemOptions += `<option>${value}</option>`;
            });
            systemOptions += `</optgroup>`;
        }

        row.innerHTML = `
            <select class="form-control">${systemOptions}</select>
            <select class="form-control">
                <option>is greater than</option>
                <option>is less than</option>
                <option>is equal to</option>
            </select>
            <input type="text" class="form-control" placeholder="Value">
            <button type="button" class="btn btn--sm btn--icon remove-btn"><i data-lucide="x"></i></button>
        `;
        lucide.createIcons({ nodes: [row] });
        return row;
    };

    /**
     * Creates a new action row for the form
     */
    const createActionRow = () => {
        const row = document.createElement('div');
        row.className = 'action-row';

        let actionOptions = '';
        for (const category in systemActions) {
            actionOptions += `<optgroup label="${category}">`;
            systemActions[category].forEach(action => {
                actionOptions += `<option>${action}</option>`;
            });
            actionOptions += `</optgroup>`;
        }

        row.innerHTML = `
            <select class="form-control">${actionOptions}</select>
            <select class="form-control">
                <option>On</option>
                <option>Off</option>
            </select>
            <button type="button" class="btn btn--sm btn--icon remove-btn"><i data-lucide="x"></i></button>
        `;
        lucide.createIcons({ nodes: [row] });
        return row;
    };

    /**
     * Renders a new automation card in the grid
     * @param {object} automationData - The data for the new automation
     */
    const renderAutomationCard = (automationData) => {
        const card = document.createElement('div');
        card.className = 'card automation-card';

        // Simple unique ID for the toggle
        const toggleId = `automationToggle_${Date.now()}`;

        card.innerHTML = `
            <div class="card__body">
                <div class="automation-card-header">
                    <h3 class="automation-title">${automationData.name}</h3>
                    <div class="toggle-switch">
                        <input type="checkbox" id="${toggleId}" checked>
                        <span class="toggle-slider"></span>
                    </div>
                </div>
                <p class="automation-summary">${automationData.summary}</p>
                <div class="automation-actions">
                    <button class="btn btn--sm btn--outline"><i data-lucide="edit"></i>Edit</button>
                    <button class="btn btn--sm btn--outline btn--danger"><i data-lucide="trash-2"></i>Delete</button>
                </div>
            </div>
        `;

        // Add event listener for the new delete button
        card.querySelector('.btn--danger').addEventListener('click', () => {
            card.remove();
        });

        automationsGrid.appendChild(card);
        lucide.createIcons({ nodes: [card] });
    };

    // --- Event Handlers ---

    // Add a new condition row
    addConditionBtn.addEventListener('click', () => {
        conditionsContainer.appendChild(createConditionRow());
    });

    // Add a new action row
    addActionBtn.addEventListener('click', () => {
        actionsContainer.appendChild(createActionRow());
    });

    // Remove a condition or action row using event delegation
    automationForm.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-btn');
        if (removeBtn) {
            removeBtn.parentElement.remove();
        }
    });

    // Handle the main form submission
    automationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('automationName').value || 'Untitled Automation';
        
        // Build a human-readable summary
        const triggerText = document.getElementById('triggerType').selectedOptions[0].text;
        let summary = `<strong>WHEN</strong> ${triggerText}`;

        const conditions = conditionsContainer.querySelectorAll('.condition-row');
        if (conditions.length > 0) {
            summary += ', <strong>IF</strong> ';
            const conditionTexts = Array.from(conditions).map(row => {
                const inputs = row.querySelectorAll('select, input');
                return `${inputs[0].value} ${inputs[1].selectedOptions[0].text} ${inputs[2].value}`;
            });
            summary += conditionTexts.join(' AND ');
        }

        const actions = actionsContainer.querySelectorAll('.action-row');
        if (actions.length > 0) {
            summary += ', <strong>THEN</strong> ';
            const actionTexts = Array.from(actions).map(row => {
                const inputs = row.querySelectorAll('select');
                return `${inputs[0].value} ${inputs[1].value}`;
            });
            summary += actionTexts.join(' & ');
        }

        summary += '.';

        const automationData = { name, summary };
        renderAutomationCard(automationData);

        // Reset the form
        automationForm.reset();
        // Remove all but the first condition/action rows if they exist
        while(conditionsContainer.children.length > 1) { conditionsContainer.lastChild.remove(); }
        while(actionsContainer.children.length > 1) { actionsContainer.lastChild.remove(); }
    });

    // Initial setup for any existing delete buttons
    document.querySelectorAll('.btn--danger').forEach(button => {
        button.addEventListener('click', (e) => {
            e.target.closest('.automation-card').remove();
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Chart Instances ---
    let compostChart;

    // --- Helper Functions ---
    const getCssVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    // --- Chart Initialization ---

    /**
     * Initialize the compost progress doughnut chart
     */
    const initializeCompostChart = () => {
        const ctx = document.getElementById('compostChart').getContext('2d');
        compostChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Progress', 'Remaining'],
                datasets: [{
                    data: [65, 35],
                    backgroundColor: [getCssVariable('--current-primary-color'), getCssVariable('--current-secondary-color')],
                    borderWidth: 0,
                    cutout: '80%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { enabled: false },
                    title: { display: true, text: 'Decomposition Progress', position: 'bottom', color: getCssVariable('--current-text-color') }
                }
            }
        });
    };

    // --- Event Listeners ---

    const streamCards = document.querySelectorAll('.stream-card');

    streamCards.forEach(card => {
        card.addEventListener('click', () => {
            streamCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    // --- Initialize all components ---
    initializeCompostChart();

    // Global error handler for debugging
    window.onerror = function(message, source, lineno, colno, error) {
        console.log("Global Error:", message, "at", source + ":" + lineno);
    };
});


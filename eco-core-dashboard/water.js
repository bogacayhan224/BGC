document.addEventListener('DOMContentLoaded', () => {
    // --- Chart Instances ---
    let waterSourceChart, waterUsageChart;

    // --- Helper Functions ---
    const getCssVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    // --- Chart Initialization ---

    /**
     * Initialize the Water Source Overview chart
     */
    const initializeWaterSourceChart = () => {
        const ctx = document.getElementById('waterSourceChart').getContext('2d');
        waterSourceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Rainwater', 'Atmospheric', 'Mains'],
                datasets: [{
                    label: 'Water Contribution (L)',
                    data: [800, 150, 50],
                    backgroundColor: [
                        getCssVariable('--current-primary-color'),
                        getCssVariable('--current-info-color'),
                        getCssVariable('--current-text-secondary-color')
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Liters' } } }
            }
        });
    };

    /**
     * Initialize the Water Usage chart
     */
    const initializeWaterUsageChart = () => {
        const ctx = document.getElementById('waterUsageChart').getContext('2d');
        waterUsageChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Drinking', 'Sanitation', 'Irrigation', 'Other'],
                datasets: [{
                    data: [30, 45, 20, 5],
                    backgroundColor: [
                        getCssVariable('--current-primary-color'),
                        getCssVariable('--current-info-color'),
                        getCssVariable('--current-warning-color'),
                        getCssVariable('--current-text-secondary-color')
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
    };

    // --- Initialize all components ---
    initializeWaterSourceChart();
    initializeWaterUsageChart();

    // Global error handler for debugging
    window.onerror = function(message, source, lineno, colno, error) {
        console.log("Global Error:", message, "at", source + ":" + lineno);
    };
});


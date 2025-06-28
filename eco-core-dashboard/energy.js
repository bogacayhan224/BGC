document.addEventListener('DOMContentLoaded', () => {
    // --- Chart Instances ---
    let generationChart, batteryStorageChart, consumptionChart;

    // --- Helper Functions ---
    const getCssVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    // --- Chart Initialization ---

    /**
     * Initialize the main generation chart (Solar/Wind)
     */
    const initializeGenerationChart = () => {
        const ctx = document.getElementById('generationChart').getContext('2d');
        generationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'],
                datasets: [{
                    label: 'Solar Generation (kW)',
                    data: [0, 0, 0, 1.2, 3.5, 4.2, 2.1, 0],
                    borderColor: getCssVariable('--current-primary-color'),
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'kW' } } }
            }
        });
    };

    /**
     * Initialize the battery storage doughnut chart
     */
    const initializeBatteryChart = () => {
        const ctx = document.getElementById('batteryStorageChart').getContext('2d');
        batteryStorageChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [84, 16],
                    backgroundColor: [getCssVariable('--current-primary-color'), getCssVariable('--color-chart-doughnut-bg')],
                    borderWidth: 0,
                    cutout: '80%'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });
    };

    /**
     * Initialize the consumption trends chart
     */
    const initializeConsumptionChart = () => {
        const ctx = document.getElementById('consumptionChart').getContext('2d');
        consumptionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Consumption (kWh)',
                    data: [12, 15, 11, 17, 18, 20, 14],
                    backgroundColor: getCssVariable('--current-primary-color'),
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    };

    // --- Event Listeners ---

    const solarBtn = document.getElementById('solarBtn');
    const windBtn = document.getElementById('windBtn');
    const timeRangeSelector = document.getElementById('timeRangeSelector');

    // --- Data for different time ranges ---
    const chartData = {
        solar: {
            Today: { labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'], data: [0, 0, 0, 1.2, 3.5, 4.2, 2.1, 0] },
            'This Week': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [22, 25, 23, 28, 30, 29, 26] },
            'This Month': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [150, 165, 180, 172] }
        },
        wind: {
            Today: { labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'], data: [0.8, 0.9, 1.1, 1.0, 0.7, 0.5, 0.6, 0.8] },
            'This Week': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [15, 18, 12, 20, 17, 16, 19] },
            'This Month': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [110, 120, 105, 115] }
        }
    };

    const updateGenerationChart = () => {
        const activeSource = solarBtn.classList.contains('active') ? 'solar' : 'wind';
        const activeTimeRange = timeRangeSelector.value;
        const newData = chartData[activeSource][activeTimeRange];

        generationChart.data.labels = newData.labels;
        generationChart.data.datasets[0].data = newData.data;
        generationChart.data.datasets[0].label = `${activeSource.charAt(0).toUpperCase() + activeSource.slice(1)} Generation`;
        generationChart.data.datasets[0].borderColor = getCssVariable('--current-primary-color');
        generationChart.update();
    };

    // Switch between Solar and Wind data
    solarBtn.addEventListener('click', () => {
        solarBtn.classList.add('active');
        windBtn.classList.remove('active');
        updateGenerationChart();
    });

    windBtn.addEventListener('click', () => {
        windBtn.classList.add('active');
        solarBtn.classList.remove('active');
        updateGenerationChart();
    });

    // Handle time range change
    timeRangeSelector.addEventListener('change', updateGenerationChart);

    // --- Initialize all components ---
    initializeGenerationChart();
    initializeBatteryChart();
    initializeConsumptionChart();

    // Global error handler for debugging
    window.onerror = function(message, source, lineno, colno, error) {
        console.log("Global Error:", message, "at", source + ":" + lineno);
    };
});


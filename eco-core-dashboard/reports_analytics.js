document.addEventListener('DOMContentLoaded', () => {
    // --- Chart Instances ---
    let resourceUsageChart;

    // --- Helper Functions ---
    const getCssVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

    // --- Mock Data for Resource Usage Chart ---
    const mockUsageData = {
        energy: {
            Daily: { labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'], data: [5, 8, 12, 15, 10, 18, 20, 10], label: 'Energy Consumption (kWh)', color: getCssVariable('--current-primary-color') },
            Weekly: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [100, 110, 90, 120, 130, 150, 105], label: 'Energy Consumption (kWh)', color: getCssVariable('--current-primary-color') },
            Monthly: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [400, 450, 380, 420], label: 'Energy Consumption (kWh)', color: getCssVariable('--current-primary-color') }
        },
        water: {
            Daily: { labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'], data: [10, 15, 20, 25, 18, 30, 22, 15], label: 'Water Usage (L)', color: getCssVariable('--current-info-color') },
            Weekly: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [500, 550, 480, 600, 620, 700, 580], label: 'Water Usage (L)', color: getCssVariable('--current-info-color') },
            Monthly: { labels: ['Organic', 'Recyclable', 'Residual'], data: [2000, 2200, 1900, 2100], label: 'Water Usage (L)', color: getCssVariable('--current-info-color') }
        },
        waste: {
            Daily: { labels: ['Organic', 'Recyclable', 'Residual'], data: [2, 1, 0.5], label: 'Waste Generated (kg)', color: [getCssVariable('--current-primary-color'), getCssVariable('--current-info-color'), getCssVariable('--current-error-color')] },
            Weekly: { labels: ['Organic', 'Recyclable', 'Residual'], data: [15, 8, 3], label: 'Waste Generated (kg)', color: [getCssVariable('--current-primary-color'), getCssVariable('--current-info-color'), getCssVariable('--current-error-color')] },
            Monthly: { labels: ['Organic', 'Recyclable', 'Residual'], data: [60, 30, 12], label: 'Waste Generated (kg)', color: [getCssVariable('--current-primary-color'), getCssVariable('--current-info-color'), getCssVariable('--current-error-color')] }
        }
    };

    // --- Chart Initialization Functions ---

    const createChart = (ctx, type, data, options) => {
        return new Chart(ctx, { type, data, options });
    };

    const updateChart = (chart, newData, newType = null) => {
        if (newType && chart.config.type !== newType) {
            chart.destroy(); // Destroy if type changes
            return createChart(chart.canvas.getContext('2d'), newType, newData.datasets, newData.options);
        }
        chart.data.labels = newData.labels;
        chart.data.datasets = newData.datasets;
        chart.update();
        return chart;
    };

    // --- Event Listeners ---

    const usageTimeSelector = document.getElementById('usageTimeSelector');
    const energyUsageBtn = document.getElementById('energyUsageBtn');
    const waterUsageBtn = document.getElementById('waterUsageBtn');
    const wasteUsageBtn = document.getElementById('wasteUsageBtn');

    const initializeResourceUsageChart = (resourceType, timeRange) => {
        const chartData = mockUsageData[resourceType][timeRange];
        const chartType = resourceType === 'waste' ? 'pie' : 'bar';
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: chartData.label }
                }
            }
        };

        const chartConfig = {
            labels: chartData.labels,
            datasets: [{
                label: chartData.label,
                data: chartData.data,
                backgroundColor: chartData.color,
                borderColor: chartData.color,
                borderWidth: 1
            }]
        };

        if (resourceUsageChart) {
            resourceUsageChart.destroy();
        }
        const ctx = document.getElementById('resourceUsageChart').getContext('2d');
        resourceUsageChart = createChart(ctx, chartType, chartConfig, chartOptions);
    };

    const updateResourceUsageChart = () => {
        const selectedTimeRange = usageTimeSelector.value;
        let selectedResourceType = 'energy';
        if (waterUsageBtn.classList.contains('active')) {
            selectedResourceType = 'water';
        } else if (wasteUsageBtn.classList.contains('active')) {
            selectedResourceType = 'waste';
        }
        initializeResourceUsageChart(selectedResourceType, selectedTimeRange);
    };

    energyUsageBtn.addEventListener('click', () => {
        energyUsageBtn.classList.add('active');
        waterUsageBtn.classList.remove('active');
        wasteUsageBtn.classList.remove('active');
        updateResourceUsageChart();
    });

    waterUsageBtn.addEventListener('click', () => {
        waterUsageBtn.classList.add('active');
        energyUsageBtn.classList.remove('active');
        wasteUsageBtn.classList.remove('active');
        updateResourceUsageChart();
    });

    wasteUsageBtn.addEventListener('click', () => {
        wasteUsageBtn.classList.add('active');
        energyUsageBtn.classList.remove('active');
        waterUsageBtn.classList.remove('active');
        updateResourceUsageChart();
    });

    usageTimeSelector.addEventListener('change', updateResourceUsageChart);

    // Initial chart load
    updateResourceUsageChart();

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
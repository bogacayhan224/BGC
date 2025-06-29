// Mock kritik uyarı verisi dönen controller
exports.getCriticalAlerts = (req, res) => {
  const mockAlerts = [
    {
      id: 1,
      message: "Water tank level below 80%",
      type: "warning",
      time: "2 min ago"
    },
    {
      id: 2,
      message: "Solar panel efficiency at 95%",
      type: "info",
      time: "5 min ago"
    }
  ];
  res.json({ alerts: mockAlerts });
}; 
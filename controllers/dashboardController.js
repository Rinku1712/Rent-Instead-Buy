const dashboardService = require('../services/dashboardService');

// Get Common Dashboard
const getCommonDashboard = async (req, res) => {
  try {
    const dashboardData = await dashboardService.getCommonDashboard();

    return res.status(200).json({
      success: true,
      message: 'Common Dashboard Data Fetched Successfully',
      data: dashboardData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCommonDashboard,
};

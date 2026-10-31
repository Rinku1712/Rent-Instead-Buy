// Configure the Express application and middleware.
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/superAdminRoutes');
const itemRoutes = require('./routes/itemRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const app = express();
app.use(express.json());
app.use('/api/category', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body',
    });
  }
  return next(error);
});

module.exports = app;

// Configure the Express application and middleware.
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/superAdminRoutes');
const itemRoutes = require('./routes/itemRoutes');
const app = express();
app.use(express.json());
app.use('/api/category', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/item', itemRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
module.exports = app;

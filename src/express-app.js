const express = require('express');
const cors = require('cors');
const path = require('path');
const HandleErrors = require('./utills/error-handler');
const router = require('./api/routes');

module.exports = (app) => {
    //Express app configuration
    //Set express app to use json set urlencoded to true
    app.use(express.json({ 'limit': '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    // set express  app to use cors
    app.use(cors());
    // Set express app to use static files
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    // Set express app to use router from api/routes/index.js when url starts with /api/v1
    app.use('/api/v1',router(express.Router()));
    // error handling middleware for handling all errors
    app.use(HandleErrors);

}
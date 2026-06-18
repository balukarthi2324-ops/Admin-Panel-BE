const express = require('express');
const { PORT } = require('./src/config');
const { databaseConnection } = require('./src/database');
const expressApp = require('./src/express-app');

const startServer = async () => {
    // Create express app
    const app = express();
    // Connect to database   
    await databaseConnection();
    // Configure express app
    await expressApp(app);
    // app listen to port
    app.listen(PORT, () => {
        console.log(`listening to port ${PORT}`);
    }).on('error', (err) => {
        console.log(err);
        process.exit();
    })


}

startServer();

const dotEnv = require("dotenv");

if (process.env.NODE_ENV == "dev") {
    console.log("Development Environment Detected");
    // Load development environment variables
    const configFile = `./.env.${process.env.NODE_ENV}`;
    // Load environment variables from file
    dotEnv.config({ path: configFile });
} else {
    // Load production environment variables
    console.log("Production Environment Detected");
    dotEnv.config();
}

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  JWT_EXPIRY : process.env.JWT_EXPIRY,
  SERVICE_API_KEY: process.env.SERVICE_API_KEY,
  SERVICE_API_SECRET: process.env.SERVICE_SERECT_KEY,
}
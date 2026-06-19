const databaseConnection = require("./connection");

module.exports = {
    databaseConnection,

    ...require('../database/models/auth-model')
}
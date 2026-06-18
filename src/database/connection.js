const mongoose =  require('mongoose');
const { DB_URL } = require('../config')

module.exports = async () => {
    try{
        mongoose.connect(DB_URL)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("Database Connection Error:", err));
    }catch(error){
        console.log("Database Connection Error: ", error);
        process.exit(1);
    }

};
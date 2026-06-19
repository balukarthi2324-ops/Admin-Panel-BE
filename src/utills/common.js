const fs = require('fs');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { APP_SECRET, JWT_EXPIRY } = require("../config");
// Generate salt for encryption
const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

const GeneratePassword = async (password, saltRounds) => {
  return await bcrypt.hash(password, saltRounds);
};

const ValidatePassword = async (enteredPassword, savedPassword) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

// Generate JWT signature
const GenerateSignature = async (payload) => {
    try {
        const token = await jwt.sign(payload, APP_SECRET, { expiresIn: JWT_EXPIRY });
        return token;
    } catch (error) {
        console.log(error)
        return error;
    }
};

// Validate JWT signature
const ValidateSignature = async (req, res, next) => {
    try {
        const signature = req.get("Authorization");    
        req.user = (await jwt.verify(signature.split(" ")[1], APP_SECRET));
        // console.log( req.user, 'req.user');
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized Request" });
    }
};

module.exports = { ValidateSignature,GeneratePassword,GenerateSignature,ValidatePassword }
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    'email': { type: String, required: true},
    'userName': { type: String, required: true },
    'password': { type: String, }
},{ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, strict: false, versionKey : false })

const userModel = mongoose.model('master_users', userSchema)

// OTP
const otpSchema = new mongoose.Schema({
   
    "verificationCode": { type: String, required: true },
   
    "eventName": { type: String, required: true },
   
    "subeventName": { type: String },
   
    "refId": { type: mongoose.Types.ObjectId }

}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, strict: false, versionKey : false});

otpSchema.index({ updated_at: 1 },{ expireAfterSeconds: 60 * 2 });

const otpModel = mongoose.model("detail_verification_codes", otpSchema);


// Parant Company
const parentCompanySchema = new mongoose.Schema({
    
    "name": { type: String },
    
    "taxNo": { type: String },
    
    "address": { type: String, },
    
    "city": { type: String, },
    
    "state": { type: String, },
    
    'pincode': { type: String },
    
    'countryId': { type: mongoose.Schema.Types.ObjectId, ref: 'master_countries' },

    "currencyCode": { type: String, required: true, index: true },

    "manualCurrencyChange": { type: Boolean, default: false },
    
    "companyId": { type: [mongoose.Schema.Types.ObjectId], ref: 'master_companies'},
    
    "branchId": { type: [mongoose.Schema.Types.ObjectId], ref: 'master_branches'},
    
    "is_active": { type: Boolean, default: false },
    
    "created_by": { type: mongoose.Schema.Types.ObjectId, ref: 'master_users' },    
    
    "updated_by": { type: mongoose.Schema.Types.ObjectId, ref: 'master_users' },

}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, strict: false, versionKey : false })

const parentCompanyModel = mongoose.model('master_organizations', parentCompanySchema)

// Company
const companySchema = new mongoose.Schema({
   
    "parentCompanyId": { type: mongoose.Schema.Types.ObjectId, ref: 'master_organizations' },
   
    "companyName": { type: String },
   
    "taxNo": { type: String },
   
    "address": { type: String, },
   
    "city": { type: String, },
   
    "state": { type: String, },
   
    'pincode': { type: String },
   
    'countryId': { type: mongoose.Schema.Types.ObjectId, ref: 'master_countries' },
   
    "branchId": { type: [mongoose.Schema.Types.ObjectId], ref: 'master_branches'},
   
    "is_active": { type: Boolean, default: false },
   
    "branchId": { type: [mongoose.Schema.Types.ObjectId], ref: 'master_branches'},
   
    "created_by": { type: mongoose.Schema.Types.ObjectId, ref: 'master_users' },    
  
    "updated_by": { type: mongoose.Schema.Types.ObjectId, ref: 'master_users' },

}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, strict: false, versionKey : false })

const companyModel = mongoose.model('master_companies', companySchema)

// Branch
const branchSchema = new mongoose.Schema({
   
    "parentCompanyId": { type: mongoose.Schema.Types.ObjectId, ref: 'master_organisations' },
   
    "companyId": { type: mongoose.Schema.Types.ObjectId, ref: 'master_companies' },
   
    "branchName": { type: String },
   
    "taxNo": { type: String },
   
    "address": { type: String, },
   
    "city": { type: String, },
   
    "state": { type: String, },
   
    'pincode': { type: String },
   
    "is_active": { type: Boolean, default: false },
   
    "created_by": { type: mongoose.Schema.Types.ObjectId, ref: 'master_users' },    
   
    "updated_by": { type: mongoose.Schema.Types.ObjectId, ref: 'master_users' },

}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, strict: false, versionKey : false })

const branchModel = mongoose.model('master_branches', branchSchema)

module.exports = { userModel, otpModel }
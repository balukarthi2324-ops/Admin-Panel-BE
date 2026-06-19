const { userModel, otpModel } = require("../../database");
const _ = require("lodash");
const { GeneratePassword, ValidatePassword, GenerateSignature } = require("../../utills/common");

module.exports.login = async(req,res)=>{
    try{
        const { email, password } = req.body;
        let user = JSON.parse(JSON.stringify( await userModel.findOne({"email": email  })));
        if(!_.isEmpty(user)){
            let isValid = await ValidatePassword(password, user.password);
            if(isValid) {
                let userDetails = {
                    'id': adminDetails._id, "firstName": adminDetails.firstName, "lastName": adminDetails?.lastName, "email": adminDetails.email, "isAdminUser": adminDetails.isAdminUser, "userType": adminDetails.userType, 
                }
                const token =  await GenerateSignature({ userDetails});
                let data = { adminDetails , token , userDetails}  
            } else {
                return res.status(403).send({ status: "ok", message: "Email or Password Incorrect" });
            }
        }
    
    } catch(error) {

        return res.status(500).send({ status: "failed", message: "Login failed", "error": error });

    }
}

module.exports.sendOtp = async(req,res)=>{
    try{
        const eventName  = req.query.eventName
        const { email } = req.body;
        const generateOTP = (digits) => Math.floor(Math.pow(10, digits - 1) + Math.random() * (Math.pow(10, digits) - Math.pow(10, digits - 1)));
        if (eventName === "forgot-password") {
            const customer = await userModel.findOne({ email }, { email: 1, _id: 0 });            
            if (customer) {
                const verificationCode = generateOTP(4); // 4-digit OTP
                await otpModel.create({ "verificationCode": verificationCode, eventName: eventName })
                // await sendMailService({ "toMail": email, "subject": "Forgot-password", "template": eventName,"body": { otp: verificationCode, eventName },"isOTP": true});
                return res.status(200).send({ status: "ok", message: "OTP sent to your registered email", "OTP": verificationCode });
            } else {
                return res.status(404).send({ status: "failed", message: "User not found" });
            }
        }
    } catch(error){
        return res.status(500).send({ status: "failed", message: "An error occurred" });
    }
}

module.exports.verifyOtp = async (req, res) => {
    try{
        let data = await otpModel.findOne({ "verificationCode": req.body.verificationCode })
        if(!_.isEmpty(data)) res.status(200).send({ status: "ok", message: "OTP verified successfully" });
        else res.status(404).send({ status: "failed", message: "Invalid OTP" });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: "failed", message: "An error occurred", "error": error });
    }
}

module.exports.resetPassword = async (req, res) => {
    try{
        const  email=  req.body.email
        const hashedPassword = await GeneratePassword(req.body.password, 10);
        const updateObj = { $set: { password: hashedPassword,}};
        const user = await userModel.findOneAndUpdate({ email }, updateObj, { new: true });
        let updateSuccess = false;
        if (user) {
            const user = await userModel.findOneAndUpdate({ email }, updateObj, { new: true });
            updateSuccess = true;
        }
        if (updateSuccess) {
            res.status(200).send({ status: "ok", message: "Password reset successfully" });
        } else {
            res.status(404).send({ status: "failed", message: "User not found" });
        }
    } catch(error) {
    
        res.status(404).send({ status: "failed", message: "User not found" });
    
    }

}


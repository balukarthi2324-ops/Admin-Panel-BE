const AuthController = require('../controllers/auth-controller');

module.exports = (router) => {
    router.route("/auth/login").post(AuthController.login);
    router.route("/auth/sendOtp").post(AuthController.sendOtp);
    router.route("/auth/verfiyOtp").post(AuthController.verifyOtp);
    router.route("/auth/resetPassword").post(AuthController.resetPassword);
    

}
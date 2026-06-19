
const AuthRoutes = require('./auth-route')
module.exports =(router) => {
    AuthRoutes(router);
    return router
}
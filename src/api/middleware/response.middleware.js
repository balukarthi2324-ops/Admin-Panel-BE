const _ = require('lodash');

// Success response middleware
const successRes = function ({ res, data, message = null }) {
    return res.status(200).send({ "status": "ok", "data": data, "message": message });
};

// Error response middleware
const errorRes = function ({ req, res, error, message = null, data = null, collectionName = null }) {

    let request = {
        "user": req.user || {},
        "route": req.route.path,
        "body": req.body,
        "params": req.params,
        "query": req.query
    };

    try {
        // Your existing error handling logic here

        return res.status(400).send({ error, 'status': 'failed', ...message ? { message } : {}, ...data ? { data } : {} });

    } catch (err) {
        // Handle unanticipated errors
        console.error('Unhandled error:', err);
        message = "Internal Server Error";
    }

    return res.status(500).send({ error, 'status': 'failed', ...message ? { message } : {}, ...data ? { data } : {} });
};

module.exports = { successRes, errorRes };

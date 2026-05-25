const app = require('../muse-cosmitics-backend/server');

module.exports = async (req, res) => {
    await app.initializeServices();
    return app(req, res);
};
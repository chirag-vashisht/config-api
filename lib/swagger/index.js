
module.exports = function setupSwagger(app, apiMetadata) {
    app.get('/api/docs/swagger.json', (req, res) => {
        res.json(apiMetadata);
    });
};

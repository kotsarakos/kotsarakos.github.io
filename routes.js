module.exports.configure = (app) => {
    // Route for the home page
    app.get('/', (req, res) => {
        // Send the index.html file located in the public directory as the response
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
};

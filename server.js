const express = require('express');
const path = require('path');
const app = express();

// Use the 'www' folder as a dist folder.
app.use(express.static(__dirname + '/www/'));

app.get('*', function(req,res) {
	res.sendFile(path.join(__dirname+
	'/www/index.html'));
});

// Listen to either the server port || 8080.
console.log("Running on PORT:", process.env.PORT);
app.listen(process.env.PORT || 8080);

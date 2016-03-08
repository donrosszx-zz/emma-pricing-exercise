var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

// app.get('/', function(req, res) {
//     res.send();
// });

io.on('connection', function (socket) {
    console.log('user connected via socket.io');

    socket.emit('analysis', {
        text: "Here's the analysis"
    });
});

http.listen(PORT, function () {
    console.log('Express server started on port ' + PORT);
});
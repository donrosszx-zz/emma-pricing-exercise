var socket = io();

socket.on('analysis', function (analysis) {
    $("h2#analysis").text(analysis.text);

});
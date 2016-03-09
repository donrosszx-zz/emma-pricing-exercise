var socket = io();

socket.on('analysis', function (analysis) {
    var $overall = jQuery('#overall-cheapest');
    var $item = jQuery('<li></li>');
    $item.append('<p><strong>' + analysis.least.region + '</strong></p>');
    $item.append('<p>' + analysis.least.price + '</p>');
    $overall.append($item);
});
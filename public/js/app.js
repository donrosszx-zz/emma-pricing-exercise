var socket = io();

socket.on('analysis', function(analysis) {
    var $overall = jQuery('#overall-cheapest');
    var $item = jQuery('<li></li>');
    $item.append('<p><strong>' + analysis.overallLeast.region + '</strong></p>');
    $item.append('<p>' + analysis.overallLeast.price + '</p>');
    $overall.append($item);

    var $regList = jQuery('#spread-by-region');
    $.each(analysis.regionSpread, function(i) {
        var $li = jQuery('<li></li>');
        $li.append('<p><strong>' + analysis.regionSpread[i].region + '</strong></p>');
        $li.append('<p><em>Most: </em>' + analysis.regionSpread[i].most.type + '</p>');
        $li.append('<p><em>Least: </em>' + analysis.regionSpread[i].least.type + '</p>');
        $regList.append($li);
    });
});
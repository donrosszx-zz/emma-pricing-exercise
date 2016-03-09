var socket = io();

socket.on('analysis', function(analysis) {
    $("h3#overall-heading").html('Cheapest instance overall');
    var $overall = jQuery('#overall-cheapest');
    var $item = jQuery('<li></li>');
    $item.append('<p><strong>' + analysis.overallLeast.type + '</strong> type in the <strong>' + analysis.overallLeast.region + '</strong> region</p>');
    $item.append('Price Per HR: $' + analysis.overallLeast.price + '<br/>');
    $item.append('vCPU: ' + analysis.overallLeast.vCPU);
    $overall.append($item);

    $("h3#region-heading").html('Price spread by region');
    var $regList = jQuery('#spread-by-region');
    $.each(analysis.regionSpread, function(i) {
        var $li = jQuery('<li></li>');
        $li.append('<p><strong>' + analysis.regionSpread[i].region + '</strong></p>');
        $li.append('<p><em>Most Expensive Type: </em>' + analysis.regionSpread[i].most.type + '</p>');
        $li.append('Price Per HR: $' + analysis.regionSpread[i].most.price + '<br/>');
        $li.append('vCPU: ' + analysis.regionSpread[i].most.vCPU);
        $li.append('<p><em>Least Expensive Type: </em>' + analysis.regionSpread[i].least.type + '</p>');
        $li.append('Price Per HR: $' + analysis.regionSpread[i].least.price + '<br/>');
        $li.append('vCPU: ' + analysis.regionSpread[i].least.vCPU);
        $regList.append($li);
    });

    $("h3#type-heading").html('Price spread by type');
    var $typeList = jQuery('#spread-by-type');
    $.each(analysis.typeSpread, function(i) {
        var $li = jQuery('<li></li>');
        $li.append('<p><strong>' + analysis.typeSpread[i].type + '</strong></p>');
        $li.append('<p><em>Most Expensive Region: </em>' + analysis.typeSpread[i].most.region + '</p>');
        $li.append('Price Per HR: $' + analysis.typeSpread[i].most.price + '<br/>');
        $li.append('vCPU: ' + analysis.typeSpread[i].most.vCPU);
        $li.append('<p><em>Least Expensive Region: </em>' + analysis.typeSpread[i].least.region + '</p>');
        $li.append('Price Per HR: $' + analysis.typeSpread[i].least.price + '<br/>');
        $li.append('vCPU: ' + analysis.typeSpread[i].least.vCPU);
        $typeList.append($li);
    });

    $("h3#vCPU-heading").html('Top ten prices by vCPU (0 is a spot instance)');
    var $vCPUList = jQuery('#vCPU-top-ten');
    $.each(analysis.vCPUCheapest, function(i) {
        var $li = jQuery('<li></li>');
        $li.append('<p><strong>vCPU: ' + analysis.vCPUCheapest[i].vCPU + '</strong></p>');
        var $subListItem = jQuery('<ul></ul>');
        $.each(analysis.vCPUCheapest[i].tenCheapestList, function (j) {
            var node = analysis.vCPUCheapest[i].tenCheapestList[j];
            $subListItem.append('<li><em>' + node.type + '</em> type in the <em>' + node.region + '</em> region</li>');
            $subListItem.append('Price Per HR: $' + node.price + '<br/>');
        });
        $li.append($subListItem);
        $vCPUList.append($li);
    });
});
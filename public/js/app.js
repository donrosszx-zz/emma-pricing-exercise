var socket = io();

socket.on('analysis', function(analysis) {
    // Cheapest instance overall
    $("h3#overall-heading").html('Cheapest instance overall');
    var $overall = jQuery('#overall-cheapest');
    var $item = jQuery('<li class="list-group-item"></li>');
    $item.append('<p><strong>' + analysis.overallLeast.type + '</strong> type in the <strong>' + analysis.overallLeast.region + '</strong> region</p>');
    $item.append('Price Per HR: $' + analysis.overallLeast.price + '<br/>');
    $item.append('vCPU: ' + analysis.overallLeast.vCPU);
    $overall.append($item);

    // Price spread by region
    $("h3#region-heading").html('Price spread by region');
    var $regList = jQuery('#spread-by-region');
    $.each(analysis.regionSpread, function(i) {
        var $li = jQuery('<li class="list-group-item"></li>');
        $li.append('<p><strong>Region: ' + analysis.regionSpread[i].region + '</strong></p>');
        $li.append('<em>Most Expensive Type: </em>' + analysis.regionSpread[i].most.type);
        $li.append('<br/>Price Per HR: $' + analysis.regionSpread[i].most.price + '<br/>');
        $li.append('vCPU: ' + analysis.regionSpread[i].most.vCPU);
        $li.append('<br/><br/><em>Least Expensive Type: </em>' + analysis.regionSpread[i].least.type);
        $li.append('<br/>Price Per HR: $' + analysis.regionSpread[i].least.price + '<br/>');
        $li.append('vCPU: ' + analysis.regionSpread[i].least.vCPU);
        $regList.append($li);
    });

    // Price spread by type
    $("h3#type-heading").html('Price spread by type');
    var $typeList = jQuery('#spread-by-type');
    $.each(analysis.typeSpread, function(i) {
        var $li = jQuery('<li class="list-group-item"></li>');
        $li.append('<p><strong>Type: ' + analysis.typeSpread[i].type + '</strong></p>');
        $li.append('<em>Most Expensive Region: </em>' + analysis.typeSpread[i].most.region);
        $li.append('<br/>Price Per HR: $' + analysis.typeSpread[i].most.price + '<br/>');
        $li.append('vCPU: ' + analysis.typeSpread[i].most.vCPU);
        $li.append('<br/><br/><em>Least Expensive Region: </em>' + analysis.typeSpread[i].least.region);
        $li.append('<br/>Price Per HR: $' + analysis.typeSpread[i].least.price + '<br/>');
        $li.append('vCPU: ' + analysis.typeSpread[i].least.vCPU);
        $typeList.append($li);
    });

    // Top 10 cheapest instances per vCPU
    // Spot instances don't have vCPU so I've set them to 0
    $("h3#vCPU-heading").html('Top ten prices by vCPU (vCPU: 0 are Spot instances)');
    var $vCPUList = jQuery('#vCPU-top-ten');
    $.each(analysis.vCPUCheapest, function(i) {
        var $li = jQuery('<li class="list-group-item"></li>');
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
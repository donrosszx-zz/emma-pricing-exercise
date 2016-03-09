var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var request = require('request');
var _ = require('underscore');
var vm = require('vm');

app.use(express.static(__dirname + '/public'));

function getPricingFromAPI(url) {
    return new Promise(function(resolve, reject) {
        var flatInstances = [];
        request({
            url: url
        }, function(error, response, body) {
            if (error) {
                reject("Unable to retrieve pricing from API");
            } else {
                var jsonpSandbox = vm.createContext({
                    callback: function(r) {
                        return r;
                    }
                });
                var myData = vm.runInContext(body, jsonpSandbox);
                // resolve(myData);
                myData.config.regions.forEach(function(region) {
                    var instRegion = region.region;
                    region.instanceTypes.forEach(function(instanceType) {
                        var instType = instanceType.type;
                        instanceType.sizes.forEach(function(size) {
                            var instSize = size.size;
                            var instPrice = Number(size.valueColumns[0].prices.USD);
                            var instVCPU = Number(size.vCPU);
                            flatInstances.push({
                                region: instRegion,
                                type: instType,
                                size: instSize,
                                vCPU: instVCPU,
                                price: instPrice
                            });
                        });
                    });
                });
                resolve(flatInstances);
            }
        });
    });
}

var spread = function(instances) {
    var leastExpensive = _.sortBy(instances, 'price')[0];
    var mostExpensive = _.sortBy(instances, function(inst) {
        return -inst.price;
    })[0];
    // returns {most: {}, least: {}}
    return {
        most: mostExpensive,
        least: leastExpensive
    };
};

io.on('connection', function(socket) {
    console.log('user connected via socket.io');

    var instances = [];
    getPricingFromAPI("http://a0.awsstatic.com/pricing/1/ec2/linux-od.min.js").then(function(instancesFromAPI) {
        instances.push.apply(instances, instancesFromAPI);
        return getPricingFromAPI("http://spot-price.s3.amazonaws.com/spot.js");
    }).then(function(instancesFromAPI) {
        instances.push.apply(instances, instancesFromAPI);

        // OVERALL CHEAPEST (AND MOST EXPENSIVE)
        var overallSpread = spread(instances);

        // SPREAD BY REGION
        var regionBasedGroup = _.groupBy(instances, function(inst) {
            return inst.region;
        });
        // we want the format of regionBasedSpread to look like
        // [{region: 'region1', most: {}, least {}}, {region: 'region2', most: {}, least {}}, etc]
        var regionBasedSpread = [];
        _.each(regionBasedGroup, function (value, prop) {
            // value is a list of region specific instances to perform the spread on
            // prop is the region name
            var regionSpread = spread(value);
            regionBasedSpread.push({region: prop, most: regionSpread.most , least:regionSpread.least});
        });
        // console.log(regionBasedSpread);

        socket.emit('analysis', {
            overallLeast: overallSpread.least,
            regionSpread: regionBasedSpread
        });
    }).catch(function(error) {
        console.log(error);
    });
});

http.listen(PORT, function() {
    console.log('Express server started on port ' + PORT);
});
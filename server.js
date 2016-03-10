var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var request = require('request');
var _ = require('underscore');
var vm = require('vm');

app.use(express.static(__dirname + '/public'));

/**
* retrieves data from API call, extracts JSON from JSONP, and
* flattens JSON into a list of similar instance objects for easy analysis
* params: {string} url
* returns:
* - resolves with an Array of instance objects
* - rejects with a string message about the error received from the API request
*/
function getPricingFromAPI(url) {
    return new Promise(function(resolve, reject) {
        var flatInstances = [];
        request({
            url: url
        }, function(error, response, body) {
            if (error) {
                reject("Unable to retrieve pricing from API");
            } else {
                // extracting json from jsonp help retrieved from 
                // http://stackoverflow.com/questions/9060270/node-http-request-for-restful-apis-that-return-jsonp
                var jsonpSandbox = vm.createContext({
                    callback: function(r) {
                        return r;
                    }
                });
                var myData = vm.runInContext(body, jsonpSandbox);

                // loops over lists in the JSON extracting info for flat instance objects
                myData.config.regions.forEach(function(region) {
                    var instRegion = region.region;
                    region.instanceTypes.forEach(function(instanceType) {
                        var instType = instanceType.type;
                        instanceType.sizes.forEach(function(size) {
                            var instSize = size.size;
                            var instPrice = Number(size.valueColumns[0].prices.USD);
                            var instVCPU = Number(size.vCPU) || 0; // Spot instances don't have vCPU so I've set them to 0 for easy sorting
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

/**
* extracts the most and least expensive instance from a list of instances
* params: {Array} instances - can be entire list of instances or a pre-filtered list
* returns: 
* - an object with the most and least expensive instances from the list
*/
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

/*
* extracts the ten cheapest instances from an Array of instances
* params: {Array} instances - can be entire list of instances or a pre-filtered list
* returns:
* - an array of ten or less of the cheapest instances from the array
*/
var tenCheapest = function(instances) {
    return _.sortBy(instances, 'price').slice(0, 10);
};

io.on('connection', function(socket) {
    console.log('user connected via socket.io');

    var instances = [];
    getPricingFromAPI("http://a0.awsstatic.com/pricing/1/ec2/linux-od.min.js").then(function(instancesFromAPI) {
        instances.push.apply(instances, instancesFromAPI);
        return getPricingFromAPI("http://spot-price.s3.amazonaws.com/spot.js");
    }).then(function(instancesFromAPI) {
        instances.push.apply(instances, instancesFromAPI);

        // OVERALL CHEAPEST INSTANCE (AND MOST EXPENSIVE)
        var overallSpread = spread(instances);

        // SPREAD BY REGION - group the instances by region and send them to get the spread
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

        // SPREAD BY TYPE - group the instances by type and send them to get the spread
        var typeBasedGroup = _.groupBy(instances, function(inst) {
            return inst.type;
        });
        // we want the format of typeBasedSpread to look like
        // [{type: 'type1', most: {}, least {}}, {type: 'type2', most: {}, least {}}, etc]
        var typeBasedSpread = [];
        _.each(typeBasedGroup, function (value, prop) {
            // value is a list of type specific instances to perform the spread on
            // prop is the type name
            var typeSpread = spread(value);
            typeBasedSpread.push({type: prop, most: typeSpread.most , least:typeSpread.least});
        });

        // TEN CHEAPEST BY VCPU - group the instances by vCPU and extract the 10 cheapest
        var vCPUBasedGroup = _.groupBy(instances, function (inst) {
            return inst.vCPU;
        });
        // we want the format of tenCheapestByVCPU to look like
        // [{vCPU: 'someInt', tenCheapestList: [{}, {}, etc]}];
        var tenCheapestByVCPU = [];
        _.each(vCPUBasedGroup, function (value, prop) {
            // value is a list of vCPU specific instances to perform the tenCheapest on
            // prop is the vCPU value.  0 is a spot instance since they have no vCPU value
            var tenCheapestPerThisVCPU = tenCheapest(value);
            tenCheapestByVCPU.push({vCPU: prop, tenCheapestList: tenCheapestPerThisVCPU});
        });

        socket.emit('analysis', {
            overallLeast: overallSpread.least,
            regionSpread: regionBasedSpread,
            typeSpread: typeBasedSpread,
            vCPUCheapest: tenCheapestByVCPU
        });
    }).catch(function(error) {
        console.log(error);
    });
});

http.listen(PORT, function() {
    console.log('Express server started on port ' + PORT);
});
/* 
 * Learning node.js via common work tasks.
 * This script should take a CSV with a list of identifiers and address, append congressional
 * district and bioguide (unique id) for members of Congress
 *
 * See test.csv for format example
 */
// set geocoding provider, using google for example, DSTK on local network for real geocoding
var geocoderProvider = 'google';
var httpAdapter = 'http';

var geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter);
var csv = require("fast-csv");
var fs = require("fs");

// I/O streams, replace with argv later
var inStr = fs.createReadStream("test.csv");
var outStr = fs.createWriteStream('output.csv');
var outErr = fs.createWriteStream('error.csv');

// set Sunlight Congress API
var api = require("sunlight-congress-api");
api.init("xxx");

// grab district # and bioguide_id of rep, senators
function findCongress(api, lat, lon, callback) {
    api.legislatorsLocate().filter("latitude", lat).filter("longitude", lon).call(function (data) {
        var mocList = Array();
        mocList.push(data.results[0].district);
        for (var i = 0; i < data.results.length; i++) {
            mocList.push(data.results[i].bioguide_id);
        }
        callback(mocList);
    });
}

csv(inStr, {
    headers: true,
    ignoreEmpty: true
})
    .on("data", function (data) {
        var toLoc = data.address + " " + data.city + "," + data.state + " " + data.postal;
        var geoInfo = new Array();
        geocoder.geocode(toLoc, function (err, res) {
            if (err) {
                console.log(err.toString() + ":" + toLoc);
                outErr.write(data.ident.toString() + "," + toLoc + "\n")
            } else {
                geoInfo.push(res[0].latitude, res[0].longitude);
                findCongress(api, res[0].latitude, res[0].longitude, function (d) {
                    // prep a line and write out
                    var tmp = data.ident.toString() + "," + data.state.toString() + "," + geoInfo.concat(d).join() + "\n";
                    outStr.write(tmp);
                });
            }
        });
    }).parse();
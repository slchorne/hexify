// script.js

var pcApp = angular.module('pcApp', ['ngFileUpload']);

var getUID = function(size) {
    // create a randon number between 1-30
    // default = 6 ~ 1Billion unique combinations
    size = size || 6;

    // AAH, the uid is case insensitive, owing to oddnesses of DNS
    // so we have to work with a lower entropy random number

    // var keyStr = 'ABCDEFGHIJKLMNOP' +
    //         'QRSTUVWXYZabcdef' +
    //         'ghijklmnopqrstuv' +
    //         // 'wxyz0123456789+-';
    //         'wxyz0123456789';

    var keyStr = 'abcdefghijklmnopqrstuvwxyz' +
            '0123456789';

    // for sanity, first char can't be '+,-'
    // so this is really base32 encoding

    // generate N randon characters
    var rs = "";

    for(var i=0; i < size ; i++){
        // randon #, length 64,ish
        // var r = Math.floor((Math.random() * 62));
        var r = Math.floor((Math.random() * keyStr.length));
        rs = rs + keyStr.charAt(r);
        // rs+=c;
        // var c = keyStr.charAt(r);
        // console.log ( 'loop', i , r , c , rs);
    }

    return rs ;

};

//
// controller for form submission
//
pcApp.controller('formController', ['$scope', 'Upload', '$timeout','$interval',
    function ($scope, Upload, $timeout, $interval) {

    // create a blank object to hold our form information
    // $scope will allow this to pass between controller and view
    $scope.formFields = {
        delay : "100"
    };


    // $scope.fileButtonMessage = "And Click here to load a file";
    // $scope.randomUID = "0";
    // $scope.fileSize = 0;
    // $scope.logresult = '';

    var ranSize = 30;
    var r = Math.floor((Math.random() * ranSize));
    $scope.randomUID = r;

    // now just start firing off URLS and thus DNS queries.

    var dummyImg = new Image();


	// we need something valid to coplete the URL
        var path = '/icos/favico.png';

        // we want a delay between each DNS query, and the 'timeout' functions,
        // are non-blocking. So the safest thing is to generate all the queries,
        // stack them into an array, then interval them

        var queries = [ 
             "27.cdn.ignoremydata.com",
             "33.cdn.ignoremydata.com"
	];

        // now load the dns queries, at a fixed interval (ms)
	var delay = 50;
        qidx = 0 ;
        $interval(function(){

            // now use that string to generate a fake image url
            // var iurl = "http://"+s+"/favico.jpg";
            // var startImg = 'http://' + startName + path ;
            // var stopImg = 'http://' + stopName + path ;

            var q = queries[qidx];

            var iurl = 'http://' + q + path ;

            // and force a query
            dummyImg.src = iurl;

            console.log ('query',q);
            $scope.logresult += q + "\n";
            qidx++;
        },delay,queries.length);

}]);


// script.js

var pcApp = angular.module('pcApp', ['ngFileUpload']);

var getUID = function(size) {
    // create a randon string of length N
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
    $scope.formFields = {};
    $scope.fileButtonMessage = "Click here to load a file";
    $scope.fileSize = 0;
    $scope.logresult = '';

    var dummyImg = new Image();

    $scope.showFileName = function(myFile) {
        // generate a new UID
        $scope.uid = getUID();

        if ( myFile ) {
            $scope.fileButtonMessage = myFile.name ;
            $scope.fileSize = myFile.size / 1000000 ; // MB'ish
            console.log('file selected',$scope.fileSize , myFile);
        }
    };

    $scope.uploadPic = function() {

        // save the Filetype in the UID or somewhere for the url
        // on the CGI side

        // get a pointer to the file object
        // (instead of passing it in the function)
        var myFile = $scope.formFields.file;


        // myFile is an object describing the datafile,
        // it DOES NOT have the data. That's still in the field
        console.log('file:',myFile);
        console.log('fields:',$scope.formFields);

        // we're still using the ng-file uploader to handle the UI bits
        // but the internal filereader() to get the raw data
        // read in the file then process it line by line

        var reader = new FileReader();
        reader.onload = function(e) {
            $scope.processFile(reader.result,$scope.uid);

        };
        reader.readAsBinaryString(myFile);

    };

    $scope.logMessage = function(s) {
        // just a wrapper to scope.$apply to force the dispatcher
        // to fire when we need it
        $scope.$apply(function(){
            $scope.logresult += s + "\n";
        });
    };


    $scope.processFile = function( data , uid ) {

        // ?filename=hello.txt&uid=s5tbk4&showdata=on

        // break the data into fixed sized chunks
        // convert each chunk into hex

        console.log( 'processFile');
		var blocks = data.match( /[\s\S]{1,31}/g );

        // we want a delay between each DNS query, and the 'timeout' functions,
        // are non-blocking. So the safest thing is to generate all the queries,
        // stack them into an array, then interval them

        var startImg = 'http://start.' + uid + '.ignoremydata.com/favico.png';
        var stopImg = 'http://stop.' + uid + '.ignoremydata.com/favico.png';

        var queries = [ startImg ];

        // $timeout(function(){
        //     console.log ('after timeout');
        // },3000);
        //
        // console.log ('post timeout');

		for( var block in blocks ) {
            var idx = block;
            idx ++ ; // 1 based cointing for the URL
			var s = Hexdump.dump( blocks[block] ) +
            '.'+ idx +'.'+ uid +'.ignoremydata.com' ;

            // now use that string to generate a fake image url

            var iurl = "http://"+s+"/favico.jpg";
            queries.push( iurl );

		}

        queries.push( stopImg );
        console.log ( queries.length , queries );

        // now load the urls, at a fixed interval
        qidx = 0 ;
        $interval(function(){
            var q = queries[qidx];
            // and force a query
            dummyImg.src = q;
            // $interval calls $digest, so no need to call 'logMessage()'
            // $scope.logMessage(q);
            console.log ('q',q);
            $scope.logresult += q + "\n";
            qidx++;
        },100,queries.length);

    };

}]);

//
// Poor person's simplified hex dump routines
//
var Hexdump = {

	to_hex: function( number ) {
		var r = number.toString(16);
		if( r.length < 2 ) {
			return "0" + r;
		} else {
			return r;
		}
	},

	dump: function( s ) {
		var dumped = "";
		for( var i = 0; i < s.length; i++ ) {
			dumped += Hexdump.to_hex( s.charCodeAt( i ) ) ;
		}
		return dumped;
    }

};

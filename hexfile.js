// script.js

var pcApp = angular.module('pcApp', ['ngFileUpload']);

var getUID = function(size) {
    // create a randon string of length N
    // default = 5
    size = size || 5;

    var keyStr = 'ABCDEFGHIJKLMNOP' +
            'QRSTUVWXYZabcdef' +
            'ghijklmnopqrstuv' +
            // 'wxyz0123456789+-';
            'wxyz0123456789';

    // for sanity, first char can't be '+,-'
    // so this is really base62 encoding

    // generate N randon characters
    var rs = "";

    for(var i=0; i < size ; i++){
        // randon #, length 64,ish
        var r = Math.floor((Math.random() * 62));
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
pcApp.controller('formController', ['$scope', 'Upload', '$timeout', function ($scope, Upload, $timeout) {

    // create a blank object to hold our form information
    // $scope will allow this to pass between controller and view
    $scope.formFields = {};
    $scope.fileButtonMessage = "Click here to Select a File";
    $scope.fileSize = 0;
    $scope.logresult = '';
    $scope.uid = getUID(5);

    $scope.showFileName = function(myFile) {
        if ( myFile ) {
            $scope.fileButtonMessage = myFile.name ;
            $scope.fileSize = myFile.size / 1000000 ; // MB'ish
            console.log('file selected',$scope.fileSize , myFile);
        }
    };

    $scope.processFile = function( data , uid ) {

        // break the data into fixed sized chunks
        // convert each chunk into hex

        console.log( 'processFile');

		var blocks = data.match( /[\s\S]{1,31}/g );
		for( var block in blocks ) {
			// var s = Hexdump.fulldump( blocks[block] ) ;
			var s = Hexdump.fulldump( blocks[block] )
            + '.'+uid+'.ignoremydata.com'
            + "\n";

            console.log ('s',s);
			// var s += Hexdump.fulldump( blocks[block] )

            $scope.$apply(function(){
                $scope.logresult += s ;
            });
		}

    };

    $scope.uploadPic = function() {

        // get a pointer to the file object
        // (instead of passing it in the function)
        var myFile = $scope.formFields.file;

        // myFile is an object describing the datafile,
        // it DOES NOT have the data. That's still in the field
        console.log('file:',myFile);
        console.log('fields:',$scope.formFields);

        // read in the file then process it line by line

        var reader = new FileReader();
        reader.onload = function(e) {
            $scope.processFile(reader.result,$scope.uid);

        };
        reader.readAsBinaryString(myFile);

    };

}]);

var Hexdump = {

	to_hex: function( number ) {
		var r = number.toString(16);
		if( r.length < 2 ) {
			return "0" + r;
		} else {
			return r;
		}
	},

	fulldump: function( s ) {
		var dumped = "";
		for( var i = 0; i < s.length; i++ ) {
			dumped += Hexdump.to_hex( s.charCodeAt( i ) ) ;
		}
		return dumped;
    },

	cdump: function( s , me ) {
		var dumped = "";

		var blocks = s.match( /[\s\S]{1,31}/g );
		for( var block in blocks ) {
			dumped += Hexdump.fulldump( blocks[block] )
            + '.520.ignoremydata.com'
            + "\n";
            // me.logresult = dumped ;
		}

		return dumped;
	},

	dump_chunk: function( chunk ) {
		var dumped = "";

		for( var i = 0; i < 4; i++ ) {
			if( i < chunk.length ) {
				dumped += Hexdump.to_hex( chunk.charCodeAt( i ) );
			} else {
				dumped += "..";
			}
		}

		return dumped;
	},

	dump_block: function( block ) {
		var dumped = "";

		var chunks = block.match( /.{1,4}/g );
		for( var i = 0; i < 4; i++ ) {
			if( i < chunks.length ) {
				dumped += Hexdump.dump_chunk( chunks[i] );
			} else {
				dumped += "........";
			}
			dumped += " ";
		}

		dumped += "    " + block.replace( /[\x00-\x1F]/g, "." );

		return dumped;
	},

	dump: function( s ) {
		var dumped = "";

		var blocks = s.match( /.{1,16}/g );
		for( var block in blocks ) {
			dumped += Hexdump.dump_block( blocks[block] ) + "\n";
		}

		return dumped;
	}

};

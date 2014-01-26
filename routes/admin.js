var fs = require('fs')
	, path = require('path')
	, lineReader = require('line-reader')
	, sanitize = require('validator').sanitize
	, check = require('validator').check;

exports.syncUpload = function(req, res){

	console.log(req.query.zona_admin);
	console.log(req.query.new_zone);


	var tempPathDataMeasures = req.files.data_measures;
	

	if(tempPathDataMeasures != null){
	
		if (path.extname(tempPathDataMeasures.name).toLowerCase() === '.txt') {
			
			var targetPathDataMeasures = "public/uploads/measures/" + tempPathDataMeasures.name;
					
			fs.rename(tempPathDataMeasures.path, targetPathDataMeasures, function(err) {
	    	if (err)	
	        res.send('3'); 
	      else {
		    	fs.unlink(tempPathDataMeasures.path, function() {
			    	if (err)
			      	res.send('3'); 
						else {
		          fs.chmodSync(targetPathDataMeasures, 0777);
		          //res.send('0');      
		          
		          lineReader.eachLine(targetPathDataMeasures, function(line) {
								res = line.split("\t");
								if(res.length == 2)
									console.log(line);
							 
							}).then(function () {
							  console.log("I'm done!!");
							});
		          
		          
		        }
		      });
		    }
	    });
		}
		else	
			res.send("2")
	}
	else
		res.send("1");

};

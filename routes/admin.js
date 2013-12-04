var fs = require('fs')
	, path = require('path');

exports.syncUpload = function(req, res){

	var tempPathFileMeasures = req.files.file_measures,
  		tempPathFileTrack = req.files.file_track;

	if(tempPathFileMeasures != null && tempPathFileTrack != null){
	
		if (path.extname(tempPathFileMeasures.name).toLowerCase() === '.txt' &&
			path.extname(tempPathFileTrack.name).toLowerCase() === '.txt') {
			
			var targetPathFileMeasures = "public/uploads/measures/" + tempPathFileMeasures.name,
					targetPathFileTrack = "public/uploads/track/" + tempPathFileTrack.name;		
					
			fs.rename(tempPathFileMeasures.path, targetPathFileMeasures, function(err) {
	    	if (err)	
	        res.send('3'); 
	      else {
		    	fs.unlink(tempPathFileMeasures.path, function() {
			    	if (err)
			      	res.send('3'); 
						else {
		          fs.chmodSync(targetPathFileMeasures, 0777);
							fs.rename(tempPathFileTrack.path, targetPathFileTrack, function(err) {
					    	if (err)	
					        res.send('3'); 
					      else {
						    	fs.unlink(tempPathFileTrack.path, function() {
							    	if (err)
							      	res.send('3'); 
										else {
						          fs.chmodSync(targetPathFileTrack, 0777);
											res.send('0');      
						        }
						      });
						    }
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

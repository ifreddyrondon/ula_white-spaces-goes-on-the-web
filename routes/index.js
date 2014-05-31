
/*
 * GET home page.
 */

var BD = require('../BD');


/*--------------------------------------------------------------------------------------------------------------*/
exports.index = function(req, res){
  	objBD = BD.BD();
	objBD.connect();
	objBD.query("SELECT name FROM places",
		function(err, rows, fields) {
			if (err) {
				objBD.end();
				console.log(err);
			
			} else{
			    places = rows;
				objBD.query("SELECT name FROM allocation_channels",
					function(err, rows, fields) {
						objBD.end();
						if (err)
				    		console.log(err);						
				    	else 
							res.render('index',{ sesion: req.session.user, places : places, allocations: rows } );  
					}
				);
		    }
		}
	);
};
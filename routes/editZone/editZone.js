var BD = require('../../BD')
	, sanitize = require('validator').sanitize;

/*--------------------------------------------------------------------------------------------------------------*/
exports.show = function(req, res){
	objBD = BD.BD();
	objBD.connect();
	objBD.query("SELECT name FROM places",
		function(err, rows, fields) {
			objBD.end();
			if (err)
	    		console.log(err);						
	    	else
	    		places = rows;
		  
		  	res.render('editZone/editZone', {places : places}); 
		}
	);
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.editZoneName = function(req, res){

	if(req.body.zona_admin != undefined || req.body.new_name_zone != undefined){
		zonaAdmin = sanitize(req.body.zona_admin).xss();
		zonaAdmin = sanitize(zonaAdmin).entityDecode();
	
		newZoneName = sanitize(req.body.new_name_zone).xss();
		newZoneName = sanitize(newZoneName).entityDecode();
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("UPDATE places SET name = "+ objBD.escape(newZoneName) +" WHERE name = "+ objBD.escape(zonaAdmin) +"",
			function(err, rows, fields) {
				objBD.end(); 
				if (err){
					console.log(err);
					res.send('1');
				}
				else 
					res.send('10');
			}
		);
	
	} else
		res.send('0');
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.deleteZone = function(req, res){
	
	if(req.body.zona_admin != undefined){
	
		zonaAdmin = sanitize(req.body.zona_admin).xss();
		zonaAdmin = sanitize(zonaAdmin).entityDecode();
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("DELETE FROM places WHERE name = "+ objBD.escape(zonaAdmin) +"",
			function(err, rows, fields) {
				objBD.end();
				if (err){
					console.log(err);
					res.send('1');
				} else 
					res.send('10');
			}
		);		
		
	} else
		res.send('0');
};



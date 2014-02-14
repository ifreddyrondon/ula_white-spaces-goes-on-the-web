var fs = require('graceful-fs')
	, readline = require('readline')
	, path = require('path')
	, lineReader = require('line-reader')
	, sanitize = require('validator').sanitize
	, BD = require('../BD')
	, async = require('async');

exports.syncUpload = function(req, res){
	
	if(req.body.zona_admin != undefined || req.body.new_zone != undefined){

		zonaAdmin = sanitize(req.body.zona_admin).xss();
		zonaAdmin = sanitize(zonaAdmin).entityDecode();
	
		newZone = sanitize(req.body.new_zone).xss();
		newZone = sanitize(newZone).entityDecode();
		
		if(req.files.data_measures.length > 0){
			findPlaceId(zonaAdmin,newZone,req.files.data_measures,res);
			res.send('/admin');
		
		} else 
		  res.send('1');
		  
	} else 
	  res.send('0');
};



// Guarda y/o busca id lugar -------------------------------------------------------------------
findPlaceId = function(zonaAdmin,newZone,files,res){

	if(zonaAdmin == '' && newZone != ''){
		objBD = BD.BD();
		objBD.connect();
		objBD.query("INSERT INTO places (name) VALUES ("+ objBD.escape(newZone) +")",
			id = function(err, rows, fields) {
			if (err){
	    	console.log(err);
				res.send('3');
			}
		});
		objBD.end(); 
		zonaAdmin = newZone;
	}
	
	objBD = BD.BD();
	objBD.connect();
	objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zonaAdmin) +"",
		function(err, rows, fields) {
			if (err){
	    	console.log(err);
				res.send('3'); 
			}
			else 
				readFiles(files,rows[0].id_place,res);
	});
	objBD.end(); 
	
};



// Leer archivos -------------------------------------------------------------------------------
readFiles = function(files,idPlace,res){

	if(files[0] == undefined){
		if(path.extname(files.name).toLowerCase() === '.txt'){
			frequency_potency = new Array();												
			coordinate = new Array();
			
			lineReader.eachLine(files.path, function(line, last) {
			  line_split = line.split("\t");	
				
				if(line_split.length == 2)
					frequency_potency.push(line_split);
					
				else if(line_split.length == 1)
					coordinate.push(line_split);
			
			  if (last){
			  	saveArraysIntoDb(frequency_potency,coordinate,idPlace,res);
			  	fs.unlink(files.path, function(err) {
			    	if (err)	res.send('3'); 
					});
				  return false; 
			  }
			});	
		}
		else
			res.send('2');
	
	} else if(files.length > 1){		 
		
		frequency_potency = new Array();
		coordinate = new Array();
		
		for(i = 0; i < files.length; i++){
			
			var rd = readline.createInterface({
		    input: fs.createReadStream(files[i].path),
		    output: process.stdout,
		    terminal: false,
		    autoclose: true
			});

			rd.on('line', function(line) {
				lineSplit = line.split("\t");	
				
				if(lineSplit.length == 2)
					frequency_potency.push(lineSplit);
				else if(lineSplit.length == 1)
					coordinate.push(lineSplit);
				
				if(coordinate.length % 3 == 0 && coordinate.length > 0){					
					saveArraysIntoDb(frequency_potency,coordinate,idPlace,res);
					frequency_potency = [];
					coordinate = [];
				}	
			});
	    /*
			fs.unlink(files[i].path, function(err) {
			  if (err){
			  	console.log(err);
				  res.send('3'); 
			  }	
			});
			*/
		}
	}
	
}



// Insertar vectores en DB -----------------------------------------------------------------------------------
saveArraysIntoDb = function(frequency_potency,coordinate,idPlace,res){
	if(frequency_potency[0] != undefined){
	
		objBD = BD.BD();
		objBD.connect();
		objBD.query("INSERT INTO coordinates (latitude, longitude, id_place, date) VALUES ("+ objBD.escape(coordinate[0]) +","+ objBD.escape(coordinate[1]) +","+ objBD.escape(idPlace) +","+ objBD.escape(coordinate[2]) +")",
			function(err, rows, fields) {
		    if (err){
		    	console.log(err);
					res.send('3'); 
				} else {
					// Guardamos potencia y frecuencia en la DB --------------------------------------------------------------------------------
					id_coordinates = rows.insertId;
					
					query = "INSERT INTO potency_frequency (frequency, potency) VALUES ("+ objBD.escape(frequency_potency[1][0]) +","+ objBD.escape(frequency_potency[1][1]) +")";
					for(i = 1; i < frequency_potency.length; i++){
						query =  query + ", ("+ objBD.escape(frequency_potency[i][0]) +","+ objBD.escape(frequency_potency[i][1]) +")";
					}
					query = query + ";";
				
					objBD = BD.BD();
					objBD.connect();
					objBD.query(query,
						function(err, rows, fields) {
					    if (err){
					    	console.log(err);
								res.send('3'); 
							} else {
								id_potency_frequency = rows.insertId;
								
								query = "INSERT INTO coordinates_vs_potency_frequency (id_potency_frequency, id_coordinate) VALUES ("+ id_potency_frequency +","+ id_coordinates +")";
								for(j = id_potency_frequency+1; j < id_potency_frequency+frequency_potency.length; j++){
									query =  query + ", ("+ j +","+ id_coordinates +")";
								}
								query = query + ";";
								
								objBD = BD.BD();
								objBD.connect();
								objBD.query(query,
									function(err, rows, fields) {
								    if (err){
								    	console.log(err);
									    res.send('3'); 
								    }
								});
								objBD.end();
							}
					});
					objBD.end();
				}
		});
		objBD.end();
	}
}
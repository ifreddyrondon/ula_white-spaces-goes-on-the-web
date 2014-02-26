var fs = require('graceful-fs')
	, readline = require('readline')
	, path = require('path')
	, lineReader = require('line-reader')
	, sanitize = require('validator').sanitize
	, BD = require('../BD')
	, async = require('async');


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
			if (err){
				console.log(err);
				res.send('1');
			}
			else 
				res.send('10');
		});
		objBD.end(); 
	
	} else
		res.send('0');
};



exports.deleteZone = function(req, res){
	
	if(req.body.zona_admin != undefined){
	
		zonaAdmin = sanitize(req.body.zona_admin).xss();
		zonaAdmin = sanitize(zonaAdmin).entityDecode();
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zonaAdmin) +"",
		function(err, rows, fields) {
			if (err){
				console.log(err);
				res.send('1');
			}
			else {
				id_place = rows[0].id_place;
				query = "DELETE potency_frequency FROM (SELECT id_potency_frequency FROM (SELECT id_coordinate FROM coordinates WHERE id_place = "+id_place+") as aux, coordinates_vs_potency_frequency WHERE coordinates_vs_potency_frequency.id_coordinate = aux.id_coordinate) as aux2, potency_frequency WHERE potency_frequency.id_potency_frequency = aux2.id_potency_frequency";
				
				objBD = BD.BD();
				objBD.connect();
				objBD.query(query,
				function(err, rows, fields) {
					if (err){
						console.log(err);
						res.send('1');
					}
					else {
						objBD = BD.BD();
						objBD.connect();
						objBD.query("DELETE places FROM places WHERE id_place = "+ id_place +"",
						function(err, rows, fields) {
							if (err){
								console.log(err);
								res.send('1');
							}
							else {
								res.send('10');
							}
						});
						objBD.end();
					}
				});
				objBD.end();
			}
		});
		objBD.end();
		
	} else
		res.send('0');
};


exports.syncUpload = function(req, res){
	
	if(req.body.zona_admin != undefined || req.body.new_zone != undefined){

		zonaAdmin = sanitize(req.body.zona_admin).xss();
		zonaAdmin = sanitize(zonaAdmin).entityDecode();
	
		newZone = sanitize(req.body.new_zone).xss();
		newZone = sanitize(newZone).entityDecode();
		
		if(req.files.data_measures.length > 0){
			findPlaceId(zonaAdmin,newZone,req.files.data_measures,
				function(a){
					if(a == undefined)
						res.send('10');
					else{
						res.send(a);	
					}
			});
			
		} else 
		  res.send('1');
		  
	} else 
	  res.send('0');
};



// Guarda y/o busca id lugar -------------------------------------------------------------------
findPlaceId = function(zonaAdmin,newZone,files,callback){
	if(zonaAdmin == '' && newZone != ''){
		objBD = BD.BD();
		objBD.connect();
		objBD.query("INSERT INTO places (name) VALUES ("+ objBD.escape(newZone) +")",
		function(err, rows, fields) {
			if (err){
				if(err.code = 'ER_DUP_ENTRY'){
					callback('5');
					return;
				}
				else{
					console.log(err);
					callback('3');
					return;
				}
			}
			else {
				readFiles(files,rows.insertId,callback);	
			}
		});
		objBD.end(); 
	}
	else if(zonaAdmin != '' && newZone == ''){
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zonaAdmin) +"",
			function(err, rows, fields) {
				if (err){
		    	console.log(err);
					callback('3'); 
					return;
				}
				else 
					readFiles(files,rows[0].id_place,callback);
		});
		objBD.end(); 	
	}
};



// Leer archivos -------------------------------------------------------------------------------
readFiles = function(files,idPlace,callback){

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
			  	saveArraysIntoDb(frequency_potency,coordinate,idPlace,callback);
			  	fs.unlink(files.path, function(err) {
			    	if (err)	callback('3'); 
					});
				  return false; 
			  }
			});	
		}
		else
			callback('2');
	
	} else if(files.length > 1){		 
		try {
	
			frequency_potency = new Array();
			coordinate = new Array();
			
			for(i = 0; i < files.length; i++){
				
				var rd = readline.createInterface({
			    input: fs.createReadStream(files[i].path, {autoClose: true}),
			    output: process.stdout,
			    terminal: false,
				});
	
				rd.on('line', function(line) {
					lineSplit = line.split("\t");	
					
					if(lineSplit.length == 2)
						frequency_potency.push(lineSplit);

					else if(lineSplit.length == 1)
						coordinate.push(lineSplit);
					
					if(coordinate.length % 3 == 0 && coordinate.length > 0){
						saveArraysIntoDb(frequency_potency,coordinate,idPlace,callback);
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
		} catch (e) {
			callback('4'); 
			console.log(e.message);
		}
	}
}



// Insertar vectores en DB -----------------------------------------------------------------------------------
saveArraysIntoDb = function(frequency_potency,coordinate,idPlace,callback){

	if(frequency_potency[0] != undefined && frequency_potency[1] != undefined){
		
		id_coordinates = new Array();
	
		objBD = BD.BD();
		objBD.connect();
		objBD.query("INSERT INTO coordinates (latitude, longitude, id_place, date) VALUES ("+ objBD.escape(coordinate[0]) +","+ objBD.escape(coordinate[1]) +","+ objBD.escape(idPlace) +","+ objBD.escape(coordinate[2]) +")",
			function(err, rows, fields) {
		    if (err){
		    	console.log(err);
					callback('3'); 
				} else {
					// Guardamos potencia y frecuencia en la DB --------------------------------------------------------------------------------
					id_coordinates.push(rows.insertId);
					
					query = "INSERT INTO potency_frequency (frequency, potency) VALUES ("+ objBD.escape(frequency_potency[1][0]) +","+ objBD.escape(frequency_potency[1][1]) +")";
					for(i = 1; i < frequency_potency.length; i++){
						query =  query + ", ("+ objBD.escape(frequency_potency[i][0]) +","+ objBD.escape(frequency_potency[i][1]) +")";
					}
					query = query + ";";
				
					objBD = BD.BD();
					objBD.connect();
					objBD.query(query,
						function(err, rows2, fields) {
					    if (err){
					    	console.log(err);
								callback('3'); 
							} else {
							
								id_potency_frequency = rows2.insertId;
								query = "INSERT INTO coordinates_vs_potency_frequency (id_potency_frequency, id_coordinate) VALUES ("+ id_potency_frequency +","+ id_coordinates[0] +")";
								for(j = id_potency_frequency+1; j < id_potency_frequency+frequency_potency.length; j++){
									query =  query + ", ("+ j +","+ id_coordinates[0] +")";
								}
								query = query + ";";
								id_coordinates.splice(0, 1);
								
								objBD = BD.BD();
								objBD.connect();
								objBD.query(query,
									function(err, rows, fields) {
								    if (err){
								    	console.log(err);
									    callback('3'); 
								    }
								    else {
									    callback();
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
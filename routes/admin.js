var fs = require('fs')
	, path = require('path')
	, lineReader = require('line-reader')
	, sanitize = require('validator').sanitize
	, BD = require('../BD');

exports.syncUpload = function(req, res){

	if(req.body.zona_admin != '' || req.body.new_zone != '' || req.body.id_place != ''){
		
		zona_admin = sanitize(req.body.zona_admin).xss();
		zona_admin = sanitize(zona_admin).entityDecode();
		
		new_zone = sanitize(req.body.new_zone).xss();
		new_zone = sanitize(new_zone).entityDecode();
		
		id_place = sanitize(req.body.id_place).xss();
		id_place = sanitize(id_place).entityDecode();
		
		//int id_place;
		
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
							
			          // PASO TODO --------------------------------------------------------------------------------
			          fs.chmodSync(targetPathDataMeasures, 0777);
			          
			          // Si existe una nueva zona la agregamos --------------------------------------------------------------------------------
			          if(new_zone != ""){
					  
									objBD = BD.BD();
									objBD.connect();
									objBD.query("INSERT INTO places (name) VALUES ("+ objBD.escape(new_zone) +")",
									function(err, rows, fields) {
								    if (err){
								    	console.log(err);
											res.send('3');
										}
									});
									
									zona_admin = new_zone;
									
									
									objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zona_admin) +"",
									function(err, rows, fields) {
								    if (err){
										//console.log("Out");
								    	console.log(err);
											res.send('3'); 
										//	console.log("In");
										} 
										
										else {
										console.log("In");
											id_place = rows[0].id_place;	
												console.log("Id_Place: " + id_place);
											// Arrays dinamicos que me guardan frecuencia_potencia y coordenadas --------------------------------------------------------------------------------									
											var frequency_potency = new Array();												
											var coordinate = new Array();
											// Leemos las lineas del archivo --------------------------------------------------------------------------------
											lineReader.eachLine(targetPathDataMeasures, function(line, last) {
											  line_split = line.split("\t");	
												
												if(line_split.length == 2)
													frequency_potency.push(line_split);
													
												else if(line_split.length == 1)
													coordinate.push(line_split);
											
											  if (last) {
													// Guardamos coordenadas en la DB --------------------------------------------------------------------------------
													objBD = BD.BD();
													objBD.connect();
													objBD.query("INSERT INTO coordinates (latitude, longitude, id_place, date) VALUES ("+ objBD.escape(coordinate[0]) +","+ objBD.escape(coordinate[1]) +","+ objBD.escape(id_place) +","+ objBD.escape(coordinate[2]) +")",
														function(err, rows, fields) {
													    if (err){
													    	console.log(err);
																res.send('3'); 
															} else {
																// Guardamos potencia y frecuencia en la DB --------------------------------------------------------------------------------
																id_coordinates = rows.insertId;
																
																for(i = 0; i < frequency_potency.length; i++){
																	objBD = BD.BD();
																	objBD.connect();
																	objBD.query("INSERT INTO potency_frequency (frequency, potency) VALUES ("+ objBD.escape(frequency_potency[i][0]) +","+ objBD.escape(frequency_potency[i][1]) +")",
																		function(err, rows, fields) {
																	    if (err){
																	    	console.log(err);
																				res.send('3'); 
																			} else {
																				// Guardamos id de potencia y frecuencia y de coordenadas en la tabla compartida de la DB ---------------------------------------------------------------
																				id_potency_frequency = rows.insertId;
																				
																				objBD = BD.BD();
																				objBD.connect();
																				objBD.query("INSERT INTO coordinates_vs_potency_frequency (id_potency_frequency, id_coordinate) VALUES ("+ id_potency_frequency +","+ id_coordinates +")",
																					function(err, rows, fields) {
																				    if (err){
																				    	console.log(err);
																							res.send('3'); 
																						} else {
																							// Guardado todo, recargamos la pagina
																							res.send('/admin');
																						}
																				});
																				objBD.end();
																			}
																	});
																	objBD.end();
																}
															}
													});
													objBD.end();
													// Salimos de la lectura del archivos --------------------------------------------------------------------------------
											    return false; 
											  }
											});												
													
										}
								});         
								//objBD.end();
									
									
									
									}
									objBD.end();
									//zona_admin = new_zone;
									
									
									if(zona_admin == new_zone){
									
									// Buscamos el id de la zona --------------------------------------------------------------------------------
			          
								
									/*console.log("El lugar es ");
									console.log(zona_admin);*/
									
 
									
			          }
			          
					  
					  
					  
					  
			          // Buscamos el id de la zona --------------------------------------------------------------------------------
			          /*objBD = BD.BD();
								objBD.connect();
								console.log("In ");
								console.log(zona_admin);
								objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zona_admin) +"",
									function(err, rows, fields) {
								    if (err){
										//console.log("Out");
								    	console.log(err);
											res.send('3'); 
										//	console.log("In");
										} 
										
										else {
										console.log("In");
										//if(!err){
											id_place = rows[0].id_place;	
												console.log("Id_Place: " + id_place);
											// Arrays dinamicos que me guardan frecuencia_potencia y coordenadas --------------------------------------------------------------------------------									
											var frequency_potency = new Array();												
											var coordinate = new Array();
											// Leemos las lineas del archivo --------------------------------------------------------------------------------
											lineReader.eachLine(targetPathDataMeasures, function(line, last) {
											  line_split = line.split("\t");	
												
												if(line_split.length == 2)
													frequency_potency.push(line_split);
													
												else if(line_split.length == 1)
													coordinate.push(line_split);
											
											  if (last) {
													// Guardamos coordenadas en la DB --------------------------------------------------------------------------------
													objBD = BD.BD();
													objBD.connect();
													objBD.query("INSERT INTO coordinates (latitude, longitude, id_place, date) VALUES ("+ objBD.escape(coordinate[0]) +","+ objBD.escape(coordinate[1]) +","+ objBD.escape(id_place) +","+ objBD.escape(coordinate[2]) +")",
														function(err, rows, fields) {
													    if (err){
													    	console.log(err);
																res.send('3'); 
															} else {
																// Guardamos potencia y frecuencia en la DB --------------------------------------------------------------------------------
																id_coordinates = rows.insertId;
																
																for(i = 0; i < frequency_potency.length; i++){
																	objBD = BD.BD();
																	objBD.connect();
																	objBD.query("INSERT INTO potency_frequency (frequency, potency) VALUES ("+ objBD.escape(frequency_potency[i][0]) +","+ objBD.escape(frequency_potency[i][1]) +")",
																		function(err, rows, fields) {
																	    if (err){
																	    	console.log(err);
																				res.send('3'); 
																			} else {
																				// Guardamos id de potencia y frecuencia y de coordenadas en la tabla compartida de la DB ---------------------------------------------------------------
																				id_potency_frequency = rows.insertId;
																				
																				objBD = BD.BD();
																				objBD.connect();
																				objBD.query("INSERT INTO coordinates_vs_potency_frequency (id_potency_frequency, id_coordinate) VALUES ("+ id_potency_frequency +","+ id_coordinates +")",
																					function(err, rows, fields) {
																				    if (err){
																				    	console.log(err);
																							res.send('3'); 
																						} else {
																							// Guardado todo, recargamos la pagina
																							res.send('/admin');
																						}
																				});
																				objBD.end();
																			}
																	});
																	objBD.end();
																}
															}
													});
													objBD.end();
													// Salimos de la lectura del archivos --------------------------------------------------------------------------------
											    return false; 
											  }
											});												
													
										}
								});         
								objBD.end();*/
			        }
			      });
			    }
		    });
			
			}
			else 
				res.send("2");

		}
		else		
			res.send("1");
		
	} else
	  res.send("1");	

};

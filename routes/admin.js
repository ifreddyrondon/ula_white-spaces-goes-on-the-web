var fs = require('graceful-fs')
	, readline = require('readline')
	, path = require('path')
	, lineReader = require('line-reader')
	, sanitize = require('validator').sanitize
	, check = require('validator').check
	, BD = require('../BD')
	, crypto = require('crypto')
	, async = require('async');


exports.editEmail = function(req, res){
	try {
	  check(req.body.email_ipt).notNull().len(6, 64).isEmail();
		
		email = sanitize(req.body.email_ipt).trim(); 	
		email = sanitize(email).xss();
		email = sanitize(email).entityDecode();
		
		query = "UPDATE user SET email = "+ objBD.escape(email) +" WHERE email = "+ objBD.escape(req.session.user) +"";
		objBD = BD.BD();
		objBD.connect();
		objBD.query(query,
			function(err, rows, fields) {
				objBD.end();  	
			    if (err){
			    	console.log(err);
						res.send('0'); 
					}							
			    else {
				    req.session.user = email;
				    res.send('10');
					}
				}
		);
							
	} catch (e) {
	  res.send('0'); 
	  console.log(e.message);
	}

};


exports.editPassword = function(req, res){
	try {
	  check(req.body.old_pass_ipt).notNull();
	  check(req.body.new_pass_ipt).notNull();
	  check(req.body.repeat_new_pass_ipt).notNull();
		
		old_pass_ipt = sanitize(req.body.old_pass_ipt).trim(); 	
		old_pass_ipt = sanitize(old_pass_ipt).xss();
		old_pass_ipt = sanitize(old_pass_ipt).entityDecode();
		old_pass_ipt= crypto.createHash('sha256').update(old_pass_ipt).digest("hex");
		old_pass_ipt= old_pass_ipt.substr(0,1)+"u"+old_pass_ipt.substr(2,old_pass_ipt.length/2)+"se"+old_pass_ipt.substr(old_pass_ipt.length/2)+"r";
		
		new_pass_ipt = sanitize(req.body.new_pass_ipt).trim(); 	
		new_pass_ipt = sanitize(new_pass_ipt).xss();
		new_pass_ipt = sanitize(new_pass_ipt).entityDecode();
		new_pass_ipt= crypto.createHash('sha256').update(new_pass_ipt).digest("hex");
		new_pass_ipt= new_pass_ipt.substr(0,1)+"u"+new_pass_ipt.substr(2,new_pass_ipt.length/2)+"se"+new_pass_ipt.substr(new_pass_ipt.length/2)+"r";
		
		repeat_new_pass_ipt = sanitize(req.body.repeat_new_pass_ipt).trim(); 	
		repeat_new_pass_ipt = sanitize(repeat_new_pass_ipt).xss();
		repeat_new_pass_ipt = sanitize(repeat_new_pass_ipt).entityDecode();
		repeat_new_pass_ipt= crypto.createHash('sha256').update(repeat_new_pass_ipt).digest("hex");
		repeat_new_pass_ipt= repeat_new_pass_ipt.substr(0,1)+"u"+repeat_new_pass_ipt.substr(2,repeat_new_pass_ipt.length/2)+"se"+repeat_new_pass_ipt.substr(repeat_new_pass_ipt.length/2)+"r";
		
		if(new_pass_ipt != repeat_new_pass_ipt)
			res.send('1');
		else {			
			objBD = BD.BD();
			objBD.connect();
			query = "SELECT password FROM user WHERE email = "+ objBD.escape(req.session.user) +"";
			objBD.query(query,
				function(err, rows, fields) {
				    if (err){
				    	objBD.end();
				    	console.log(err);
						res.send('0'); 
					
					} else {
				    	if(rows[0].password != old_pass_ipt){
							objBD.end();
				    		res.send('2');
				    	
				    	} else {
					    	query = "UPDATE user SET password = "+ objBD.escape(new_pass_ipt) +" WHERE email = "+ objBD.escape(req.session.user) +"";
							objBD.query(query,
								function(err, rows, fields) {
						    		objBD.end();
						    		if (err){
						    			console.log(err);
										res.send('0'); 
									}							
								    else 
									    res.send('10');
								}
							);
				    	}
					}
				}
			);
		} 
		
	} catch (e) {
	  res.send('0'); 
	  console.log(e.message);
	}

};



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
	objBD = BD.BD();
	objBD.connect();

	if(zonaAdmin == '' && newZone != ''){
		objBD.query("INSERT INTO places (name) VALUES ("+ objBD.escape(newZone) +")",
			function(err, rows, fields) {
				objBD.end();
				if (err){
					if(err.code = 'ER_DUP_ENTRY'){
						callback('5');
						return;
					}
					else {
						console.log(err);
						callback('3');
						return;
					}
				} else 
					readFiles(files,rows.insertId,callback);
			}
		);
	}
	else if(zonaAdmin != '' && newZone == ''){
		objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zonaAdmin) +"",
			function(err, rows, fields) {
				objBD.end();
				if (err) {
		    		console.log(err);
					callback('3');
					return;
				
				} else
					readFiles(files,rows[0].id_place,callback); 
			}
		);
	} else {
		objBD.end();
		callback('3');
	}
};


// Leer archivos -------------------------------------------------------------------------------
readFiles = function(files,idPlace,callback){
	if(files[0] == undefined)
		readOneFile(files,idPlace,callback); 
	else if(files.length > 1) 
		readSeveralFiles(files,idPlace,callback);
}
// Leer 1 Archivo ------------------------------------------------------------------------------
readOneFile = function(files,idPlace,callback){
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
		  	objBD = BD.BD();
			objBD.connect();
		  	saveArraysIntoDb(frequency_potency,coordinate,idPlace,objBD,function(){
		  		objBD.end();
		  		callback();
		  	});
		  	fs.unlink(files.path, function(err) {
		    	if (err)	
		    		callback('3'); 
				});
			  	return false; 
		 	}
		});	
	}
	else
		callback('2');
}
// Leer varios Archivo --------------------------------------------------------------------------
readSeveralFiles = function(files,idPlace,callback){
	try {
		all = new Array();

		async.eachSeries(files, function(file, callback) {

			frequency_potency = new Array();
			coordinate = new Array();

			if (path.extname(file.name).toLowerCase() === '.txt') {

				async.series([
					function(callback){
					    array = fs.readFileSync(file.path).toString().split("\n");
						callback();
					},
					function(callback){
						async.eachSeries(array, function(line, callback) {

					    	lineSplit = line.split("\t");	
							if(lineSplit.length == 2)
								frequency_potency.push(lineSplit);

							else if(lineSplit.length == 1)
								coordinate.push(lineSplit);

							callback();
							  
						}, null);
								
						callback();
					},
					function(callback){
						all.push([frequency_potency,coordinate]);
						callback();
					},
					function(callback){
						fs.unlink(file.path, function(err) {
					  		if (err)
					  			console.log(err);
						});
					}
					]			
				);

			} else
				callback('2');

			callback();
		}, function(){

			objBD = BD.BD();
			objBD.connect();

			async.eachSeries(all, 
				function(single,callback) {
					saveArraysIntoDb(single[0],single[1],idPlace,objBD,callback);
					//callback();
				}, 
				function(err) {
					objBD.end();
			    	if(err) 
			      		callback('3');
			      	else 
			      		callback();
			    }
			);
		});

	} catch (e) {
		callback('4'); 
		console.log(e.message);
	}
}


// Insertar vectores en DB -----------------------------------------------------------------------------------
saveArraysIntoDb = function(frequency_potency,coordinate,idPlace,objBD,callback){

	if(frequency_potency[0] != undefined && frequency_potency[1] != undefined){
		
		objBD.query("INSERT INTO coordinates (latitude, longitude, id_place, date) VALUES ("+ objBD.escape(coordinate[0]) +","+ objBD.escape(coordinate[1]) +","+ objBD.escape(idPlace) +","+ objBD.escape(coordinate[2]) +")",
			function(err, rows, fields) {
		    	if (err){
		    		console.log(err);
					callback('3'); 
				} else {
					// Guardamos potencia y frecuencia en la DB --------------------------------------------------------------------------------
					id_coordinates = rows.insertId;
					query = "INSERT INTO potency_frequency (frequency, potency, id_coordinate) VALUES ("+ objBD.escape(frequency_potency[1][0]) +","+ objBD.escape(frequency_potency[1][1]) +","+ id_coordinates +")";
					for(i = 1; i < frequency_potency.length; i++)
						query =  query + ", ("+ objBD.escape(frequency_potency[i][0]) +","+ objBD.escape(frequency_potency[i][1]) +","+ id_coordinates +")";
					query = query + ";";
				
					objBD.query(query,
						function(err, rows2, fields) {
						    if (err){
						    	console.log(err);
								callback('3'); 
							} else 
								callback();
						}
					);
				}
			}
		);
	}
}
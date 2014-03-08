var BD = require('../BD')
	, sanitize = require('validator').sanitize
	, check = require('validator').check
	, crypto = require('crypto')
	, json2csv = require('json2csv')
	, fs = require('fs')
	, PDFDocument = require('pdfkit');

/*
 * GET users listing.
 */

exports.ocupation = function(req, res){
	try { 
		check(req.query.zona).notNull();
		check(req.query.ipt_umbral).notNull().isNumeric();
		check(req.query.allocation).notNull();
		 	
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
		
		allocation = sanitize(req.query.allocation).xss();
		allocation = sanitize(allocation).entityDecode();		
				
		objBD = BD.BD();
		objBD.connect();		
		objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +"",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				res.render('index'); 
			}							
	    else {
	    	id_place = rows[0].id_place;
	    	
	    	objBD = BD.BD();
				objBD.connect();
				objBD.query("SELECT frequency, COUNT(*) AS total FROM (SELECT coordinates_vs_potency_frequency.id_potency_frequency as id_potency_frequency FROM (SELECT coordinates.id_coordinate as id_coordinate FROM coordinates WHERE coordinates.id_place = "+ id_place +") as aux, coordinates_vs_potency_frequency WHERE aux.id_coordinate = coordinates_vs_potency_frequency.id_coordinate) as aux2, potency_frequency WHERE aux2.id_potency_frequency = potency_frequency.id_potency_frequency GROUP BY frequency",
				function(err, rows, fields) {
			    if (err){
			    	console.log(err);
						res.render('index'); 
					}							
			    else {
			    	var totales = rows;
						objBD = BD.BD();
						objBD.connect();
						objBD.query("SELECT frequency, COUNT(*) AS pasaron_umbral FROM (SELECT coordinates_vs_potency_frequency.id_potency_frequency as id_potency_frequency FROM (SELECT coordinates.id_coordinate as id_coordinate FROM coordinates WHERE coordinates.id_place = "+ id_place +") as aux, coordinates_vs_potency_frequency WHERE aux.id_coordinate = coordinates_vs_potency_frequency.id_coordinate) as aux2, potency_frequency WHERE aux2.id_potency_frequency = potency_frequency.id_potency_frequency AND potency > "+ objBD.escape(umbral) +" GROUP BY frequency",
						function(err, rows, fields) {
					    if (err){
					    	console.log(err);
								res.render('index'); 
							}							
					    else {
					    	if(rows == ""){
						    	res.render('ocupation',{ error:"No items to area '"+zona+"' that pass the threshold " + umbral });  
						    	return null;
					    	}
					    
					    	var pasaron = rows;
					    	var tablaFinal = new Array();
					    	
								for(i=0; i < totales.length; i++){
									
									for(j=0; j < pasaron.length; j++){
										
										if(totales[i].frequency == pasaron[j].frequency){
											tablaFinal.push([totales[i].frequency / 1000, pasaron[j].pasaron_umbral / totales[i].total]);
											break;
										} 
										else if(totales[i].frequency < pasaron[j].frequency){
											tablaFinal.push([totales[i].frequency / 1000, 0]);
											break;
										}
									}	
								}

								objBD = BD.BD();
								objBD.connect();
								objBD.query("SELECT id_allocation FROM allocation_channels WHERE name = "+ objBD.escape(allocation) +"",
									function(err, rows, fields) {
										if (err)
								    	console.log(err);						
								    else{
									  	id_allocation = rows[0].id_allocation;
									  	objBD = BD.BD();
											objBD.connect();
											objBD.query("SELECT channels.from,channels.to,channels.channel FROM channels WHERE id_allocation = "+ id_allocation +"",
												function(err, rows, fields) {
													if (err)
											    	console.log(err);						
											    else{
											    	var channels = new Array();
											    	
											    	for(i = 0; i <  rows.length; i++){
											    	
											    		temp = {};
											    	
												    	rectangle = {};
															rectangle.xmin = rows[i].from;
															rectangle.xmax  = rows[i].to;
															rectangle.ymin = 0.0;
															rectangle.ymax = 1;
															rectangle.xminOffset = '0px';
															rectangle.xmaxOffset = '0px';
															rectangle.yminOffset = '0px';
															rectangle.ymaxOffset = '0px';
															
															if(i%2==0)
																rectangle.color = 'rgba(0, 017, 255, 0.25)';
															else
																rectangle.color = 'rgba(100,50,50,.25)';
																
															rectangle.showTooltip = true;
															rectangle.tooltipFormatString = '<h2>-Channel '+rows[i].channel+' [' +rows[i].from +','+rows[i].to+ ']-</h1>';
															
															temp.rectangle = rectangle;
															channels.push(temp);	
											    	}
											    	
														res.render('ocupation',
																{ 
																	data:tablaFinal, 
																	umbral: umbral, 
																	zona:zona, 
																	channels:channels, 
																	allocation:allocation
																});  
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
				});
				objBD.end();  	
	    }
	  });
		objBD.end();
								
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
};

exports.downloadPdfOfChart = function(req, res){
	try {
		check(req.body.zona).notNull();
		check(req.body.umbral).notNull().isNumeric();
		check(req.body.img).notNull();
		
		zona = sanitize(req.body.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		umbral = sanitize(req.body.umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
		
		img = sanitize(req.body.img).xss();
		img = sanitize(img).entityDecode();		
		
		var data = img.replace(/^data:image\/\w+;base64,/, "");
		var buf = new Buffer(data, 'base64');
		
		fs.writeFile('public/downloads/pdf/chart.png', buf, function(err) {
	    if (err) throw err;
	    
	    doc = new PDFDocument({size: 'LEGAL',layout: 'landscape'});
	    doc.fontSize(25);
	    doc.text('Occupation with threshold ' + umbral + ' dBm (' + zona + ')', {align: 'center'});
			doc.image('public/downloads/pdf/chart.png', { width: 850, height: 460});
			doc.write('public/downloads/pdf/occupation.pdf',function(){
				fs.unlink('public/downloads/pdf/chart.png', function(){
				if (err) throw err;
					res.send('0');
				});
			});
	  });
		
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}

exports.downloadPdfOfHeatmap = function(req, res){
	try {
		check(req.body.title).notNull();
		check(req.body.img).notNull();
		
		title = req.body.title;
		title = sanitize(title).entityDecode();		
		
		img = sanitize(req.body.img).xss();
		img = sanitize(img).entityDecode();		
		
		var data = img.replace(/^data:image\/\w+;base64,/, "");
		var buf = new Buffer(data, 'base64');
		
		fs.writeFile('public/downloads/pdf/heatmap.png', buf, function(err) {
	    if (err) throw err;
	    
	    doc = new PDFDocument({size: 'LEGAL',layout: 'landscape'});
	    doc.fontSize(15);
	    doc.text(title, {align: 'center'});
			doc.image('public/downloads/pdf/heatmap.png', { width: 850});
			doc.write('public/downloads/pdf/heatmap.pdf',function(){
				fs.unlink('public/downloads/pdf/heatmap.png', function(){
					if (err) throw err;
					else{
						res.send('0');
					}
				});
			});
	  });
		
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}


exports.selectFrequency = function(req, res){
	try {
		check(req.query.zona).notNull();
		check(req.query.allocation).notNull();
		check(req.query.ipt_umbral).notNull().isNumeric();
		check(req.query.min).notNull().isNumeric();
		check(req.query.max).notNull().isNumeric();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
		
		allocation = sanitize(req.query.allocation).xss();
		allocation = sanitize(allocation).entityDecode();		
		
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		min = sanitize(req.query.min).xss();
		min = sanitize(min).entityDecode();
		
		max = sanitize(req.query.max).xss();
		max = sanitize(max).entityDecode();
		
		res.render('heatmap/select_frequency',{ umbral:umbral, zona:zona, allocation:allocation, min:min, max:max }); 
	
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}

exports.downloadCsvToHeatmap = function(req, res){
	try {
		check(req.body.from).notNull().isNumeric();
	  check(req.body.to).notNull().isNumeric();
	  check(req.body.zona).notNull();
	  check(req.body.umbral).notNull();
		
		zona = sanitize(req.body.zona).trim(); 	
		zona = sanitize(zona).xss();
		zona = sanitize(zona).entityDecode();
		
		from = sanitize(req.body.from).trim(); 	
		from = sanitize(from).xss();
		from = sanitize(from).entityDecode()*1000;
				
		to = sanitize(req.body.to).trim(); 	
		to = sanitize(to).xss();
		to = sanitize(to).entityDecode()*1000;
		
		umbral = sanitize(req.body.umbral).trim(); 	
		umbral = sanitize(umbral).xss();
		umbral = sanitize(umbral).entityDecode();
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +"",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				res.render('index'); 
			}							
	    else {
	    	id_place = rows[0].id_place;
	    	query = "SELECT coordinates.latitude as lat, coordinates.longitude as lng, potency as count FROM (SELECT coordinates_vs_potency_frequency.id_coordinate as id_coordinate, potency_frequency.potency as potency FROM potency_frequency, coordinates_vs_potency_frequency WHERE potency_frequency.id_potency_frequency = coordinates_vs_potency_frequency.id_potency_frequency AND potency_frequency.frequency BETWEEN "+ objBD.escape(from) +" AND "+ objBD.escape(to) +") as aux, coordinates WHERE aux.id_coordinate = coordinates.id_coordinate AND coordinates.id_place = "+ objBD.escape(id_place) +" ORDER BY lat, lng DESC";
		
			  objBD = BD.BD();
				objBD.connect();
				objBD.query(query,
				function(err, rows, fields) {
			    if (err){
			    	console.log(err);
						res.render('index'); 
					}							
			    else {

						if(rows[0]!= undefined){
														
							json2csv({data: rows, fields: ['lat', 'lng', 'count'], fieldNames: ['latitude', 'longitude', 'potencia']}, function(err, csv) {
							  if (err) console.log(err);
								fs.writeFile('public/downloads/csv/myheatmap/myheatmapALL.csv', csv, function(err) {
							    if (err) throw err;
							    console.log('file saved');
							    res.send('0');
							  });							  
							});	
						}
						else
							res.send('1');
				  }
				});
				objBD.end();
	    	
	    }
	  });
		objBD.end();

	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}

exports.formFrequency = function(req, res){
	try {
		
		check(req.query.ipt_umbral).notNull().isNumeric();
		check(req.query.from_frequency).notNull().isNumeric();
		check(req.query.to_frequency).notNull().isNumeric();
		check(req.query.zona).notNull();
		check(req.query.type_heatmap).notNull();		 	
		check(req.query.min).notNull().isNumeric();
		check(req.query.max).notNull().isNumeric();
		check(req.query.min_count).notNull().isNumeric();
		check(req.query.radius).notNull().isNumeric();
		check(req.query.opacity).notNull().isNumeric();
		check(req.query.map_showing_settings).notNull();		 	
		 	
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
		
		from = sanitize(req.query.from_frequency).xss();
		from = sanitize(from).entityDecode()*1000;		

		to = sanitize(req.query.to_frequency).xss();
		to = sanitize(to).entityDecode()*1000;	
		
		typeHeatmap = sanitize(req.query.type_heatmap).xss();
		typeHeatmap = sanitize(typeHeatmap).entityDecode();	
		
		min_frequency = sanitize(req.query.min).xss();
		min_frequency = sanitize(min_frequency).entityDecode();
		
		max_frequency = sanitize(req.query.max).xss();
		max_frequency = sanitize(max_frequency).entityDecode();
		
		min_count = sanitize(req.query.min_count).xss();
		min_count = sanitize(min_count).entityDecode();
		
		radius = sanitize(req.query.radius).xss();
		radius = sanitize(radius).entityDecode();
		
		opacity = sanitize(req.query.opacity).xss();
		opacity = sanitize(opacity).entityDecode();
		
		map_showing_settings = sanitize(req.query.map_showing_settings).xss();
		map_showing_settings = sanitize(map_showing_settings).entityDecode();
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +"",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				res.render('index'); 
			}							
	    else {
	    	id_place = rows[0].id_place;
	    	
	    	var query = null;
	    	if(typeHeatmap == "Max Value"){
		    	query = "SELECT coordinates.latitude as lat, coordinates.longitude as lng, MAX(potency) as count FROM (SELECT coordinates_vs_potency_frequency.id_coordinate as id_coordinate, potency_frequency.potency as potency FROM potency_frequency, coordinates_vs_potency_frequency WHERE potency_frequency.id_potency_frequency = coordinates_vs_potency_frequency.id_potency_frequency AND potency_frequency.frequency BETWEEN "+ objBD.escape(from) +" AND "+ objBD.escape(to) +") as aux, coordinates WHERE aux.id_coordinate = coordinates.id_coordinate AND coordinates.id_place = "+ objBD.escape(id_place) +" GROUP BY latitude, longitude ORDER BY count DESC";
	    	
	    	} else if(typeHeatmap == "Average"){
	    		query = "SELECT coordinates.latitude as lat,coordinates.longitude as lng, AVG(potency)as count FROM (SELECT coordinates_vs_potency_frequency.id_coordinate as id_coordinate, potency_frequency.potency as potency FROM potency_frequency, coordinates_vs_potency_frequency WHERE potency_frequency.id_potency_frequency = coordinates_vs_potency_frequency.id_potency_frequency AND potency_frequency.frequency BETWEEN "+ objBD.escape(from) +" AND "+ objBD.escape(to) +") as aux, coordinates WHERE aux.id_coordinate = coordinates.id_coordinate AND coordinates.id_place = "+ objBD.escape(id_place) +" GROUP BY latitude, longitude ORDER BY count DESC";
	    	}
	    	
	    	objBD = BD.BD();
				objBD.connect();
				objBD.query(query,
				function(err, rows, fields) {
			    if (err){
			    	console.log(err);
						res.render('index'); 
					}							
			    else {
						if(rows[0]!= undefined){
														
							json2csv({data: rows, fields: ['lat', 'lng', 'count'], fieldNames: ['latitude', 'longitude', 'potencia']}, function(err, csv) {
							  if (err) console.log(err);
								fs.writeFile('public/downloads/csv/data/data.csv', csv, function(err) {
							    if (err) throw err;
							    console.log('file saved');
							  });							  
							});	
				    	
				    	max_to_show = rows[0].count;
				    	
							for(i = 0; i < rows.length; i++){
								rows[i].count = (rows[i].count - rows[rows.length - 1 ].count);
								if(rows[i].count == 0)
									rows[i].count = min_count;
							}
							
							max = rows[0].count;
							
							from = (from / 1000);
							to = (to / 1000);
							res.render('heatmap/heatmap', 
								{	umbral:umbral, 
									type:"frequency",
									from:from, 
									to:to, 
									zona:zona, 
									data: rows, 
									max:max, 
									max_to_show:max_to_show, 
									lat:rows[0].lat, 
									lng:rows[0].lng, 
									typeHeatmap:typeHeatmap,
									radius: radius,
									opacity: opacity,
									map_showing_settings: map_showing_settings
								});
						}
						else
							res.render('heatmap/select_frequency',{ umbral:umbral, zona:zona, min:min_frequency, max:max_frequency, error:"Frequency values ​​are not recorded. Do you want to try again?" }); 
				  }
				});
				objBD.end();
		  }
		});
		objBD.end();  	
			
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}



exports.selectChannel = function(req, res){
	try {
		check(req.query.zona).notNull();
		check(req.query.allocation).notNull();
		check(req.query.ipt_umbral).notNull().isNumeric();
		check(req.query.min).notNull().isNumeric();
		check(req.query.max).notNull().isNumeric();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
		
		allocation = sanitize(req.query.allocation).xss();
		allocation = sanitize(allocation).entityDecode();		
		
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		min = sanitize(req.query.min).xss();
		min = sanitize(min).entityDecode();
		
		max = sanitize(req.query.max).xss();
		max = sanitize(max).entityDecode();
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT id_allocation FROM allocation_channels WHERE name = "+ objBD.escape(allocation) +"",
			function(err, rows, fields) {
				if (err)
		    	console.log(err);						
		    else{
			    id_allocation = rows[0].id_allocation;

			    objBD = BD.BD();
					objBD.connect();
					objBD.query("SELECT channels.from,channels.to,channels.channel FROM channels WHERE id_allocation = "+id_allocation+" AND channels.to >= "+ objBD.escape(min) +" AND channels.from <= "+ objBD.escape(max) +"",
						function(err, rows, fields) {
							if (err){
								console.log(err);							
							}
					    else{
						  	res.render('heatmap/select_channel',{ umbral:umbral, zona:zona ,allocation:allocation, channels:rows }); 	
					    }
						});
					objBD.end();	

		    }
			});
		objBD.end();	
	
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}



exports.formChannel = function(req, res){
	try {
		
		check(req.query.ipt_umbral).notNull().isNumeric();
		check(req.query.zona).notNull();
		check(req.query.type_heatmap).notNull();		 	
		check(req.query.channel).notNull();		 	
		check(req.query.min).notNull().isNumeric();
		check(req.query.max).notNull().isNumeric();
		check(req.query.min_count).notNull().isNumeric();
		check(req.query.radius).notNull().isNumeric();
		check(req.query.opacity).notNull().isNumeric();
		check(req.query.map_showing_settings).notNull();		 	
		 	
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
		
		channel = sanitize(req.query.channel).xss();
		channel = sanitize(channel).entityDecode();		

		typeHeatmap = sanitize(req.query.type_heatmap).xss();
		typeHeatmap = sanitize(typeHeatmap).entityDecode();	
		
		min_frequency = sanitize(req.query.min).xss();
		min_frequency = sanitize(min_frequency).entityDecode();
		
		max_frequency = sanitize(req.query.max).xss();
		max_frequency = sanitize(max_frequency).entityDecode();
		
		channel = channel.substring(1, channel.length);
		channel = channel.substring(0, channel.length -1);
		channel = channel.split("),(");
		
		min_count = sanitize(req.query.min_count).xss();
		min_count = sanitize(min_count).entityDecode();
		
		radius = sanitize(req.query.radius).xss();
		radius = sanitize(radius).entityDecode();
		
		opacity = sanitize(req.query.opacity).xss();
		opacity = sanitize(opacity).entityDecode();
		
		map_showing_settings = sanitize(req.query.map_showing_settings).xss();
		map_showing_settings = sanitize(map_showing_settings).entityDecode();
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +"",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				res.render('index'); 
			}							
	    else {
	    	id_place = rows[0].id_place;
	    	
	    	channel1 = channel[0].split(",");
	    	var query = null;
	    	if(typeHeatmap == "Max Value"){
		    	query = "SELECT coordinates.latitude as lat, coordinates.longitude as lng, MAX(potency) as count FROM (SELECT coordinates_vs_potency_frequency.id_coordinate as id_coordinate, potency_frequency.potency as potency FROM (";
	    	
	    	} else if(typeHeatmap == "Average"){
	    		query = "SELECT coordinates.latitude as lat, coordinates.longitude as lng, AVG(potency) as count FROM (SELECT coordinates_vs_potency_frequency.id_coordinate as id_coordinate, potency_frequency.potency as potency FROM (";
	    	}
	    	
	    	query = query + "SELECT * FROM potency_frequency WHERE frequency BETWEEN "+ objBD.escape(channel1[0]*1000) +" AND "+ objBD.escape(channel1[1]*1000) +""
	    			
				for(i = 1; i < channel.length; i++){
					channelAux = channel[i].split(",");
					query = query + " UNION SELECT * FROM potency_frequency WHERE frequency BETWEEN "+ objBD.escape(channelAux[0]*1000) +" AND "+ objBD.escape(channelAux[1]*1000) +""
				}
				
				query = query + ") as potency_frequency, coordinates_vs_potency_frequency WHERE potency_frequency.id_potency_frequency = coordinates_vs_potency_frequency.id_potency_frequency) as aux, coordinates WHERE aux.id_coordinate = coordinates.id_coordinate AND coordinates.id_place = "+ objBD.escape(id_place) +" GROUP BY latitude, longitude ORDER BY count DESC";
				
	    	objBD = BD.BD();
				objBD.connect();
				objBD.query(query,
				function(err, rows, fields) {
			    if (err){
			    	console.log(err);
						res.render('index'); 
					}							
			    else {
						if(rows[0]!= undefined){
														
							json2csv({data: rows, fields: ['lat', 'lng', 'count'], fieldNames: ['latitude', 'longitude', 'potencia']}, function(err, csv) {
							  if (err) console.log(err);
								fs.writeFile('public/downloads/csv/data/data.csv', csv, function(err) {
							    if (err) throw err;
							    console.log('file saved');
							  });							  
							});	
				    	
				    	max_to_show = rows[0].count;
				    	
							for(i = 0; i < rows.length; i++){
								rows[i].count = (rows[i].count - rows[rows.length - 1 ].count);
								if(rows[i].count == 0)
									rows[i].count = min_count;
							}
							
							max = rows[0].count;
							res.render('heatmap/heatmap', 
								{	umbral:umbral, 
									type:"channel", 
									zona:zona, 
									data: rows, 
									max:max, 
									max_to_show:max_to_show, 
									lat:rows[0].lat, 
									lng:rows[0].lng, 
									typeHeatmap:typeHeatmap,
									radius: radius,
									opacity: opacity,
									map_showing_settings: map_showing_settings
								});
						}
						else
							res.render('heatmap/select_channel',{ umbral:umbral, zona:zona, min:min_frequency, max:max_frequency, error:"Frequency values ​​are not recorded. Do you want to try again?" }); 
				  }
				});
				objBD.end();
		  }
		});
		objBD.end();	
			
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
}




exports.loginSend = function(req, res){

	try {
	  check(req.body.login_user).notNull().len(6, 64).isEmail();
	  check(req.body.login_pass).notNull();
		
		login_user = sanitize(req.body.login_user).trim(); 	
		login_user = sanitize(login_user).xss();
		login_user = sanitize(login_user).entityDecode();
				
		pass = sanitize(req.body.login_pass).trim(); 	
		pass = sanitize(pass).xss();
		pass = sanitize(pass).entityDecode();
		
		pass= crypto.createHash('sha256').update(pass).digest("hex");
		pass= pass.substr(0,1)+"u"+pass.substr(2,pass.length/2)+"se"+pass.substr(pass.length/2)+"r";
				
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT email FROM user WHERE email = "+ objBD.escape(login_user) +" AND password = "+ objBD.escape(pass) +"",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				res.send('1'); 
			}							
	    else {
		    if (rows.length == 1){
		    	req.session.user = login_user;
		    	res.send('/admin');
				}
				else
					res.send('1');
			}
		});
		objBD.end();  	
								
	} catch (e) {
	  res.send('1'); 
	  console.log(e.message);
	}
}

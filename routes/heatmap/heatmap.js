var check = require('validator').check
	, sanitize = require('validator').sanitize
	, BD = require('../../BD')
	, json2csv = require('json2csv')
	, fs = require('fs')
	, PDFDocument = require('pdfkit');

/*--------------------------------------------------------------------------------------------------------------*/
exports.showWhenSelectFrequency = function(req, res){
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
		var query = null;
    	if(typeHeatmap == "Max Value")
    		query = "SELECT aux2.lat, aux2.lng, MAX(potency_frequency.potency) as count FROM (SELECT coordinates.latitude as lat, coordinates.longitude as lng, coordinates.id_coordinate FROM (SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +") as aux, coordinates WHERE coordinates.id_place = aux.id_place) as aux2, potency_frequency WHERE potency_frequency.id_coordinate = aux2.id_coordinate AND potency_frequency.frequency BETWEEN "+ objBD.escape(from) +" AND "+ objBD.escape(to) +" GROUP BY lat , lng ORDER BY count DESC";
    	else if(typeHeatmap == "Average")
    		query = "SELECT aux2.lat, aux2.lng, AVG(potency_frequency.potency) as count FROM (SELECT coordinates.latitude as lat, coordinates.longitude as lng, coordinates.id_coordinate FROM (SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +") as aux, coordinates WHERE coordinates.id_place = aux.id_place) as aux2, potency_frequency WHERE potency_frequency.id_coordinate = aux2.id_coordinate AND potency_frequency.frequency BETWEEN "+ objBD.escape(from) +" AND "+ objBD.escape(to) +" GROUP BY lat , lng ORDER BY count DESC";
    	
		objBD.query(query,
			function(err, rows, fields) {
				objBD.end();
	    		if (err){
	    			console.log(err);
					res.render('index'); 
				}							
	    		else {
	    			if(rows[0]!= undefined){
					
						json2csv({data: rows, fields: ['lat', 'lng', 'count'], fieldNames: ['latitude', 'longitude', 'potencia']}, 
							function(err, csv) {
							  if (err) console.log(err);
								fs.writeFile('public/downloads/csv/data/data.csv', csv, function(err) {
							    if (err) 
							    	throw err;
							    console.log('file saved');
							  });							  
							}
						);	
				    	
				    	max_to_show = rows[0].count;
				    	
						for(i = 0; i < rows.length; i++){
							rows[i].count = (rows[i].count - rows[rows.length - 1 ].count);
							if(rows[i].count == 0)
								rows[i].count = parseInt(min_count);
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
							}
						);
					
					} else
						res.render('selectFrequency/selectFrequency',{ umbral:umbral, zona:zona, min:min_frequency, max:max_frequency, error:"Frequency values ​​are not recorded. Do you want to try again?" }); 
				}
			}
		);
			
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.showWhenSelectChannel = function(req, res){
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
		
		channelsToShow = channel.replace(/,/g , "-");
		channelsToShow = channelsToShow.split(")-(");
		channelsToShow = "[" + channelsToShow.toString() + "] MHz";
		
		channel = channel.split("),(");
		
		min_count = sanitize(req.query.min_count).xss();
		min_count = sanitize(min_count).entityDecode();
		
		radius = sanitize(req.query.radius).xss();
		radius = sanitize(radius).entityDecode();
		
		opacity = sanitize(req.query.opacity).xss();
		opacity = sanitize(opacity).entityDecode();
		
		map_showing_settings = sanitize(req.query.map_showing_settings).xss();
		map_showing_settings = sanitize(map_showing_settings).entityDecode();

		channel1 = channel[0].split(",");

		objBD = BD.BD();
		objBD.connect();
    	var query = null;
    	if(typeHeatmap == "Max Value"){
    		query = "SELECT aux2.lat, aux2.lng, MAX(potency_frequency.potency) as count FROM (SELECT coordinates.latitude as lat, coordinates.longitude as lng, coordinates.id_coordinate FROM (SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +") as aux, coordinates WHERE coordinates.id_place = aux.id_place) as aux2, potency_frequency WHERE potency_frequency.id_coordinate = aux2.id_coordinate AND potency_frequency.frequency BETWEEN "+ objBD.escape(channel1[0]*1000) +" AND "+ objBD.escape(channel1[1]*1000) +" ";
    		if (channel > 1) {
	    		for(i = 1; i < channel.length; i++){
					channelAux = channel[i].split(",");
					query = query + "SELECT aux2.lat, aux2.lng, MAX(potency_frequency.potency) as count FROM (SELECT coordinates.latitude as lat, coordinates.longitude as lng, coordinates.id_coordinate FROM (SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +") as aux, coordinates WHERE coordinates.id_place = aux.id_place) as aux2, potency_frequency WHERE potency_frequency.id_coordinate = aux2.id_coordinate AND potency_frequency.frequency BETWEEN "+ objBD.escape(channelAux[0]*1000) +" AND "+ objBD.escape(channelAux[1]*1000) +" ";
				}
	    	} 
	    	query = query + "GROUP BY lat , lng ORDER BY count DESC";
    	
    	} else if(typeHeatmap == "Average") {
    		query = "SELECT aux2.lat, aux2.lng, AVG(potency_frequency.potency) as count FROM (SELECT coordinates.latitude as lat, coordinates.longitude as lng, coordinates.id_coordinate FROM (SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +") as aux, coordinates WHERE coordinates.id_place = aux.id_place) as aux2, potency_frequency WHERE potency_frequency.id_coordinate = aux2.id_coordinate AND potency_frequency.frequency BETWEEN "+ objBD.escape(channel1[0]*1000) +" AND "+ objBD.escape(channel1[1]*1000) +" ";
    		if (channel > 1) {
	    		for(i = 1; i < channel.length; i++){
					channelAux = channel[i].split(",");
					query = query + "SELECT aux2.lat, aux2.lng, AVG(potency_frequency.potency) as count FROM (SELECT coordinates.latitude as lat, coordinates.longitude as lng, coordinates.id_coordinate FROM (SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +") as aux, coordinates WHERE coordinates.id_place = aux.id_place) as aux2, potency_frequency WHERE potency_frequency.id_coordinate = aux2.id_coordinate AND potency_frequency.frequency BETWEEN "+ objBD.escape(channelAux[0]*1000) +" AND "+ objBD.escape(channelAux[1]*1000) +" ";
				}
	    	} 
	    	query = query + "GROUP BY lat , lng ORDER BY count DESC";
    		
    	}
    	
		objBD.query(query,
			function(err, rows, fields) {
				objBD.end();
		    	if (err){
		    		console.log(err);
					res.render('index'); 
				
				} else {
					if(rows[0]!= undefined){
						
						json2csv({data: rows, fields: ['lat', 'lng', 'count'], fieldNames: ['latitude', 'longitude', 'potencia']}, 
							function(err, csv) {
							  if (err) console.log(err);
								fs.writeFile('public/downloads/csv/data/data.csv', csv, function(err) {
							    if (err) 
							    	throw err;
							    console.log('file saved');
							  });							  
							}
						);									
												    	
					    max_to_show = rows[0].count;
					    for(i = 0; i < rows.length; i++){
							rows[i].count = (rows[i].count - rows[rows.length - 1 ].count);
							if(rows[i].count == 0)
								rows[i].count = parseInt(min_count);
						}
						max = rows[0].count;
								
						res.render('heatmap/heatmap', 
							{	umbral:umbral, 
								type:"channel", 
								channelsToShow: channelsToShow,
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
							}
						);
					
					} else
						res.render('index'); 
				}
			}
		);
			
	} catch (e) {
	  	res.render('index'); 
	  	console.log(e.message);
	}
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.generatePdfOfHeatmap = function(req, res){
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
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.downloadPdfOfHeatmap = function(req, res){
	res.download('public/downloads/pdf/heatmap.pdf');
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.downloadCsvOfHeatmap = function(req, res){
	res.download('public/downloads/csv/data/data.csv');
};










var heatmap = require('../heatmap/heatmap')
	, check = require('validator').check
	, sanitize = require('validator').sanitize
	, BD = require('../../BD')
	, json2csv = require('json2csv')
	, fs = require('fs');

/*--------------------------------------------------------------------------------------------------------------*/
exports.show = function(req, res){
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
		
		res.render('selectFrequency/selectFrequency',{ umbral:umbral, zona:zona, allocation:allocation, min:min, max:max }); 
		
	} catch (e) {
		res.render('index'); 
	  	console.log(e.message);
	}
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.generateCsvToHeatmap = function(req, res){
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
		query = "SELECT aux2.lat, aux2.lng, potency_frequency.potency as count FROM (SELECT coordinates.latitude as lat, coordinates.longitude as lng, coordinates.id_coordinate FROM (SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +") as aux, coordinates WHERE coordinates.id_place = aux.id_place) as aux2, potency_frequency WHERE potency_frequency.id_coordinate = aux2.id_coordinate AND potency_frequency.frequency BETWEEN "+ objBD.escape(from) +" AND "+ objBD.escape(to) +" ORDER BY lat , lng DESC";
		objBD.query(query,
			function(err, rows, fields) {
				objBD.end();
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
							}
						);	
					
					} else
						res.send('1');
				}
			}
		);
	} catch (e) {
	  	res.render('index'); 
	  	console.log(e.message);
	}
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.downloadCsvToHeatmap = function(req, res){
	res.download('public/downloads/csv/myheatmap/myheatmapALL.csv'); 
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.callHeatmap = function(req, res){
	heatmap.showWhenSelectFrequency(req, res);
};





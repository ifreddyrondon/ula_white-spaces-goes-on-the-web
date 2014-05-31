var heatmap = require('../heatmap/heatmap')
	, check = require('validator').check
	, sanitize = require('validator').sanitize
	, BD = require('../../BD');

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
		
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT id_allocation FROM allocation_channels WHERE name = "+ objBD.escape(allocation) +"",
			function(err, rows, fields) {
				if (err){
					objBD.end();
					console.log(err);
				
				} else{
			    	id_allocation = rows[0].id_allocation;
					objBD.query("SELECT channels.from,channels.to,channels.channel FROM channels WHERE id_allocation = "+id_allocation+" AND channels.to >= "+ objBD.escape(min) +" AND channels.from <= "+ objBD.escape(max) +"",
						function(err, rows, fields) {
							objBD.end();
							if (err)
								console.log(err);							
					    	else
						  		res.render('selectChannel/selectChannel',{ umbral:umbral, zona:zona ,allocation:allocation, channels:rows }); 	
						}
					);
				}
			}
		);
	} catch (e) {
	  res.render('index'); 
	  console.log(e.message);
	}
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.callHeatmap = function(req, res){
	heatmap.showWhenSelectChannel(req, res);
};









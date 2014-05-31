var selectFrequency = require('../selectFrequency/selectFrequency')
	, selectChannel = require('../selectChannel/selectChannel')
	, check = require('validator').check
	, sanitize = require('validator').sanitize
	, BD = require('../../BD')
	, fs = require('fs')
	, PDFDocument = require('pdfkit');

/*--------------------------------------------------------------------------------------------------------------*/
exports.show = function(req, res){
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
		query = "SELECT frequency / 1000 as frequency, SUM(CASE WHEN potency > "+ objBD.escape(umbral) +" THEN 1 ELSE 0 END) / COUNT(*) AS total FROM (SELECT coordinates.id_coordinate as id_coordinate FROM (SELECT id_place FROM places WHERE name = "+ objBD.escape(zona) +") as aux, coordinates WHERE coordinates.id_place = aux.id_place) as aux2, potency_frequency WHERE aux2.id_coordinate = potency_frequency.id_coordinate GROUP BY frequency";
		objBD.query(query,
			function(err,rows,fields){
				if (err) {
					objBD.end();
	    			console.log(err);
					res.render('index'); 
				} else if (rows.length == 0){
					objBD.end();
					res.render('occupation/occupation',{ error:"There are no data in the area '"+zona+"'" });
				
				} else {
					var tablaFinal = [];
					for(i = 0; i <  rows.length; i++)
						tablaFinal.push([rows[i].frequency,rows[i].total]);

					query = "SELECT channels.from, channels.to, channels.channel FROM (SELECT id_allocation FROM allocation_channels WHERE name = "+ objBD.escape(allocation) +") as aux, channels WHERE channels.id_allocation = aux.id_allocation";
					objBD.query(query,
						function(err,rows,fields){
							objBD.end();
							if (err){
				    			console.log(err);
								res.render('index'); 
							
							} else {
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
								res.render('occupation/occupation',
								{ 
									data:tablaFinal, 
									umbral: umbral, 
									zona:zona, 
									channels:channels, 
									allocation:allocation
								});
							}
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
exports.generatePdfOfChart = function(req, res){
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
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.downloadPdfOfChart = function(req, res){
	res.download('public/downloads/pdf/occupation.pdf');
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.callSelectFrequency = function(req, res){
	selectFrequency.show(req, res);
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.callSelectChannel = function(req, res){
	selectChannel.show(req, res);
};









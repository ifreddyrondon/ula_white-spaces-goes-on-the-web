var BD = require('../BD')
	, sanitize = require('validator').sanitize
	, check = require('validator').check
	, crypto = require('crypto');

/*
 * GET users listing.
 */

exports.ocupation = function(req, res){
	try {
		check(req.query.zona).notNull();
		check(req.query.ipt_umbral).notNull().isNumeric();
		 	
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
		
		umbral = sanitize(req.query.ipt_umbral).xss();
		umbral = sanitize(umbral).entityDecode();		
				
		// Buscamos el identificador de la zona
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT frequency, COUNT(*) AS total FROM potency_frequency GROUP BY frequency",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				res.render('index'); 
			}							
	    else {
	    	var resultado = new Array();
	    	var totales = rows;
				objBD = BD.BD();
				objBD.connect();
				objBD.query("SELECT frequency, COUNT(*) AS pasaron_umbral FROM potency_frequency WHERE potency > "+ objBD.escape(umbral) +" GROUP BY frequency ",
				function(err, rows, fields) {
			    if (err){
			    	console.log(err);
						res.render('index'); 
					}							
			    else {

			    	var pasaron = rows;
			    	var tablaFinal = new Array();
			    	
						for(i=0; i < totales.length; i++){
							
							for(j=0; j < pasaron.length; j++){
								
								if(totales[i].frequency == pasaron[j].frequency){
									tablaFinal.push([totales[i].frequency, pasaron[j].pasaron_umbral / totales[i].total]);
									break;
								} 
								else if(totales[i].frequency < pasaron[j].frequency){
									tablaFinal.push([totales[i].frequency, 0]);
									break;
								}
							}	
						}
						res.render('ocupation',{ data:tablaFinal }); 
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

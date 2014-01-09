var BD = require('../BD')
	, sanitize = require('validator').sanitize
	, check = require('validator').check
	, crypto = require('crypto');

/*
 * GET users listing.
 */

exports.choices = function(req, res){
	try {
		check(req.query.zona).notNull();
		check(req.query.frecuencia).notNull();
		 	
		zona = sanitize(req.query.zona).xss();
		zona = sanitize(zona).entityDecode();
				
		frecuencia = sanitize(req.query.frecuencia).trim(); 	
		frecuencia = sanitize(frecuencia).xss();
		frecuencia = sanitize(frecuencia).entityDecode();
	
		zona = zona.toUpperCase();
		res.render('heatmap',{ zona:zona, frecuencia:frecuencia }); 
								
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
				objBD.end();
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
								
	} catch (e) {
	  res.send('1'); 
	  console.log(e.message);
	}
}

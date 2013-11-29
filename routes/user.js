var sanitize = require('validator').sanitize
	, check = require('validator').check
	, crypto = require('crypto');

/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
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
		
		console.log(login_user);
		console.log(pass);
		
		/*
		objBD = BD.BD();
		objBD.connect();
		objBD.query("SELECT id_persona, nombre, tipo FROM persona WHERE email = "+ objBD.escape(login_user) +" AND password = "+ objBD.escape(pass) +"",
		function(err, rows, fields) {
	    if (err){
	    	console.log(err);
				objBD.end();
				res.send('1'); 
			}							
	    else {
		    if (rows.length == 1){
					var user = {
	        	id: rows[0]['id_persona'],
	        	nombre: rows[0]['nombre'],
	        	tipo: rows[0]['tipo'],
	        };
	        req.session.regenerate(function(){
			      req.session.user = user;
			      res.send('/');
		      });
		      objBD.end();
				}
				else
					res.send('1');
			}  
		});	
		
		*/						
	} catch (e) {
	  res.send('1'); 
	  console.log(e.message);
	}
}

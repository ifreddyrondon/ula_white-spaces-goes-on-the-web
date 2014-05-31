var BD = require('../../BD')
	, sanitize = require('validator').sanitize
	, check = require('validator').check
	, crypto = require('crypto');

/*--------------------------------------------------------------------------------------------------------------*/
exports.show = function(req, res){
	res.render('editAccount/editAccount',{ email:req.session.user});
};

/*--------------------------------------------------------------------------------------------------------------*/
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

/*--------------------------------------------------------------------------------------------------------------*/
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


var admin = require('../admin/admin');

/*--------------------------------------------------------------------------------------------------------------*/
exports.show = function(req, res){
	res.render('login/login');
};

/*--------------------------------------------------------------------------------------------------------------*/
exports.callLoginCheck = function(req, res){
	admin.login(req, res);
};

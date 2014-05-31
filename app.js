
/**
 * Module dependencies.
 */

var express = require('express')
	, http = require('http')
	, path = require('path')
	, fs = require('fs')
	, BD = require('./BD')
	, index = require('./routes/index')
	, occupation = require('./routes/occupation/occupation')
	, selectFrequency = require('./routes/selectFrequency/selectFrequency')
	, selectChannel = require('./routes/selectChannel/selectChannel')
	, heatmap = require('./routes/heatmap/heatmap')
	, whiteSpaces = require('./routes/whiteSpaces/whiteSpaces')
	, login = require('./routes/login/login')
	, admin = require('./routes/admin/admin')
	, editAccount = require('./routes/editAccount/editAccount')
	, editZone = require('./routes/editZone/editZone');

/*--------------------------------------------------------------------------------------------------------------*/
var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
 	app.use(express.errorHandler());
});

/*--------------------------------------------------------------------------------------------------------------*/
function pass(req, res, next){
	if(req.session.user)
		next();
	else 
		res.redirect('/login');
}

/* USER---------------------------------------------------------------------------------------------------------*/
// index
app.get('/', index.index);

// occupation
app.get('/ocupation', occupation.show);
app.post('/generate-pdf-of-chart', occupation.generatePdfOfChart);
app.get('/download-pdf-of-chart', occupation.downloadPdfOfChart);
app.get('/select_frequency', occupation.callSelectFrequency);
app.get('/select_channel', occupation.callSelectChannel);

// select frequency
app.post('/generate-csv-to-myheatmap', selectFrequency.generateCsvToHeatmap);
app.get('/dowload-csv-to-myheatmap', selectFrequency.downloadCsvToHeatmap);
app.get('/form_select_frequency', selectFrequency.callHeatmap);

// select channel
app.get('/form_select_channel', selectChannel.callHeatmap);

// heatmap
app.post('/generate-pdf-of-heatmap', heatmap.generatePdfOfHeatmap);
app.get('/download-pdf-of-heatmap', heatmap.downloadPdfOfHeatmap);
app.get('/download-csv-data', heatmap.downloadCsvOfHeatmap);

// white spaces
app.get('/white_spaces', whiteSpaces.show);

/* ADMIN--------------------------------------------------------------------------------------------------------*/
// login
app.get('/login', login.show);
app.post('/loginSend', login.callLoginCheck);

// admin
app.get('/logout', pass, admin.logout);
app.get('/admin', pass, admin.show);
app.post('/sync/upload', pass, admin.syncUpload);
app.get('/edit_account', admin.callEditAccount);
app.get('/edit_zones', admin.callEditZone);

// edit account
app.post('/edit_account_email',pass, editAccount.editEmail);
app.post('/edit_account_password',pass, editAccount.editPassword);

// edit zone
app.post('/edit_zone_name', pass, editZone.editZoneName);
app.post('/delete_zone', pass, editZone.deleteZone);


/*--------------------------------------------------------------------------------------------------------------*/
http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

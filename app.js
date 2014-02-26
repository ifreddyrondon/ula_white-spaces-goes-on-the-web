
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , admin = require('./routes/admin')
  , http = require('http')
  , path = require('path')
  , BD = require('./BD');

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

function login(req, res, next){
	if(req.session.user)
		next();
	else 
		res.redirect('/login');
}

/*-------------------------------------*/
app.get('/', function(req,res){ 
	objBD = BD.BD();
	objBD.connect();
	objBD.query("SELECT name FROM places",
		function(err, rows, fields) {
			if (err)
	    	console.log(err);						
	    else{
		    places = rows;
		    objBD = BD.BD();
				objBD.connect();
				objBD.query("SELECT name FROM allocation_channels",
					function(err, rows, fields) {
						if (err)
				    	console.log(err);						
				    else{
					  	allocations = rows;
							res.render('index',{ sesion: req.session.user, places : places, allocations:allocations } );  
				    }
					});
				objBD.end();	
	    }
		});
	objBD.end();	
});

app.get('/white_spaces', function(req,res){ 
	res.render('que_son_white_spaces'); 
});

app.get('/ocupation', user.ocupation);
app.get('/select_frequency', user.selectFrequency);
app.get('/select_channel', user.selectChannel);

app.get('/form_select_frequency', user.formFrequency);

app.post('/generate-csv-to-myheatmap', user.downloadCsvToHeatmap);
app.get('/dowload-csv-to-myheatmap', function(req, res){
  res.download('public/downloads/csv/myheatmap/myheatmapALL.csv'); 
});

app.post('/generate-pdf-of-chart', user.downloadPdfOfChart);
app.get('/download-pdf-of-chart', function(req, res){
  res.download('public/downloads/pdf/occupation.pdf'); 
});

app.post('/generate-pdf-of-heatmap', user.downloadPdfOfHeatmap);
app.get('/download-pdf-of-heatmap', function(req, res){
  res.download('public/downloads/pdf/heatmap.pdf'); 
});

app.get('/download-csv-data', function(req, res){
  res.download('public/downloads/csv/data/data.csv'); 
});
/*-------------------------------------*/

app.get('/login', function(req,res){ 
	res.render('login'); 
});

app.post('/loginSend', user.loginSend);

app.get('/logout', login, function(req,res){
	if (req.session.user){
		delete req.session.user;
		res.redirect('/');
	}
});

/*-------------------------------------*/

app.get('/admin', login, function(req, res){
	objBD = BD.BD();
	objBD.connect();
	objBD.query("SELECT name FROM places",
		function(err, rows, fields) {
			if (err)
	    	console.log(err);						
	    else
	    	places = rows;
		  
		  res.render('admin/admin', {places : places}); 
		});
	objBD.end();
});

app.get('/edit_zones', login, function(req, res){
	objBD = BD.BD();
	objBD.connect();
	objBD.query("SELECT name FROM places",
		function(err, rows, fields) {
			if (err)
	    	console.log(err);						
	    else
	    	places = rows;
		  
		  res.render('admin/edit_zones', {places : places}); 
		});
	objBD.end();
});

app.post('/edit_zone_name', login, admin.editZoneName);

app.post('/delete_zone', login, admin.deleteZone);

app.post('/sync/upload', login, admin.syncUpload);

/*-------------------------------------*/


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

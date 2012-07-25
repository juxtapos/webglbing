var querystring = require('querystring'),
	http = require('http'),
	connect = require('connect');
var BING_KEY = 'ApBkl0QnxcxTmp0Ss4vcokdWZrUF-fcrUCsrQzNCEkpyqIvFke5KJCSzQewb3Iu3';

    var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('../web'))
  .use(function(req, res){
    //res.writeHead(200, { 'Content-Type': 'text/plain' });
	if (!~req.url.indexOf('/bing')) {
		res.end();
		return;
	}
  	var params = querystring.parse(req.url.substring(req.url.lastIndexOf('?') + 1));

	var centerX = params.centerX, 
		centerY = params.centerY,
		zoom = params.zoom || '';
		mapsizeX = params.mapsizeX || 200,
		mapsizeY = params.mapsizeY || 200;

  		host = 'dev.virtualearth.net';
  		centerStr = params.centerX && params.centerY ? params.centerY + ',' + params.centerX + '/' : '';
  		sizeStr = params.mapsizeX && params.mapsizeY ? 'mapSize=' + params.mapsizeX  + ',' + params.mapsizeY + '&' : '';

  		areaStr = params.areaSouth && params.areaWest && params.areaNorth &&  params.areaEast ? 
  					'mapArea=' + params.areaSouth + ',' +  params.areaWest + ',' +  params.areaNorth + ',' +  params.areaEast  + '&' : '';
  		path = '/REST/v1/Imagery/Map/Aerial/' + centerStr + zoom + '?' + sizeStr + areaStr + '&key=' + BING_KEY;
  	console.log(host+path);
  	var request = http.get({
	  	host: host,
	  	path: path
	  	}, function (rest) {
	  		res.setHeader('Content-Type', rest.headers['content-type']);
	  		res.setHeader('Access-Control-Allow-Origin', '*');
		  	rest.on('data', function (chunk) {
		    	res.write(chunk);
		  	});
		  	rest.on('end', function () {
		  		res.end();
		  	});
	  	
	  }
	);
  })
 .listen(3000);

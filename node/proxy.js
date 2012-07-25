var BING_KEY = 'ApBkl0QnxcxTmp0Ss4vcokdWZrUF-fcrUCsrQzNCEkpyqIvFke5KJCSzQewb3Iu3',
	PROXY = '10.86.48.103', //'http://dewdfwdf03proxy.wdf.sap.corp:8080'
	PROXY_PORT = 8080,
	BING_HOST = 'http://dev.virtualearth.net';

var querystring = require('querystring'),
	http = require('http'),
	connect = require('connect'),
    app = connect()
  		.use(connect.logger('dev'))
  		.use(connect.static('../web'))
	 	.use(function(req, res){
			if (!~req.url.indexOf('/bing')) {
				res.end();
				return;
			}
  			var params = querystring.parse(req.url.substring(req.url.lastIndexOf('?') + 1)),
  				centerX = params.centerX, 
				centerY = params.centerY,
				zoom = params.zoom || '',
				mapsizeX = params.mapsizeX || 256,
				mapsizeY = params.mapsizeY || 256,
				centerStr = params.centerX && params.centerY ? params.centerY + ',' + params.centerX + '/' : '',
  				sizeStr = params.mapsizeX && params.mapsizeY ? 'mapSize=' + params.mapsizeX  + ',' + params.mapsizeY + '&' : '',
  				areaStr = params.areaSouth && params.areaWest && params.areaNorth &&  params.areaEast ? 'mapArea=' + params.areaSouth + ',' +  params.areaWest + ',' +  params.areaNorth + ',' +  params.areaEast  + '&' : '',
  				host, 
  				port,
  				path = '/REST/v1/Imagery/Map/Road/' + centerStr + zoom + '?' + sizeStr + areaStr + '&key=' + BING_KEY;

  			if (PROXY && PROXY_PORT) {
  				host = PROXY;
  				port = 8080;
  				path = BING_HOST + path;
  			} else {
  				host = BING_HOST;
  				port = 80;
  				
  			}

		  	var request = http.get({
			 	host: host,
			  	port: port,
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
  }).listen(3000);
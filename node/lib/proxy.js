//var PROXY = '10.86.48.103', //'http://dewdfwdf03proxy.wdf.sap.corp:8080'
//var PROXY_PORT = 8080;

var querystring = require('querystring'),
	http = require('http'),
	connect = require('connect'),
    app = connect()
  		.use(connect.logger('dev'))
  		.use(connect.static('../web'))
	 	.use(function(req, res){
	 		var params = querystring.parse(req.url.substring(req.url.lastIndexOf('?') + 1));
			if (req.url.indexOf('/comp') == 0) {
				host = 'ecn.dynamic.t0.tiles.virtualearth.net';
				console.log(params);
				path =  '/comp/CompositionHandler/' + params['quadkey'] +'?mkt=en-us&it=' + params['flags'] + '&shading=hill&n=z';
				port = 80;
			} else if (req.url.indexOf('/bing') == 0) {
	  		// 	var centerX = params.centerX,
					// centerY = params.centerY,
					// zoom = params.zoom || '',
					// mapsizeX = params.mapsizeX || 256,
					// mapsizeY = params.mapsizeY || 256,
					// centerStr = params.centerX && params.centerY ? params.centerY + ',' + params.centerX + '/' : '',
	  		// 		sizeStr = params.mapsizeX && params.mapsizeY ? 'mapSize=' + params.mapsizeX  + ',' + params.mapsizeY + '&' : '',
	  		// 		areaStr = params.areaSouth && params.areaWest && params.areaNorth &&  params.areaEast ? 'mapArea=' + params.areaSouth + ',' +  params.areaWest + ',' +  params.areaNorth + ',' +  params.areaEast  + '&' : '',
	  		// 		host = 'http://dev.virtualearth.net', 
	  		// 		port = 80,
	  		// 		path = '/REST/v1/Imagery/Map/Road/' + centerStr + zoom + '?' + sizeStr + areaStr + '&key=' + BING_KEY;
	  		} else {
	  			res.end();
	  			return;
	  		}

  		  	if (typeof PROXY != 'undefined' && typeof PROXY_PORT != 'undefined') {
  		  		path = 'http://' + host + path;
  				host = PROXY;
  				port = 8080;
  				path = BING_HOST + path;
  			}

	  		// console.log('host:' + host);
	  		// console.log('path:' + path);
	  		// console.log('port:' + port);

	  		// XXX Set correct host on proxy

		  	var request = http.get({
			 	host: host,
			  	port: port,
			  	path: path,
			  	//headers: headers
			  	}, function (rest) {
			  		//console.log(rest.headers);
			  		//res.setHeader('Content-Type', rest.headers['content-type']);
			  		res.setHeader('Content-Type', 'image/png');
			  		// The CORS header does *not* make the image 'untainted' (for raw image data access on the canvas).
			  		//  That's the whole reason I'm abusing connect as a static webserver.
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

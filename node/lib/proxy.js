var LISTEN_PORT = 3000;
var PROXY = '10.86.48.103';
var PROXY_PORT = 8080;

var routes = {
	'/comp': bingQuadKeyRequest,
	'/bing': bingStaticMapRequest,
	'/finfact': finfact
};

var querystring = require('querystring'),
	http = require('http'),
	connect = require('connect'),
    app = connect()
  		.use(connect.logger('dev'))
  		.use(connect.static('../web'))
	 	.use(dispatcher).listen(LISTEN_PORT);

function dispatcher (req, res) {
	var handlerFct = gethandler(req);
	var opts;

	if (!handlerFct) {
		console.error('No request handler found for url ' + req.url);
		return;
	}
	opts = handlerFct(req);
	
	// Detect proxy
  	if (typeof PROXY != 'undefined' && typeof PROXY_PORT != 'undefined') {
  		opts.path = 'http://' + opts.host + opts.path;
		opts.port = PROXY_PORT;
		opts.headers = {
			'Host': opts.host
		}
		opts.host = PROXY;
	}

	//console.log(JSON.stringify(opts));

  	var request = http.get(opts, 
  		function (response) {
  			// Copy destination response headers
  			for (var headerkey in response.headers) {
  				res.setHeader(headerkey, response.headers[headerkey]);
  			}
		  	response.on('data', function (chunk) {
		    	res.write(chunk);
		  	});
		  	response.on('end', function () {
		  		res.end();
		  	});
	  	});
}

function gethandler (request) {
	var url = request.url;
	for (var r in routes) {
		if (~url.indexOf(r)) {
			return routes[r];
		}
	}
}

function bingQuadKeyRequest (request) {
	var VIRTUALEARTH_HOST = 'ecn.dynamic.t0.tiles.virtualearth.net';
	var params = querystring.parse(request.url.substring(request.url.lastIndexOf('?') + 1));
	return {
		host: VIRTUALEARTH_HOST,
		path: '/comp/CompositionHandler/' + params['quadkey'] +'?mkt=en-us&it=' + params['flags'] + '&shading=hill&n=z',
		port: 80
	}
}

function bingStaticMapRequest (request) {
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
}

function finfact () {}
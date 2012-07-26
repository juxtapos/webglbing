var BING_KEY = 'ApBkl0QnxcxTmp0Ss4vcokdWZrUF-fcrUCsrQzNCEkpyqIvFke5KJCSzQewb3Iu3',
	PROXY = '10.86.48.103', //'http://dewdfwdf03proxy.wdf.sap.corp:8080'
	PROXY_PORT = 8080;

var querystring = require('querystring'),
	http = require('http'),
	connect = require('connect'),
    app = connect()
  		.use(connect.logger('dev'))
  		.use(connect.static('../web'))
	 	.use(function(req, res){

	 		var params = querystring.parse(req.url.substring(req.url.lastIndexOf('?') + 1))
			
			console.log(req.url);
			
			console.log(req.url.indexOf('/comp'));
			if (req.url.indexOf('/comp') == 0) {
				host = 'ecn.dynamic.t0.tiles.virtualearth.net';
				path =  '/comp/CompositionHandler/' + params['quadkey'] +'?mkt=en-us&it=G,VE,BX,L,LA&shading=hill&n=z';
				port = 80;
			} else if (req.url.indexOf('/bing') == 0) {
	  			var centerX = params.centerX, 
					centerY = params.centerY,
					zoom = params.zoom || '',
					mapsizeX = params.mapsizeX || 256,
					mapsizeY = params.mapsizeY || 256,
					centerStr = params.centerX && params.centerY ? params.centerY + ',' + params.centerX + '/' : '',
	  				sizeStr = params.mapsizeX && params.mapsizeY ? 'mapSize=' + params.mapsizeX  + ',' + params.mapsizeY + '&' : '',
	  				areaStr = params.areaSouth && params.areaWest && params.areaNorth &&  params.areaEast ? 'mapArea=' + params.areaSouth + ',' +  params.areaWest + ',' +  params.areaNorth + ',' +  params.areaEast  + '&' : '',
	  				host = 'http://dev.virtualearth.net', 
	  				port = 80,
	  				path = '/REST/v1/Imagery/Map/Road/' + centerStr + zoom + '?' + sizeStr + areaStr + '&key=' + BING_KEY;
	  		} else {
	  			res.end();
	  			return;
	  		}

  		  	if (PROXY && PROXY_PORT) {
  		  		path = 'http://' + host + path;
  				host = PROXY;
<<<<<<< Updated upstream
  				port = 8080;	
=======
  				port = 8080;
  				path = BING_HOST + path;
  			} else {
  				host = BING_HOST;
  				port = 80;
  				console.log('yo');
>>>>>>> Stashed changes
  			}

	  		// console.log('host:' + host);
	  		// console.log('path:' + path);
	  		// console.log('port:' + port);

	  		// var headers = {};
	  		// for (var key in req.headers) {
	  		// 	if (key === 'host' || key === 'path') { continue; }
	  		// 	console.log(key + ':' + req.headers[key]);
	  		// 	headers[key] = req.headers[key];
	  		// }
	  		var headers =  {
	  			'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11',
	  			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	  			'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
	  			'Accept-Encoding': 'gzip,deflate,sdch',
				'Accept-Language': 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4',
				'Cache-Control': 'max-age=0',
				'If-None-Match': 'W/7a338cdd6fd9f0a3',
				'Proxy-Connection': 'keep-alive',
				'Host': 'ecn.dynamic.t0.tiles.virtualearth.net',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11'
	  		}

console.log(path);
		  	var request = http.get({
			 	host: host,
			  	port: port,
			  	path: path,
			  	headers: headers
			  	}, function (rest) {
			  		//console.log(request);
			  		res.setHeader('Content-Type', rest.headers['content-type']);
			  		// Does *not* make the image 'untainted' (for raw image data access on canvas),
			  		// so that's the whole reason I'm abusing connect as a static webserver. 
			  		res.setHeader('Access-Control-Allow-Origin', '*');
				  	rest.on('data', function (chunk) {
				  		console.log(chunk);
				    	res.write(chunk);
				  	});
				  	rest.on('end', function () {
				  		res.end();
				  	});
			  	}
			);
  }).listen(3000);

var Cheaproxy = require('./lib/cheaproxy.js').Cheaproxy;
var querystring = require('querystring');

var proxy = new Cheaproxy({
	port: 3000,
	htdocs: '../web',
	routes: {
		'/comp': bingQuadKeyRequest,
		'/bing': bingStaticMapRequest,
		'/finfact': finfact
	},
	proxy: {
		host: '10.86.48.103',
		port: 8080
	}
});

function bingQuadKeyRequest (request) {
	var VIRTUALEARTH_HOST = 'ecn.dynamic.t0.tiles.virtualearth.net';
	var params = querystring.parse(request.url.substring(request.url.lastIndexOf('?') + 1));
	if (!params['flags']) throw new Error('Query parameter "params" missing');
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
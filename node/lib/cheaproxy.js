var	http = require('http');
var connect = require('connect');

function Cheaproxy (config) {
	var self = this;
	if (!config || !config.routes || !config.port || !config.htdocs) {
		throw new Error('Missing config keys');
	}
	this.routes = config.routes;
	this.listenPort = config.port;
	this.proxyHost = config.proxy.host;
	this.proxyPort = config.proxy.port;

	app = connect()
  		.use(connect.logger('dev'))
  		.use(connect.static(config.htdocs))
	 	.use(function (req, res) {
	 		try {
	 			self.dispatcher(req, res);
	 		} catch (ex) {
	 			console.log(ex)
	 			res.write(ex.toString());
	 			res.end();
	 		}
	 	}).listen(this.listenPort);
	console.log('Cheaproxy started on port ' + this.listenPort);
}

Cheaproxy.prototype.dispatcher = function (req, res) {
	var handlerFct = this.getHandlerForUrl(req);
	var opts = handlerFct(req);
	
	// Detect proxy
  	if (this.proxyHost && this.proxyPort) {
  		opts.path = 'http://' + opts.host + opts.path;
		opts.port = this.proxyPort;
		opts.headers = {
			'Host': opts.host
		}
		opts.host = this.proxyHost;
	}

	console.log(JSON.stringify(opts));

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

Cheaproxy.prototype.getHandlerForUrl = function (request) {
	var url = request.url;
	for (var r in this.routes) {
		if (~url.indexOf(r)) {
			return this.routes[r];
		}
	}
	throw new Error('Request handler not found');
}

module.exports.Cheaproxy = Cheaproxy;
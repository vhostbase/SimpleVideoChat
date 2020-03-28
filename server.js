const WebSocketServer = require('ws').Server,
  express = require('express'),
  https = require('https'),
  app = express(),
  fs = require('fs');
var clientSet = {};
const pkey = fs.readFileSync('./ssl/key.pem'),
  pcert = fs.readFileSync('./ssl/cert.pem'),
  options = {key: pkey, cert: pcert, passphrase: '123456789'};
var wss = null, sslSrv = null;
 
// use express static to deliver resources HTML, CSS, JS, etc)
// from the public folder 
app.use(express.static('public'));

app.use(function(req, res, next) {
  if(req.headers['x-forwarded-proto']==='http') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

// start server (listen on port 443 - SSL)
sslSrv = https.createServer(options, app).listen(8080);
console.log("The HTTPS server is up and running");

// create the WebSocket server
wss = new WebSocketServer({server: sslSrv});  
console.log("WebSocket Secure server is up and running.");
/** successful connection */
wss.on('connection', function (client, incoming_request) {
	var clientId = client._ultron.id;
	console.log(client.upgradeReq.url.replace('\?', ''));
	const urlParams = new URLSearchParams(client.upgradeReq.url.replace('/?', ''));
	const myParam = urlParams.get('yuid');
	var oldClientId = clientSet[myParam];	
	clientSet[myParam]=clientId;
  console.log("A new WebSocket client was connected."+clientId);
  /** incomming message */
  client.on('message', function (message) {
	  var msgData = JSON.parse(message);
/*	  if(msgData.closeConnection){
		if (client.readyState === client.OPEN) {
			  client.close();
		 }
	  }*/
	  var id = msgData.yuid;
	  var tgtClientId = clientSet[id];
    /** broadcast message to all clients */
    wss.broadcast(message, client, tgtClientId);
  });
});
// broadcasting the message to all WebSocket clients.
wss.broadcast = function (data, exclude, tgtClientId) {
  var i = 0, n = this.clients ? this.clients.length : 0, client = null;
  if (n < 1) return;
  console.log("Broadcasting message to all " + n + " WebSocket clients.");
  for (i=0; i < n; i++) {
	client = this.clients[i];
	console.log("client id "+client._ultron.id);
	console.log("target id "+tgtClientId);
	if(data.indexOf('closeConnection') > -1){
		console.log("colse target id "+client._ultron.id);
		if (client.readyState === client.OPEN) client.send(data);
			else console.error('Error: the client state is ' + client.readyState);
	}else{
		// don't send the message to the sender...
		if (client._ultron.id === exclude._ultron.id) continue;
		if(tgtClientId === client._ultron.id){
			console.log('Found Client...');
			if (client.readyState === client.OPEN) client.send(data);
			else console.error('Error: the client state is ' + client.readyState);
		}
	}
  }
};
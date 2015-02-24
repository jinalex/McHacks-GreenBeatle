
//Setup server and listen on port 80
var http = require('http');
var server = http.createServer(function(request, response) {});

server.listen(80, "localhost",  function() {
    console.log((new Date()) + 'Listening on port 80');
});

var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({
    httpServer: server
});

//Designate a serial port to write to
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("COM6", {
  baudrate: 9600
});

//Listen to response
serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
  serialPort.write("ls\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});

function carControl(signal,serialPort) {
	serialPort.write(signal);
	console.log("sent "+signal)
}

//Records clients connected
var count = 0;
var clients = {};

//Server side logic
wsServer.on('request', function(r){
    // Code here to run on connection
	var connection = r.accept('echo-protocol', r.origin);
	// Specific id for this client & increment count
	var id = count++;
	// Store the connection method so we can loop through & contact all clients
	clients[id] = connection
	console.log((new Date()) + ' Connection accepted [' + id + ']');
	// Create event listener
	connection.on('message', function(message) {

	    // The string message that was sent to us
	    var msgString = message.utf8Data;

	    console.log(msgString);

	    if (msgString == "left") {
    			console.log("left press");
	        	carControl("L",serialPort);
	    } else if (msgString == "up") {	
	    	console.log("up press");
		        carControl("U",serialPort);
	    } else if (msgString == "right") {	
	    	console.log("right press");
	        	carControl("R",serialPort);
	    } else if (msgString == "down") {	
	    	console.log("down press");
	        	carControl("D",serialPort);
		}

	    // Loop through all clients
	    for(var i in clients){
	        //Echo the message back to client
	        clients[i].sendUTF(msgString+" I hear you");
	    }

	});

		//Disconnect message
		connection.on('close', function(reasonCode, description) {
		    delete clients[id];
		    console.log((new Date()) + connection.remoteAddress + ' disconnected.');
		});

	}
);
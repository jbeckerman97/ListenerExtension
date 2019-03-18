arr = [
    'test'
];

var net = require('net');

var client = new net.Socket();
client.connect(65432, '127.0.0.1', function() {
    console.log('Connected');
});

client.on('data', function(data) {
    if (arr.indexOf(data.toString('utf-8')) > -1) { 
        console.log('Received: ' + data);
    }
    //client.destroy(); // kill client after server's response
});

/*var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
}).listen(65432);*/
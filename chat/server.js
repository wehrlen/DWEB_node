const http = require("http");
const fs = require("fs");

const server = http.createServer();
const io = require("socket.io")(server);

io.on("connect", (socket) => {
	// console.log("Client connected");

	// socket.emit("welcome", "Hello!");

	// socket.broadcast.emit("message", "New user connected");

	socket.on("message", (data) => {
		io.emit("message", data);
	});
});

server.on("request", (request, response) => {
	if (request.url === "/") {
		fs.readFile("index.html", (error, content) => {
			if (error) {
				response.writeHead(404);
				response.end();
				return;
			}
			response.writeHead(200, {
				"Content-Type": "text/html; charset=utf-8"
			});
			response.write(content);
			response.end();
		});
	} else if (!request.url.match("^/socket\\.io/")) {
		response.writeHead(404);
		response.end();
	}
});
server.listen(5503);

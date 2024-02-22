const http = require("http");
const fs = require("fs");

const server = http.createServer();

let counter = 0;

function calc(a, op, b) {
	let res;
	switch (op) {
		case "plus":
			res = parseInt(a) + parseInt(b);
			break;
		case "minus":
			res = parseInt(a) - parseInt(b);
			break;
		case "times":
			res = parseInt(a) * parseInt(b);
			break;
		case "by":
			res = parseInt(a) / parseInt(b);
			break;

		default:
			break;
	}

	return res;
}

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
	} else if (request.url === "/api/counter") {
		counter++;
		response.writeHead(200, {
			"Content-Type": "application/json; charset=utf-8"
		});
		response.write(JSON.stringify(counter));
		response.end();
	} else if (request.url === "/api/calc" && request.method == "POST") {
		let body = "";

		request.on("data", (c) => {
			body += c;
		});

		request.on("end", () => {
			body = JSON.parse(body);

			response.writeHead(200, {
				"Content-Type": "application/json; charset=utf-8"
			});
			response.write(
				JSON.stringify(calc(body.first, body.operation, body.second))
			);
			response.end();
		});
	} else if ((m = request.url.match(/\/api\/calc2\/(\d+)\/(\w+)\/(\d+)/))) {
		let [_, first, operation, second] = m;

		response.writeHead(200, {
			"Content-Type": "application/json; charset=utf-8"
		});
		response.write(JSON.stringify(calc(first, operation, second)));
		response.end();
	} else {
		response.writeHead(404);
		response.end();
	}
});

server.listen(5503);

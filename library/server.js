const http = require("http");
const fs = require("fs");

const server = http.createServer();

let books = [
	{
		title: "Learn NodeJS",
		description: "Learn NodeJS in 2 seconds"
	},
	{
		title: "Learn Python",
		description: "Learn Python in 0.5 seconds"
	}
];

server.on("request", (request, response) => {
	if (request.url === "/") {
		response.writeHead(302, {
			Location: "/books"
		});
		response.end();
	} else if ((m = request.url.match(/\/api\/book\/([0-9]+)/))) {
		if (request.method === "GET") {
			if (parseInt(m[1]) < books.length) {
				let book = books[parseInt(m[1])];
				response.writeHead(200, {
					"Content-Type": "application/json; charset=utf-8"
				});
				response.write(JSON.stringify(book));
				response.end();
			} else {
				response.writeHead(404, {
					"Content-Type": "application/json; charset=utf-8"
				});
				response.write(JSON.stringify({ status: "Book not found" }));
				response.end();
			}
		}
	} else if (request.url === "/api/books") {
		if (request.method === "GET") {
			response.writeHead(200, {
				"Content-Type": "application/json; charset=utf-8"
			});
			response.write(JSON.stringify(books));
			response.end();
		} else if (request.method === "POST") {
			let body = "";

			request.on("data", (c) => {
				body += c;
			});

			request.on("end", () => {
				books.push(JSON.parse(body));

				response.writeHead(200, {
					"Content-Type": "application/json; charset=utf-8"
				});
				response.write(JSON.stringify({ status: "Success" }));
				response.end();
			});
		} else {
			response.writeHead(405);
			response.end();
		}
	} else if ((m = request.url.match(/\/book\/([0-9]+)/))) {
		fs.readFile("details.html", (error, content) => {
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
	} else if (request.url === "/books") {
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
	}
});

server.listen(5503);

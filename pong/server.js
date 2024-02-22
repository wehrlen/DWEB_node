const http = require("http");
const fs = require("fs");

const server = http.createServer();
const io = require("socket.io")(server);

let player_count = 0;
const scale = 6;

let canvas = {
	w: 600,
	h: 600
};

let ball = {
	x: 10,
	y: 10,
	r: 5,
	// vx: 0.8,
	// vy: 0.6,
	a: 30
};

let player = {
	x: canvas.w / 2 - canvas.w / scale / 2,
	y: canvas.h - 20,
	w: canvas.w / scale,
	h: 8,
	s: 6,
	position: "bottom",
	free: true,
	color: "blue"
};
let playerTop = {
	x: canvas.w / 2 - canvas.w / scale / 2,
	y: 20 - 8,
	w: canvas.w / scale,
	h: 8,
	s: 6,
	position: "top",
	free: true,
	color: "red"
};
let playerLeft = {
	x: 20 - 8,
	y: canvas.h / 2 - canvas.h / scale / 2,
	w: 8,
	h: canvas.h / scale,
	s: 6,
	position: "left",
	free: true,
	color: "green"
};
let playerRight = {
	x: canvas.w - 20,
	y: canvas.h / 2 - canvas.h / scale / 2,
	w: 8,
	h: canvas.h / scale,
	s: 6,
	position: "right",
	free: true,
	color: "yellow"
};
let players = [player, playerTop, playerLeft, playerRight];

io.on("connect", (socket) => {
	let player = players.find((player) => player.free);

	if (player) {
		player.free = false;

		player_count++;
		io.emit("player_count", player_count);

		socket.on("move", (direction) => {
			if (player.position === "top") {
				direction = direction == "LEFT" ? "RIGHT" : "LEFT";
			} else if (player.position == "left") {
				direction = direction == "LEFT" ? "TOP" : "BOTTOM";
			} else if (player.position == "right") {
				direction = direction == "LEFT" ? "BOTTOM" : "TOP";
			}

			if (direction === "LEFT") {
				if (player.x > 0) {
					player.x -= player.s;
				}
			} else if (direction === "RIGHT") {
				if (player.x < canvas.w - player.w) {
					player.x += player.s;
				}
			} else if (direction === "TOP") {
				if (player.y > 0) {
					player.y -= player.s;
				}
			} else if (direction === "BOTTOM") {
				if (player.y < canvas.h - player.h) {
					player.y += player.s;
				}
			}
			io.emit("move", players);
		});

		socket.on("disconnect", () => {
			player.free = true;

			player_count--;
			io.emit("player_count", player_count);

			io.emit("move", players);
		});

		io.emit("move", players);
	} else {
		socket.emit("message", "Game full, spectator mode");
		socket.emit("move", players);
	}

	socket.emit("init", {
		canvas: canvas,
		position: player ? player.position : null
	});
});

setInterval(() => {
	ball.vx = Math.cos((ball.a / 180) * Math.PI);
	ball.vy = Math.sin((ball.a / 180) * Math.PI);

	if (ball.x < 0 + ball.r || ball.x > canvas.w - ball.r) {
		ball.a = 180 - ball.a;
	}
	if (ball.y < 0 + ball.r || ball.y > canvas.h - ball.r) {
		ball.a = 360 - ball.a;
	}

	players.forEach((player) => {
		if (!player.free) {
			if (player.position == "top" || player.position == "bottom") {
				if (
					ball.x + ball.r + ball.vx >= player.x &&
					ball.x - ball.r + ball.vx <= player.x + player.w
				) {
					if (
						(ball.vy >= 0 &&
							ball.y + ball.r + ball.vy >= player.y &&
							ball.y + ball.r + ball.vy < player.y + player.h) ||
						(ball.vy < 0 &&
							ball.y - ball.r + ball.vy <= player.y + player.h &&
							ball.y - ball.r + ball.vy > player.y)
					) {
						let variation =
							(ball.x - player.w / 2 - player.x) *
							(30 / player.w);
						ball.a = 360 - ball.a + variation;
					}
				}
			}

			if (player.position == "left" || player.position == "right") {
				if (
					ball.y + ball.r + ball.vy >= player.y &&
					ball.y - ball.r + ball.vy <= player.y + player.h
				) {
					if (
						(ball.vx >= 0 &&
							ball.x + ball.r + ball.vx >= player.x &&
							ball.x + ball.r + ball.vx < player.x + player.w) ||
						(ball.vx < 0 &&
							ball.x - ball.r + ball.vx <= player.x + player.w &&
							ball.x - ball.r + ball.vx > player.x)
					) {
						let variation =
							(ball.y - player.h / 2 - player.y) *
							(30 / player.h);
						ball.a = 180 - ball.a + variation;
					}
				}
			}
		}
	});

	// Recalculate vx and vy whatever it changed
	ball.vx = Math.cos((ball.a / 180) * Math.PI);
	ball.vy = Math.sin((ball.a / 180) * Math.PI);
	// Then move the ball
	ball.x += ball.vx;
	ball.y += ball.vy;

	io.emit("ball", ball);
}, 6);

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
	} else if (request.url === "/client.js") {
		fs.readFile("client.js", (error, content) => {
			if (error) {
				response.writeHead(404);
				response.end();
				return;
			}
			response.writeHead(200, {
				"Content-Type": "text/javascript; charset=utf-8"
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

let socket = new io();

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let players = [];
let ball = {};

function Circle(x, y, r) {
	this.fill = function (ctx) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	};
}

setInterval(() => {
	// Clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Create ball
	let circ = new Circle(ball.x, ball.y, ball.r);
	circ.fill(ctx);

	// Create players
	players.forEach((player) => {
		if (!player.free) {
			ctx.fillStyle = player.color;
			ctx.fillRect(player.x, player.y, player.w, player.h);
			ctx.fillStyle = "black";
		}
	});
}, 6);

socket.on("init", (data) => {
	canvas.width = data.canvas.w;
	canvas.height = data.canvas.h;

	switch (data.position) {
		case "top":
			ctx.translate(canvas.width, canvas.height);
			ctx.rotate(Math.PI);
			break;
		case "left":
			ctx.translate(0, canvas.height);
			ctx.rotate(Math.PI * 1.5);
			break;
		case "right":
			ctx.translate(canvas.width, 0);
			ctx.rotate(Math.PI * 0.5);
			break;
	}
});

socket.on("player_count", (data) => {
	document.getElementById("message").innerHTML = "Player count: " + data;
});

socket.on("message", (data) => {
	document.getElementById("message").innerHTML = data;
});

socket.on("ball", (data) => {
	ball = data;
});

socket.on("move", (data) => {
	players = data;
});

document.addEventListener("keydown", (e) => {
	if (e.key === "ArrowLeft") {
		socket.emit("move", "LEFT");
	} else if (e.key === "ArrowRight") {
		socket.emit("move", "RIGHT");
	}
});

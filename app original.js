const express = require('express');
const ws = require('ws');

const app = express();

// app.use(express.static('public'));
// app.get('/*', (req, res) => {
// 	res.sendFile(__dirname + '/index.html');
// });

// http.listen(process.env.PORT || 3000, () => {
// 	console.log(`listening on *:${process.env.PORT || 3000}`);
// });

// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true });

let rooms = {
	lobby: [],
	room: [],
};

const getRoomMessage = (room) => {
	return JSON.stringify({
		event: 'fetch-room',
		data: rooms[room].map((user) => {
			return {
				...user,
				socket: user.socket.id,
			};
		}),
	});
};

// check if clients have sent pings in the last 30 seconds
const interval = setInterval(() => {
	Object.values(rooms)
		.flat(2)
		.map((user) => {
			if (user.socket.alive === false) {
				console.log(`disconnect ${user.socket.id}`);

				Object.keys(rooms).map((key) => {
					let room = rooms[key];

					for (let i = 0; i < room.length; i++) {
						let _user = room[i];

						if (_user.socket.id == user.socket.id) {
							// remove the client from the room
							rooms[key].splice(i, 1);

							// inform all other clients
							rooms[key].map((__user) => {
								__user.socket.send(getRoomMessage(key));
							});
							break;
						}
					}
				});

				return user.socket.terminate();
			}

			user.socket.alive = false;
			user.socket.send(
				JSON.stringify({
					event: 'ping',
					id: user.socket.id,
				})
			);
		});
}, 1000);

wsServer.on('close', () => {
	console.log('server: closed');
	clearInterval(interval);
});

wsServer.on('open', () => {
	console.log('server: opened');
});

wsServer.on('connection', (socket) => {
	socket.alive = true;

	socket.send(
		JSON.stringify({
			event: 'connect',
			id: socket.id,
		})
	);

	socket.on('message', (data) => {
		data = JSON.parse(data.toString());

		switch (data.event) {
			case 'ping':
				socket.alive = true;
				break;
			case 'connect':
				// console.log(data);
				socket.alive = true;
				socket.id = data.id;

				if (Object.keys(rooms).includes(data.room)) {
					Object.entries(rooms).map(([room, users]) => {
						users
							.filter((user) => user.socket.id == socket.id)
							.map((user, index) => {
								user.socket.send(
									JSON.stringify({
										event: 'disconnect',
										reason: 'Duplicate connections detected',
									})
								);
								console.log(`disconnect ${socket.id}`);

								rooms[room].splice(index, 1);
							});
					});

					rooms[data.room].push({
						socket: socket,
						position: {
							x: 0,
							y: 0,
						},
					});
					rooms[data.room].map((user) => {
						user.socket.send(getRoomMessage(data.room));
					});
				} else {
					socket.send(
						JSON.stringify({
							event: 'error',
							error: `Room "${data.room}" does not exist`,
						})
					);
				}
				break;
			case 'move':
				// find user index
				let userIndex = rooms[data.room].findIndex((user) => user.socket.id == data.id);
				if (userIndex > -1) {
					rooms[data.room][userIndex].position = data.position;
					// get all users except sender
					rooms[data.room].map((user) => {
						if (user.socket.id != data.id) {
							// send them room data
							user.socket.send(getRoomMessage(data.room));
						}
					});
				}
				break;
		}

		// *** server event log
		// console.log(`${data.event} ${socket.id} ${rooms.lobby.length}`);
	});
});

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(8000, () => {
	console.log(`Listening on port 8000`);
});
server.on('upgrade', (request, socket, head) => {
	wsServer.handleUpgrade(request, socket, head, (socket) => {
		wsServer.emit('connection', socket, request);
	});
});

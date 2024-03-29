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
	lobby: {
		users: [],
		data: [],
	},
	room: {
		users: [],
		data: [],
	},
};

// room object
// lobby: {
// 	users: [],
// 	data: []
// }

// const getRoomMessage = (room) => {
// map((user) => {
// 	return {
// 		...user,
// 		socket: user.socket.id,
// 	})
const fetchRoomData = (room) => {
	return JSON.stringify({
		event: 'fetch-room',
		data: {
			users: rooms[room].users.map((user) => {
				return {
					...user,
					socket: user.socket.id,
				};
			}),
			data: rooms[room].data,
		},
	});
};

// check if clients have sent pings in the last 30 seconds
const interval = setInterval(() => {
	Object.values(rooms)
		.map((room) => room.users)
		.flat(2)
		.map((user) => {
			if (user.socket.alive === false) {
				console.log(`disconnect ${user.socket.id}`);

				Object.keys(rooms).map((key) => {
					let room = rooms[key];

					for (let i = 0; i < room.users.length; i++) {
						let _user = room.users[i];

						if (_user.socket.id == user.socket.id) {
							// remove the client from the room
							rooms[key].users.splice(i, 1);

							// inform all other clients
							rooms[key].users.map((__user) => {
								__user.socket.send(fetchRoomData(key));
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
	// rooms object structure
	// {
	// 	lobby: {
	// 		users: [
	// 			{
	// 				socket: SOCKET_OBJECT,
	// 				position: { x: 0, y: 0 },
	// 				name: 'john'
	// 			}
	// 		],
	// 		data: [
	// 			?
	// 		]
	// 	},
	// 	room1: { users: [...], data: [...]},
	// 	room2: { users: [...], data: [...]},
	// }

	socket.alive = true;

	socket.send(
		JSON.stringify({
			event: 'connect',
			id: socket.id,
		})
	);

	socket.on('message', (data) => {
		msg = JSON.parse(data.toString());

		switch (msg.event) {
			case 'ping':
				socket.alive = true;
				break;
			case 'connect':
				// console.log(msg);
				socket.alive = true;
				socket.id = msg.id;

				if (Object.keys(rooms).includes(msg.room)) {
					for (let [room, roomData] of Object.entries(rooms)) {
						roomData.users
							.filter((user) => user.socket.id == socket.id)
							.map((user, index) => {
								user.socket.send(
									JSON.stringify({
										event: 'disconnect',
										reason: 'Duplicate connections detected',
									})
								);
								console.log(`disconnect ${socket.id}`);

								rooms[room].users.splice(index, 1);
							});
					}

					rooms[msg.room].users.push({
						socket: socket,
						position: {
							x: 0,
							y: 0,
						},
						name: msg.name,
					});

					rooms[msg.room].users.map((user) => {
						user.socket.send(fetchRoomData(msg.room));
					});
				} else {
					socket.send(
						JSON.stringify({
							event: 'error',
							error: `Room "${msg.room}" does not exist`,
						})
					);
				}
				break;
			case 'rename':
				// find which room contains user with matching socket id
				for (let [room, roomData] of Object.entries(rooms)) {
					let userIndex = roomData.users.findIndex((user) => user.socket.id == msg.id);
					if (userIndex > -1) {
						// change user name in room
						rooms[room].users[userIndex].name = msg.name;
						// update room data to all users except renamed
						rooms[room].users.map((user) => {
							// send room data with function (replace socket objects with socket id only)

							if (user.socket.id != msg.id) {
								user.socket.send(fetchRoomData(room));
							}
						});
						break;
					}
				}
				break;
			case 'move':
				// if room doesn't exist, otherwise there will be an error
				if (!Object.keys(rooms).includes(msg.room)) return;

				// find user index
				let userIndex = rooms[msg.room].users.findIndex((user) => user.socket.id == msg.id);
				if (userIndex > -1) {
					rooms[msg.room].users[userIndex].position = msg.position;
					// get all users except sender
					rooms[msg.room].users.map((user) => {
						if (user.socket.id != msg.id) {
							// send them room data
							user.socket.send(fetchRoomData(msg.room));
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

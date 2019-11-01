const express = require('express')
const app = express()

const server = require('http').Server(app)
	.listen(8888, () => {console.log('open Server')})

const io = require('socket.io')(server)
const roomList = {}

io.on('connection', socket => {
	console.log('connection')
	const socketID = socket.id;
	console.log(socketID)
	const room = joinOrCreate() || getRoomName()
	
	if(joinOrCreate()) {
		socket.join(room, () => {
			roomList[room].push(socketID)
			if(roomList[room].length === 2) {
				io.to(room).emit('startGame')
				console.log(roomList)
			}
		})
	} else {
		socket.join(room, () => {
			roomList[room] = [socketID]
			console.log(roomList)
		})
	}

	socket.on('disconnect', (reason) => {
		socket.leave(room)
		const index = roomList[room].indexOf(socketID)
		roomList[room].splice(index, 1)
		io.to(room).emit('leaveGame')
		console.log(roomList)
	})
})


function getRoomName() {
	return Math.floor(Math.random()*10000)
}

function joinOrCreate() {
	return Object.keys(roomList).filter(key => roomList[key].length < 2)[0]
}

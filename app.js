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
	socket.on('disconnect', (reason) => {
		console.log(reason)
	})
	const room = joinOrCreate() || getRoomName()
	if(joinOrCreate()) {
		socket.join(room, () => {
			roomList[room].push(socketID)
			if(roomList[room].length === 2) {
				io.to(room).emit('startGame')
			}
		})
	} else {
		socket.join(room, () => {
			roomList[room] = [socketID]
			console.log(roomList)
		})
	}
})


function getRoomName() {
	return Math.floor(Math.random()*10000)
}

function joinOrCreate() {
	return Object.keys(roomList).filter(key => roomList[key].length < 2)[0]
}

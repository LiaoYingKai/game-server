const express = require('express')
const app = express()

const server = require('http').Server(app)
	.listen(8888, () => {console.log('open Server')})

const io = require('socket.io')(server)

io.on('connection', socket => {
	console.log('connection')
	const socketID = socket.id;
	console.log(socketID)
	socket.on('disconnect', (reason) => {
		console.log(reason)
	})
})

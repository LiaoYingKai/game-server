const express = require('express')
const app = express()

const server = require('http').Server(app)
	.listen(8888, () => {console.log('open Server')})

const io = require('socket.io')(server)
const roomList = {}
const PlayEnums = {
	PLAY_1: 'o',
	PLAY_2: 'x',
}
const {
	PLAY_1,
	PLAY_2
} = PlayEnums

io.on('connection', socket => {
	console.log('connection')
	const socketID = socket.id;
	console.log(socketID)
	const room = joinOrCreate() || getRoomName()
	
	if(joinOrCreate()) {
		socket.join(room, () => {
			const { peopleOfRoom, nowPlayer, } = roomList[room]
			peopleOfRoom.push(socketID)
			if(peopleOfRoom.length === 2) {
				io.to(room).emit('startGame')
				io.to(peopleOfRoom[0]).emit('PLAY_1')
				io.to(peopleOfRoom[1]).emit('PLAY_2')
				roomList[room].nowPlayer = changePlayer(nowPlayer)
				io.to(room).emit('nowPlay', nowPlayer)
				
			}
			console.log(roomList)
		})
	} else {
		socket.join(room, () => {
			roomList[room] = initRoom()
			roomList[room].peopleOfRoom.push(socketID)
			console.log(roomList)
		})
	}

	socket.on('addChess', (chess) => {
		console.log(chess)
		socket.emit('updateChess',() => {
			// 更新棋盤
		});
		socket.emit('errorAdd', () => {
			// 不能下的地方
		});
		socket.emit('gameResult', () => {
			// 不能下的地方
		});
	})

	socket.on('disconnect', (reason) => {
		socket.leave(room)
		const index = roomList[room].peopleOfRoom.indexOf(socketID)
		roomList[room].peopleOfRoom.splice(index, 1)
		io.to(room).emit('leaveGame')
		console.log(roomList)
	})
})


function getRoomName() {
	return Math.floor(Math.random()*10000)
}

function joinOrCreate() {
	return Object.keys(roomList).filter(key => roomList[key].numOfPeople < 2)[0]
}

function initRoom() {
	return {
		peopleOfRoom: [],
		nowPlayer: 0,
		checkerboardStatus: [['','',''],['','',''],['','',''],],
		get numOfPeople() {
			return this.peopleOfRoom.length
		}
	}
}

function changePlayer(play) {
	if(play === PLAY_1) {
		return PLAY_2
	} else {
		return PLAY_1
	}
}
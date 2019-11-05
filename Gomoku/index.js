const { PlayEnums } = require('../enums');
const {
	getRoomName,
	joinOrCreate,
	changePlayer,
} = require('../lib');
const roomList = {}
const {
	PLAY_1,
	PLAY_2
} = PlayEnums

// var player = 0
// var chess = 'o'
function initRoom() {
	return {
		peopleOfRoom: [],
		nowPlayer: 0,
		checkerboardStatus: createCheckerboard(),
		get numOfPeople() {
			return this.peopleOfRoom.length
		}
	}
}
function createCheckerboard() {
	let checkerboard = []
	for (let i = 0; i < 20; i++) {
		checkerboard[i] = new Array()
		for (let j = 0; j < 20; j++) {
			checkerboard[i][j] = 0
		}
	}
	return checkerboard
}

function isWin(i, j) {
	return horizontalWin(i, j) || straightWin(i, j) || rightObliqueWin(i, j) || leftObliqueWin(i, j)
}
//左右
function horizontalWin(i, j) {
	let count = 1
	for (let x = 1; x < 5; x++) {
		if (checkerboard[i][j] === checkerboard[i][j - x]) {
			count += 1
		} else {
			break
		}
	}
	for (let x = 1; x < 5; x++) {
		if (checkerboard[i][j] === checkerboard[i][j + x]) {
			count += 1
		} else {
			break
		}
	}
	return count >= 5
}
//上下
function straightWin(i, j) {
	let count = 1
	for (let y = 1; y < 5; y++) {
		if (i - y < 0) {
			break
		}
		if (checkerboard[i][j] === checkerboard[i - y][j]) {
			count += 1
		} else {
			break
		}
	}
	for (let y = 1; y < 5; y++) {
		if (i + y > 19) {
			break
		}
		if (checkerboard[i][j] === checkerboard[i + y][j]) {
			count += 1
		} else {
			break
		}
	}
	return count >= 5
}
//右上到左下
function rightObliqueWin(i, j) {
	let count = 1

	for (let y = 1; y < 5; y++) {
		if (i - y < 0) {
			break
		}
		if (checkerboard[i][j] === checkerboard[i - y][j + y]) {
			count += 1
		} else {
			break
		}
	}
	for (let y = 1; y < 5; y++) {
		if (i + y > 19) {
			break
		}
		if (checkerboard[i][j] === checkerboard[i + y][j - y]) {
			count += 1
		} else {
			break
		}
	}
	return count >= 5
}
//左上到右下
function leftObliqueWin(i, j) {
	let count = 1
	for (let y = 1; y < 5; y++) {
		if (i - y < 0) {
			break
		}
		if (checkerboard[i][j] === checkerboard[i - y][j - y]) {
			count += 1
		} else {
			break
		}
	}
	for (let y = 1; y < 5; y++) {
		if (i + y > 19) {
			break
		}
		if (checkerboard[i][j] === checkerboard[i + y][j + y]) {
			count += 1
		} else {
			break
		}
	}
	return count >= 5
}

module.exports = function(io) {
	io.on('connection', function(socket) {
		console.log('connection Gomoku server')
		const socketID = socket.id;
		console.log(socketID)
		const isJoin = Boolean(joinOrCreate(roomList))
		let room;
		if(isJoin) {
			room = joinOrCreate(roomList)
			socket.join(room, () => {
				const { peopleOfRoom, nowPlayer, } = roomList[room]
				peopleOfRoom.push(socketID)
				if(peopleOfRoom.length === 2) {
					io.to(room).emit('startGame')
					io.to(peopleOfRoom[0]).emit('PLAY_1')
					io.to(peopleOfRoom[1]).emit('PLAY_2')
					roomList[room].nowPlayer = changePlayer(nowPlayer)
					io.to(room).emit('nowPlay', roomList[room].nowPlayer)
				}
				console.log(roomList)
			})
		} else {
			room = getRoomName()
			socket.join(room, () => {
				roomList[room] = initRoom()
				roomList[room].peopleOfRoom.push(socketID)
				console.log(roomList)
			})
		}
		socket.on('addChess', (chessInfo) => {
			const {
				play,
				rowIndex,
				columnIndex
			} = chessInfo
			roomList[room].checkerboardStatus[rowIndex][columnIndex] = play
			io.to(room).emit('updateChess', roomList[room].checkerboardStatus)
		})
		// playId.push(socketID)
		// if (playId.length === 2) {
		// 	checkerboard = createCheckerboard()
		// 	socket.broadcast.to(playId[player]).emit('changeYou', true);
		// }
		// socket.on('addChess', (i, j) => {
		// 	if (playId[player] === socketID) {
		// 		if (checkerboard[i][j] === 0) {
		// 			console.log(socketID, i, j)
		// 			io.emit('updateChess', i, j)
		// 			checkerboard[i][j] = chess
		// 			if (isWin(i, j)) {
		// 				io.emit('gameResult', chess)
		// 				console.log(chess + " is winner")
		// 				player = 0
		// 				chess = 'o'
		// 			} else {
		// 				player = player === 0 ? 1 : 0
		// 				chess = chess === 'o' ? 'x' : 'o'
		// 				socket.broadcast.to(playId[player]).emit('changeYou', true);
		// 			}
		// 		}
		// 	}
		// })
		// socket.on('disconnect', function() {
		// 	playId.splice(playId.indexOf(socketID), 1)
		// 	console.log(playId)
		// 	chess = 'o'
		// 	player = 0
		// })
		socket.on('disconnect', (reason) => {
			socket.leave(room)
			io.to(room).emit('leaveGame')
			io.to(room).emit('updateChess', createCheckerboard())
			delete roomList[room]
			console.log(roomList)
		})
	})
}
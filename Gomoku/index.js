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
		totalChess: 0,
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

function isWin(i, j, checkerboard) {
	return horizontalWin(i, j, checkerboard) || straightWin(i, j, checkerboard) || rightObliqueWin(i, j, checkerboard) || leftObliqueWin(i, j, checkerboard)
}
//左右
function horizontalWin(i, j, checkerboard) {
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
function straightWin(i, j, checkerboard) {
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
function rightObliqueWin(i, j, checkerboard) {
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
function leftObliqueWin(i, j, checkerboard) {
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
			if(play !== roomList[room].nowPlayer) {
				socket.emit('notNowPlay', '想偷吃步餒乾');
				return 
			}
			if(roomList[room].checkerboardStatus[rowIndex][columnIndex]) {
				socket.emit('multipleAdd', '沒看到有人下了喔乾');
				return
			}
			roomList[room].checkerboardStatus[rowIndex][columnIndex] = play
			roomList[room].totalChess++;
			io.to(room).emit('updateChess', roomList[room].checkerboardStatus)
			if(isWin(rowIndex, columnIndex, roomList[room].checkerboardStatus)) {
				io.to(room).emit('gameResult', play);
				return
			}
			if(roomList[room].totalChess === 400) {
				io.to(room).emit('gameResult', 'flat');
				return
			}
			roomList[room].nowPlayer = changePlayer(roomList[room].nowPlayer)
			io.to(room).emit('nowPlay', roomList[room].nowPlayer)
		})

		socket.on('init', () => {
			socket.emit('init', createCheckerboard())
		})

		socket.on('disconnect', (reason) => {
			socket.leave(room)
			io.to(room).emit('leaveGame')
			io.to(room).emit('updateChess', createCheckerboard())
			delete roomList[room]
			console.log(roomList)
		})
	})
}
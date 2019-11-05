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
function initCheckerbord() {
	const checkerboard = [['','',''],['','',''],['','',''],];

	return checkerboard.map(row => row.map(item => item));
}

function isWin(play, checkerboard) {
	let isWin = false;

	checkerboard.forEach((row , index) => {
		// row win
		if (row.every(item => item === play)) {
			isWin = true;
		}
		// column win
		if (checkerboard[0][index] === play && checkerboard[0][index] === checkerboard[1][index] && checkerboard[1][index] === checkerboard[2][index]) {
			isWin = true;
		}
	});
	// oblique win
	if (checkerboard[1][1] === play) {
		if (checkerboard[1][1] === checkerboard[0][2] && checkerboard[1][1] === checkerboard[2][0]) {
			isWin = true;
		}
		if (checkerboard[1][1] === checkerboard[0][0] && checkerboard[1][1] === checkerboard[2][2]) {
			isWin = true;
		}
	}

	return isWin;
}

function isFlat(checkerboard) {
	return checkerboard.every(row => (
		row.every(column => column)
	));
}

module.exports = function(io) {
	io.on('connection', socket => {
		console.log('connection TicTacToc server')
		const socketID = socket.id;
		console.log(socketID)
		const room = joinOrCreate(roomList) || getRoomName()
		
		if(joinOrCreate(roomList)) {
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
			io.to(room).emit('updateChess', roomList[room].checkerboardStatus)
			
			if (isWin(PLAY_1, roomList[room].checkerboardStatus)) {
				io.to(room).emit('gameResult', PLAY_1);
				return 
			} 
			if(isWin(PLAY_2, roomList[room].checkerboardStatus)) {
				io.to(room).emit('gameResult', PLAY_2);
				return 
			}
			if(isFlat(roomList[room].checkerboardStatus)) {
				io.to(room).emit('gameResult', 'flat');
				return 
			}
			roomList[room].nowPlayer = changePlayer(roomList[room].nowPlayer)
			io.to(room).emit('nowPlay', roomList[room].nowPlayer)
		})
	
		socket.on('init', () => {
			socket.emit('init', initCheckerbord())
		})
	
		socket.on('disconnect', (reason) => {
			socket.leave(room)
			io.to(room).emit('leaveGame')
			io.to(room).emit('updateChess', initCheckerbord())
			delete roomList[room]
			console.log(roomList)
		})
	})
}

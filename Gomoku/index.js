
var status
var checkerbords
var playId = []
var player = 0
var chess = 'o'
var checkerboard = createCheckerboard()

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
	return horizontalWin(i, j) || straightWin(i, j) || rightOblique(i, j) || leftOblique(i, j)
}

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
function rightOblique(i, j) {
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
function leftOblique(i, j) {
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
		playId.push(socket.id)
		console.log(playId)
		if (playId.length === 2) {
			checkerboard = createCheckerboard()
			socket.broadcast.to(playId[player]).emit('changeYou', true);
		}
		socket.on('putChess', (i, j) => {
			if (playId[player] === socket.id) {
				if (checkerboard[i][j] === 0) {
					console.log(socket.id, i, j)
					io.emit('drawChess', i, j)
					checkerboard[i][j] = chess
					if (isWin(i, j)) {
						io.emit('winner', chess)
						console.log(chess + " is winner")
						player = 0
						chess = 'o'
					} else {
						player = player === 0 ? 1 : 0
						chess = chess === 'o' ? 'x' : 'o'
						socket.broadcast.to(playId[player]).emit('changeYou', true);
					}
				}
			}
		})
		socket.on('disconnect', function(hello) {
			playId.splice(playId.indexOf(socket.id), 1)
			console.log(playId)
			chess = 'o'
			player = 0
		})
	})
}
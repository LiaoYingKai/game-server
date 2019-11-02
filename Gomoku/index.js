module.exports = function(io) {
	io.on('connection', socket => {
		console.log("connection Gomoku server")
	})
}
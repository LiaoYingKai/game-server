const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 8888;


const server = app.listen(port, () => {console.log('open Server')})
const io = require('socket.io')(server)

app.use(cors());
require('./TicTacToc')(io.of('/tic-tac-toc'))
require('./Gomoku')(io.of('/gomoku'))

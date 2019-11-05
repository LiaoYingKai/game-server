const { PlayEnums } = require('../enums');
const {
	PLAY_1,
	PLAY_2
} = PlayEnums

module.exports = {
	getRoomName: () => {
		return Math.floor(Math.random()*10000)
	},
	joinOrCreate: (roomList) => {
		return Object.keys(roomList).filter(key => roomList[key].numOfPeople < 2)[0]
	},
	changePlayer: (play) => {
		if(play === PLAY_1) {
			return PLAY_2
		} else {
			return PLAY_1
		}
	},
}
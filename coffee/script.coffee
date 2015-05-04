#Create engine instance
window.engine = new Engine "canvas", ["player", "platform"]

#Set key map
engine.keys =
	up: 38,
	down: 40,
	left: 37,
	right: 39

#Init when prefabs are loaded
engine.onprefabsloaded = () ->

	#Spawn the player
	engine.spawn "player",
		x: window.innerWidth / 5
		y: window.innerHeight / 1.2 - 40

	#Spawn the starting platform
	engine.spawn "platform",
		x: 10
		y: window.innerHeight - 30
		width: window.innerWidth - 20
		height: 20

	engine.start()

window.engine = new Engine "canvas", [
	"player", "platform"
]

engine.keys =
	up: 38,
	down: 40,
	left: 37,
	right: 39

engine.onprefabsloaded = () ->
	engine.spawn "player",
		x: 10
		y: 10

	engine.spawn "platform",
		x: 100
		y: 200
		width: 90
		height: 20

	engine.start()

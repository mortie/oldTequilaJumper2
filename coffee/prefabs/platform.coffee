engine.addPrefab "platform",
	constructor: (args) ->

		#Create physics body
		@body = new Engine.PhysicsBody engine,
			x: args.x
			y: args.y
			width: args.width
			height: args.height
			depth: 10
			density: 10
			drag: 1
			friction: 0.1

	update: (entities) ->
		@body.update()

	#Drawing a rectangle
	draw: (fab, can) ->
		can.add new fab.Rect
			width: @body.width
			height: @body.height
			left: @body.pos.x
			top: @body.pos.y

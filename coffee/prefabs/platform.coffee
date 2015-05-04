engine.addPrefab "platform",
	constructor: (args) ->
		@body = new Engine.PhysicsBody engine,
			x: args.x
			y: args.y
			width: args.width
			height: args.height
			depth: 10
			density: 10
			drag: 1
			friction: 0.1

		@force = 23

	update: (entities) ->
		@body.update(engine)

	draw: (fab, can) ->
		can.add new fab.Rect
			width: @body.width
			height: @body.height
			left: @body.pos.x
			top: @body.pos.y

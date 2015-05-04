engine.addPrefab "player",
	constructor: (args) ->
		@body = new Engine.PhysicsBody engine,
			x: args.x
			y: args.y
			width: 10
			height: 10
			depth: 10
			density: 10
			drag: 1.05
			friction: 0.01

		@force = 23
		@jumpForce = 0.8
		@isOnGround = false

	update: (entities) ->
		if engine.keyPressed "down"
			@body.applyForce 0, @force
		if engine.keyPressed "left"
			@body.applyForce -@force, 0
		if engine.keyPressed "right"
			@body.applyForce @force, 0

		@isOnGround = false;
		collisionElement = undefined;
		entities.forEach (entity) =>
			if entity.type == "platform" and @body.collidesWith entity.body
				@isOnGround = true
				@body.vel.y = 0 if @body.vel.y > 0
				@body.pos.y = entity.body.pos.y - @body.height
				collisionElement = entity

		if @isOnGround and engine.keyPressed "up"
			@isOnGround = false
			@body.pos.y -= 1
			@body.impulse(0, -@jumpForce)

		@body.update()
		@body.gravity() if !@isOnGround
		@body.frictionX() if @isOnGround

	draw: (fab, can) ->
		can.add new fab.Rect
			width: @body.width
			height: @body.height
			left: @body.pos.x
			top: @body.pos.y

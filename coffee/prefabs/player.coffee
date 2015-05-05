engine.addPrefab "player",
	constructor: (args) ->

		#Create the physics body
		@body = new Engine.PhysicsBody engine,
			x: args.x
			y: args.y
			width: 20
			height: 20
			depth: 20
			density: 10
			drag: 1
			friction: 0.002

		#Some physics related values
		@force = 100
		@jumpForce = 0.8
		@isOnGround = false

	#Physics updates per frame
	update: (entities) ->

		#Left, right, and down controls
		if engine.keyPressed "down"
			@body.applyForce 0, @force
		if engine.keyPressed "left"
			@body.applyForce -@force, 0
		if engine.keyPressed "right"
			@body.applyForce @force, 0

		#Check for collisions
		@isOnGround = false;
		collisionElement = undefined;
		entities.forEach (entity) =>
			if entity.type == "platform" and @body.collidesWith entity.body
				@isOnGround = true
				@body.vel.y = 0 if @body.vel.y > 0
				@body.pos.y = entity.body.pos.y - @body.height
				collisionElement = entity

		#Jumping
		if @isOnGround and engine.keyPressed "up"
			@isOnGround = false
			@body.pos.y -= 1
			@body.impulse(0, -@jumpForce)

		#Physics related updates
		@body.update()
		@body.gravity() if !@isOnGround
		@body.applyFriction() if @isOnGround

	#Drawing a square
	draw: (fab, can) ->
		offsetX = @body.vel.x * -10
		offsetY = @body.vel.y * -10

		can.add new fab.Polygon [
			{x: 0, y: @body.height},
			{x: offsetX, y: offsetY},
			{x: @body.width + offsetX, y: offsetY},
			{x: @body.width, y: @body.height}
		], {
			top: @body.pos.y
			left: @body.pos.x
			fill: "#008c00"
			stroke: "00c000"
		}

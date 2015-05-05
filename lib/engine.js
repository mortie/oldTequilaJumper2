(function()
{
	function clamp(x, min, max)
	{
		return Math.min(Math.max(x, min), max);
	}

	function get(url, cb)
	{
		var xhr = new XMLHttpRequest();
		xhr.open(url);
		xhr.send();
	}

	window.Engine = function(canvasId, requiredPrefabs, conf)
	{
		conf = conf || {};

		this.requiredPrefabs = requiredPrefabs || []

		this.canvas = new fabric.Canvas(canvasId);

		this.deltaTime = 0;
		this.prevTime = 0;

		this.entities = [];
		this.prefabs = {};

		this.keys = {};
		this.pressedKeys = [];

		this.camera = new Engine.Vec2(0, 0);

		this.world =
		{
			"airDensity": conf.airDensity || 1.225,
			"gravity": conf.gravity || 9.98
		}

		window.addEventListener("keydown", function(evt)
		{
			this.pressedKeys[evt.keyCode] = true;
		}.bind(this));

		window.addEventListener("keyup", function(evt)
		{
			this.pressedKeys[evt.keyCode] = false;
		}.bind(this));

		window.addEventListener("resize", function(evt)
		{
		}.bind(this));
		this.canvas.setWidth(window.innerWidth);
		this.canvas.setHeight(window.innerHeight);
	}

	Engine.prototype =
	{
		"addPrefab": function(name, prefab)
		{
			prefab.type = name;
			this.prefabs[name] = prefab;

			this.requiredPrefabs.splice(this.requiredPrefabs.indexOf(name), 1);
			if (this.requiredPrefabs.length == 0 && this.onprefabsloaded)
				this.onprefabsloaded();
		},

		"spawn": function(name, args)
		{
			if (this.prefabs[name] === undefined)
			{
				throw new Error("Prefab "+name+" doesn't exist.");
				return;
			}

			var entity = Object.create(this.prefabs[name]);
			entity.constructor(args);

			this.entities.push(entity);

			console.log("Spawning "+name);
		},

		"start": function()
		{
			this.prevTime = new Date().getTime() - 16;
			this._update();
		},

		"stop": function()
		{
			cancelAnimationFrame(this.animFrame);
		},

		"keyPressed": function(key)
		{
			return !!this.pressedKeys[this.keys[key]];
		},

		"_update": function()
		{
			var nowTime = new Date().getTime();
			this.deltaTime = nowTime - this.prevTime;
			this.prevTime = nowTime;

			if (this.deltaTime < 500)
			{
				var ctx = this.canvas.getContext();
				ctx.save();

				//Loop over entities to run their update method
				this.entities.forEach(function(entity)
				{
					entity.update(this.entities);
				}.bind(this));

				this.canvas.clear();
				ctx.translate(this.camera.x, this.camera.y);

				//Loop over entities to run their draw method
				this.entities.forEach(function(entity)
				{
					entity.draw(fabric, this.canvas);
				}.bind(this));

				ctx.restore();
			}

			this.animFrame = requestAnimationFrame(this._update.bind(this));
		}
	}

	Engine.Vec2 = function(x, y)
	{
		this.x = x;
		this.y = y;
	}
	Engine.Vec2.prototype =
	{
		"clone": function()
		{
			return new Engine.Vec2(this.x, this.y);
		},

		"set": function(vec)
		{
			this.x = vec.x;
			this.y = vec.y;
			return this;
		},

		"add": function(vec)
		{
			this.x += vec.x;
			this.y += vec.y;
			return this;
		},

		"sub": function(vec)
		{
			this.x -= vec.x;
			this.y -= vec.y;
		},

		"scale": function(n)
		{
			this.x *= n;
			this.y *= n;
			return this;
		},

		"divide": function(n)
		{
			this.x /= n;
			this.y /= n;
			return this;
		},

		"normalize": function()
		{
			var length = this.length();

			if (length == 0)
			{
				this.x = 0;
				this.y = 0;
			}
			else
			{
				this.x /= length;
				this.y /= length;
			}

			return this;
		},

		"dot": function(vec)
		{
			return (this.x * vec.x) + (this.y * vec.y);
		},

		"cross": function(vec)
		{
			return (this.x * vec.x) - (this.y * vec.y);
		},

		"length": function()
		{
			return Math.sqrt((this.x * this.x) + (this.y * this.y));
		}
	}

	Engine.PhysicsBody = function(engine, conf)
	{
		this.pos = new Engine.Vec2(conf.x, conf.y);
		this.vel = new Engine.Vec2(0, 0);
		this.force = new Engine.Vec2(0, 0);
		this.width = conf.width;
		this.height = conf.height;
		this.depth = conf.depth;
		this.density = conf.density;
		this.drag = conf.drag;
		this.friction = conf.friction;

		this.area = conf.width * conf.height;
		this.mass = this.width * this.height * this.depth * this.density;

		this.engine = engine;
	}
	Engine.PhysicsBody.prototype =
	{
		"applyForce": function(x, y)
		{
			this.force.x += x;
			this.force.y += y;
		},

		"impulse": function(x, y)
		{
			this.vel.x += x;
			this.vel.y += y;
		},

		"update": function()
		{
			var engine = this.engine;

			var dragScalar = 0.5 *
				engine.world.airDensity *
				this.vel.dot(this.vel) *
				this.drag *
				this.area;

			this.force.add(this.vel.clone().normalize().scale(-dragScalar));

			this.force.scale(1/this.mass);
			this.vel.add(this.force.scale(engine.deltaTime));
			this.pos.add(this.vel.clone().scale(engine.deltaTime));

			this.force.set({x: 0, y: 0});
		},

		"gravity": function()
		{
			this.applyForce(0, this.engine.world.gravity);
		},

		"applyFriction": function()
		{
			// |F| = k|Fn|
			var bounds = this.friction * this.engine.world.gravity;
			var friction = clamp(-this.vel.x, -bounds, bounds);
			this.impulse(friction / this.engine.deltaTime, 0);
		},

		"collidesWith": function(body)
		{
			return !(
				(this.pos.x > body.pos.x+body.width) ||
				(this.pos.x+this.width < body.pos.x) ||
				(this.pos.y > body.pos.y+body.height) ||
				(this.pos.y+this.height < body.pos.y)
			);
		},
	}
})();

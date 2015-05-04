// Generated by CoffeeScript 1.9.2
(function() {
  window.engine = new Engine("canvas", ["player", "platform"]);

  engine.keys = {
    up: 38,
    down: 40,
    left: 37,
    right: 39
  };

  engine.onprefabsloaded = function() {
    engine.spawn("player", {
      x: window.innerWidth / 5,
      y: window.innerHeight / 1.2 - 40
    });
    engine.spawn("platform", {
      x: 10,
      y: window.innerHeight - 30,
      width: window.innerWidth - 20,
      height: 20
    });
    return engine.start();
  };

}).call(this);

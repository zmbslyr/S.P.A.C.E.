var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 640,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

/* Global variables */
var game = new Phaser.Game(config);
var path;
var turrets;
var enemies;
var ENEMY_SPEED = 1 / 10000;
var BULLET_DAMAGE = 50;

// Matrix representing the map
var map = [
  [0,-1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0,-1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0,-1,-1,-1,-1,-1,-1,-1,-1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0,-1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0,-1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0,-1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0,-1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0,-1, 0]
];

/* Classes */
// Turret class to handle all turret functions
var Turret = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
  function Turret (scene) {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'turret1');
    this.nextTic = 0;
  },
  place: function (i, j) {
    this.y = i * 80 + 80 / 2;
    this.x = j * 80 + 80 / 2;
    map[i][j] = 1;
  },
  update: function (time, delta) {
    if (time > this.nextTic) {
      this.nextTic = time + 1000;
    }
  }
});

// Enemy class to handle all enemy functions
var Enemy = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
  function Enemy (scene) {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemy1');
    this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    this.hp = 0;
  },

  startOnPath: function () {
    this.follower.t = 0;
    this.hp = 100;
    path.getPoint(this.follower.t, this.follower.vec);
    this.setPosition(this.follower.vec.x, this.follower.vec.y);
  },

  receiveDamage: function (damage) {
    this.hp -= damage;

    if (this.hp <= 0) {
      this.setActive(false);
      this.setVisible(false);
    }
  },

  update: function (time, delta) {
    this.follower.t += ENEMY_SPEED * delta;
    path.getPoint(this.follower.t, this.follower.vec);
    this.setPosition(this.follower.vec.x, this.follower.vec.y);

    if (this.follower.t >= 1) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
});

// Preload all assets
function preload () {
  // Loads background image
  this.load.image('background', 'assets/sprites/background.png');
  this.load.image('turret1', 'assets/sprites/turret1.png');
  this.load.image('enemy1', 'assets/sprites/enemy1.png');
}

// Create game space
function create () {
  // Displays background image
  this.add.image(400, 320, 'background');

  // Set up graphics and draw grid on top of background
  var graphics = this.add.graphics();
  drawGrid(graphics);

  // Draw path for enemies to follow
  path = this.add.path(120, -32);
  path.lineTo(120, 200);
  path.lineTo(680, 200);
  path.lineTo(680, 640);
  graphics.lineStyle(3, 0xffffff, 1);
  path.draw(graphics);
  // Create enemies and spawn them
  enemies = this.add.group({ classType: Enemy, runChildUpdate: true });
  this.nextEnemy = 0;
  // Allows you to place turrets on the map
  turrets = this.add.group({ classType: Turret, runChildUpdate: true });
  this.input.on('pointerdown', placeTurret);
}

/**
 * drawGrid - Function to draw grid superficially
 * @graphics: Graphics obj
 *
 * Return: void
 */
function drawGrid (graphics) {
  graphics.lineStyle(1, 0x0000ff, 0.8);
  for (var index = 0; index < 8; index++) {
    graphics.moveTo(0, index * 80);
    graphics.lineTo(800, index * 80);
  }
  for (var index2 = 0; index2 < 10; index2++) {
    graphics.moveTo(index2 * 80, 0);
    graphics.lineTo(index2 * 80, 640);
  }
  graphics.strokePath();
}

/**
 * canPlaceTurret - Checks if you can place a turret on the map
 * @index: Inital matrix index
 * @index2: Inner matrix index
 *
 * Return: True (Success)
 */
function canPlaceTurret (index, index2) {
  return (map[index][index2] === 0);
}

/**
 * placeTurret - Function to place towes on map
 * @pointer: Place the pointer clicks
 *
 * Return: void
 */
function placeTurret (pointer) {
  var i = Math.floor(pointer.y / 80);
  var j = Math.floor(pointer.x / 80);
  if (canPlaceTurret(i, j)) {
    var turret = turrets.get();
    if (turret) {
      turret.setActive(true);
      turret.setVisible(true);
      turret.place(i, j);
    }
  }
}

/**
 * update - Function to update the game
 * @time:
 * @delta:
 *
 * Return: void
 */
function update (time, delta) {
  if (time > this.nextEnemy) {
    var enemy = enemies.get();
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.startOnPath();
      this.nextEnemy = time + 2000;
    }
  }
}

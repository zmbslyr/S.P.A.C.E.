var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 640,
  physics: {
    default: 'arcade'
  },
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
var bullets;
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
  fire: function () {
    var enemy = getEnemy(this.x, this.y, 200);
    if (enemy) {
      var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
      addBullet(this.x, this.y, angle);
      this.angle = (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;
    }
  },
  update: function (time, delta) {
    if (time > this.nextTic) {
      this.fire();
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

// Bullet class to create and manage bullets
var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
  function Bulet (scene) {
    Phaser.GameObjects.Image.call(this, scene, 0 ,0, 'bullet1');
    this.dx = 0;
    this.dy = 0;
    this.lifespan = 0;
    this.speed = Phaser.Math.GetSpeed(600, 1);
  },
  fire: function (x, y, angle) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setRotation(angle);

    this.dx = Math.cos(angle);
    this.dy = Math.sin(angle);

    this.lifespan = 300;
  },
  update: function (time, delta) {
    this.lifespan -= delta;

    this.x += this.dx * (this.speed * delta);
    this.y += this.dy * (this.speed * delta);

    if (this.lifespan <= 0) {
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
  this.load.image('bullet1', 'assets/sprites/bullet1.png');
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
  enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
  this.nextEnemy = 0;
  // Create and shoot bullets
  bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
  this.physics.add.overlap(enemies, bullets, damageEnemy);
  // Allows you to place turrets on the map
  turrets = this.add.group({ classType: Turret, runChildUpdate: true });
  this.input.on('pointerdown', placeTurret);
}

/**
 * addBullet - Allows turret to shoot bullets
 * @x: x coordinate
 * @y: y coordinate
 * @angle: Angle the bullet is facing
 *
 * Return: void
 */
function addBullet (x, y, angle) {
  var bullet = bullets.get();
  if (bullet) {
    bullet.fire(x, y, angle);
  }
}

/**
 * getEnemy - Finds the closest enemies distance
 * @x: x coordiante
 * @y: y coordinate
 * @distance: Distance to enemy
 *
 * Return - An enemy in the enemy pool (Success)
 */
function getEnemy (x, y, distance) {
  var enemyUnits = enemies.getChildren();
  for (var index = 0; index < enemyUnits.length; index++) {
    if (enemyUnits[index].active && Phaser.Math.Distance.Between(x, y, enemyUnits[index].x, enemyUnits[index].y) < distance) {
      return (enemyUnits[index]);
    }
    return (false);
  }
}

/**
 * damageEnemy - Damages enemy that bullet hits
 * @enemy: Enemy to hit
 * @bullet: Bullet to use
 *
 * Return: void
 */
function damageEnemy (enemy, bullet) {
  if (enemy.active === true && bullet.active === true) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.receiveDamage(BULLET_DAMAGE);
  }
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
 * @index: Initial matrix index
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

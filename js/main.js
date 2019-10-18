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

var game = new Phaser.Game(config);

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

// Turret class to handle all turret functions
var Turret = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
  function Turret (scene) {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'turret1');
  },
  place: function (i, j) {
    this.y = i * 80 + 80 / 2;
    this.x = j * 80 + 80 / 2;
    map[i][j] = 1;
  }
});

function preload () {
  // Loads background image
  this.load.image('background', 'assets/sprites/background.png');
  this.load.image('turret1', 'assets/sprites/turret1.png');
}

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

function update () {
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
  var i = Math.floor(pointer.y/80);
  var j = Math.floor(pointer.x/80);
  if (canPlaceTurret(i, j)) {
    var turret = turrets.get();
    if (turret) {
      turret.setActive(true);
      turret.setVisible(true);
      turret.place(i, j);
    }
  }
}

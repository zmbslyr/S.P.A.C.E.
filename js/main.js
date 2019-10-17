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

function preload () {
  // Loads background image
  this.load.image('background', 'assets/sprites/background.png');
}

function create () {
  // Displays background image
  this.add.image(400, 320, 'background');
  // Set up graphics and draw grid on top of background
  var graphics = this.add.graphics();
  drawGrid(graphics);
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

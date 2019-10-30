var config = {
  type: Phaser.AUTO,
  width: 1120,
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

function preload () {
  game.load.script('splash', 'js/')
}
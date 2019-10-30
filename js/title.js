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

//buttons
var startButton

function preload () {
    this.load.image('background', 'assets/sprites/background.png');
}
function create () {
    
}
function update () {
}
  

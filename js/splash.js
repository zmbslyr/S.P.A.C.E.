class Splash extends Phaser.scene {
  constructor () {
    super({ key: 'splash' });
  }

  create () {
    this.add.text(560, 320, 'S.P.A.C.E.');
    this.scene.start('game');
  }
}

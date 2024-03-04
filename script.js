// Arquivo de configurações gerais do jogo
var config = {
  type: Phaser.AUTO,
  width: 896,
  height: 512,
  backgroundColor: 0x39addd,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false,
    }
  },
  scene: [Fase1, Fase2],
}

// Cria uma instância do jogo, passando as configurações como parâmetro
var game = new Phaser.Game(config);

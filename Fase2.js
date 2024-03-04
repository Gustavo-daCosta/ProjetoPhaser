class Fase2 extends Phaser.Scene {
  constructor() {
    super({ key: 'Fase2' });
  }

  // Função que permite capturar os dados passados por outra cena
  init(data) {
    this.score = data;
  }

  // Função para carregar as imagens e spritesheets
  preload() {
    // Lista de caminhos do arquivos
    var filePaths = [
      './assets/map2.png',
      './assets/Terracota.png',
      './assets/Pedra.png',
      "./assets/Player/Idle.png",
      "./assets/Player/Run.png",
      "./assets/Player/Jump.png",
      './assets/End (Idle).png',
    ];

    // Objeto que permite padronizar o tamanho do frame
    var frameSize = {
      frameWidth: 32,
      frameHeight: 32,
    }
    
    this.load.image('map2', filePaths[0]);
    this.load.image('terra2', filePaths[1]);
    this.load.image('pedra', filePaths[2]);
    this.load.spritesheet("player_idle", filePaths[3], frameSize);
    this.load.spritesheet("player_run", filePaths[4], frameSize);
    this.load.spritesheet("player_jump", filePaths[5], frameSize);
    this.load.image('checkpoint2', filePaths[6]);
  }

  create() {
    var larguraJogo = 896;
    var alturaJogo = 512;

    this.add.image(896/2, 512/2, 'map2');
    this.cursors = this.input.keyboard.createCursorKeys();

    // Cria o jogador
    this.player = this.add.sprite(100, 300, "player_idle");
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Placar de quantas maçãs foram capturadas
    this.scoreText = this.add.text(larguraJogo - 200, 15, 'Apples: ' + this.score, { fontSize: '32px', fill: '#000' });

    // Cria o checkpoint final
    this.checkpoint = this.physics.add.sprite(larguraJogo/8, alturaJogo*.1, 'checkpoint2');

    // Cria as maçãs, dá um valor de bounce aleatório e inicia a animação de movimento
    this.apples = this.physics.add.group({
      key: "apple",
      repeat: 3,
      setXY: { x: 200, y: 0, stepX: 200 }
    });
    this.apples.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.6));
    });
    this.apples.getChildren().forEach((child) => {
      child.anims.play('apple_move', true);
    })

    // Cria as plataformas do chão
    this.chao = this.physics.add.staticGroup();
    for (var i = 16; i <= larguraJogo; i += 48) {
      this.chao.create(i, alturaJogo - 20, 'terra2');
    }

    // Conjunto de plataformas
    // São utilizados loops para facilitar o cálculo das posições de cada uma delas
    this.plataformas = this.physics.add.staticGroup();
    for (var i = 1; i < 6; i++) {
      this.plataformas.create(larguraJogo/1.8 + 48 * i, alturaJogo*.75, 'pedra');
    }
    for (var i = 6; i < 11; i++) {
      this.plataformas.create(larguraJogo/20 + 48 * i, alturaJogo / 2, 'pedra');
    }
    for (var i = 0; i < 5; i++) {
      this.plataformas.create(larguraJogo/8 + 48 * i, alturaJogo*.25, 'pedra');
    }
    for (var i = 1; i < 5; i++) {
      this.plataformas.create(larguraJogo - 48 * i, alturaJogo*.25, 'pedra');
    }

    // Adição das colisões e overlaps entre o jogador, o chão, as plataformas e as maçãs
    this.physics.add.collider([this.player, this.apples], this.chao);
    this.physics.add.collider([this.player, this.apples, this.checkpoint], this.plataformas);
    this.physics.add.overlap(this.player, this.apples, this.catchApple, null, this);
    this.physics.add.overlap(this.player, this.checkpoint, this.endGame, null, this);

    this.velocidade = 5;
  }

  // Função que permite o jogador capturar as maçãs
  catchApple(player, apple) {
    apple.disableBody(true, true);
    this.score += 1;
    this.scoreText.setText('Apples: ' + this.score);
  }

  // Função que mostra uma mensagem de parabéns e encerra o jogo
  endGame() {
    this.endText = this.add.text(100, 200, `Parabéns!! Você concluiu o jogo\n\n\nVocê capturou ${this.score} maçãs`, { fontSize: '32px', fill: '#000' });
    this.game.destroy();
  }

  update() {
    // Conjunto de condições para invocar a função correta
    // Funções unicamente relacionadas ao movimento do personagem

    if (this.chao) {
      this.pulando = false;
    }

    if (this.cursors.up.isDown && !this.pulando) {
      this.pular();
    }

    if (this.pulando) {
      this.cair();
    }

    if (this.cursors.right.isDown) {
      this.movimentarDireita();
      return;
    }

    if (this.cursors.left.isDown) {
      this.movimentarEsquerda();
      return;
    }

    if (!this.pulando) {
      this.player.anims.play('idle', true);
    }
  }

  // Função que executa tudo que é necessário para movimentar o personagem a direita
  movimentarDireita() {
    this.player.x += this.velocidade;
    this.player.setFlipX(false);

    if (!this.pulando) {
      this.player.anims.play('run', true);
    }
  }

  // Função que executa tudo que é necessário para movimentar o personagem a esquerda
  movimentarEsquerda() {
      this.player.x += -this.velocidade;
      this.player.setFlipX(true);
      if (!this.pulando) {
        this.player.anims.play('run', true);
      }
  }

  // Função que executa tudo que é necessário para movimentar o personagem para cima
  pular() {
    this.pulando = true;
    this.player.y -= 7;
    this.player.anims.play('jump', true);
  }

  // Função que executa tudo que é necessário para movimentar o personagem para baixo
  cair = () => this.player.anims.play('jump', true);
}
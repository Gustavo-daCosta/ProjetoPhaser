class Fase1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Fase1' });
  }

  // Função para carregar as imagens e spritesheets
  preload() {
    // Lista de caminhos do arquivos
    var filePaths = [
      './assets/map.png',
      './assets/Terra.png',
      './assets/Tijolo.png',
      "./assets/Player/Idle.png",
      "./assets/Player/Run.png",
      "./assets/Player/Jump.png",
      "./assets/Checkpoint.png",
      "./assets/Apple.png"
    ];

    // Objeto que permite padronizar o tamanho do frame
    var frameSize = {
      frameWidth: 32,
      frameHeight: 32,
    }
    
    this.load.image('map', filePaths[0]);
    this.load.image('terra', filePaths[1]);
    this.load.image('tijolo', filePaths[2]);
    this.load.spritesheet("player_idle", filePaths[3], frameSize);
    this.load.spritesheet("player_run", filePaths[4], frameSize);
    this.load.spritesheet("player_jump", filePaths[5], frameSize);
    this.load.spritesheet("checkpoint", filePaths[6], {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('apple', filePaths[7], frameSize);
  }

  create() {
    var larguraJogo = 896;
    var alturaJogo = 512;

    this.add.image(896/2, 512/2, 'map');
    this.cursors = this.input.keyboard.createCursorKeys();

    // Cria o jogador
    this.player = this.add.sprite(100, 300, "player_idle");
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Conjunto de plataformas
    // São utilizados loops para facilitar o cálculo das posições de cada uma delas
    this.plataformas = this.physics.add.staticGroup();
    this.plataformas.create(larguraJogo / 5, alturaJogo*.7, 'tijolo');
    for (var i = 1; i < 5; i++) {
      this.plataformas.create(larguraJogo / 5 + 48 * i, alturaJogo*.7, 'tijolo');
    }
    for (var i = 6; i < 11; i++) {
      this.plataformas.create(larguraJogo / 3 + 48 * i, alturaJogo / 1.8, 'tijolo');
    }
    this.plataformas.create(larguraJogo / 4, alturaJogo*.25, 'tijolo');
    for (var i = 1; i < 5; i++) {
      this.plataformas.create(larguraJogo / 4 + 48 * i, alturaJogo*.25, 'tijolo');
    }

    // Cria o checkpoint final
    this.checkpoint = this.physics.add.sprite(larguraJogo/4 + 48, alturaJogo*.1, 'checkpoint');

    // Cria as plataformas do chão
    this.chao = this.physics.add.staticGroup();
    for (var i = 16; i <= larguraJogo; i += 48) {
      this.chao.create(i, alturaJogo - 20, 'terra');
    }

    // Cria as maçãs, dá um valor de bounce aleatório e inicia a animação de movimento
    this.apples = this.physics.add.group({
      key: "apple",
      repeat: 2,
      setXY: { x: 350, y: 0, stepX: 150 }
    });

    this.apples.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.6));
    });

    // Placar de quantas maçãs foram capturadas
    this.score = 0;
    this.scoreText = this.add.text(larguraJogo - 200, 15, 'Apples: ' + this.score, { fontSize: '32px', fill: '#000' });

    this.velocidade = 5;

    // Cria as animações do personagem, da maçã e do checkpoint
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player_idle", { start: 0, end: 10 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player_run", { start: 0, end: 11 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("player_jump", { start: 0, end: 0}),
      frameRate: 10,
      repeat: -1,
    });
    
    this.anims.create({
      key: "flag",
      frames: this.anims.generateFrameNumbers("checkpoint", { start: 0, end: 9}),
      frameRate: 10,
      repeat: -1,
    });
    this.checkpoint.anims.play('flag', true);

    this.anims.create({
      key: 'apple_move',
      frames: this.anims.generateFrameNumbers("apple", { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });
    this.apples.getChildren().forEach((child) => {
      child.anims.play('apple_move', true);
    })

    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Adiciona as colisões e overlaps no jogador, nas maçãs, nas plataformas, no chão e no checkpoint
    this.physics.add.collider([this.player, this.apples], this.chao);
    this.physics.add.collider([this.player, this.apples, this.checkpoint], this.plataformas);
    this.physics.add.overlap(this.player, this.apples, this.catchApple, null, this);
    this.physics.add.collider(this.player, this.checkpoint, this.collisionCallback, null, this);
  }

  // Função que faz a transição entre as cenas, além de passar a pontuação
  collisionCallback = () => this.scene.start('Fase2', this.score);

  // Função que permite o jogador capturar as maçãs
  catchApple(player, apple) {
    apple.disableBody(true, true);
    this.score += 1;
    this.scoreText.setText('Apples: ' + this.score);
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

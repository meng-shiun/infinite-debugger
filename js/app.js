// Enemy
class Enemy {

  constructor(locX, locY) {
    // The image/sprite for our enemies, this uses a helper we've provided to easily load images
    this.x = locX;
    this.y = locY;
    this.width = 64;
    this.height = 20;
    this.speed = gameMaster.levelSpeed();

    this.sprite = 'images/enemy-bug.png';
  }

  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt, level = 1) {
    // Multiply any movement by the dt parameter to ensure the game runs at the same speed for all computers.
    // Random speed change according to the level
    this.x += this.speed * dt;

    if (this.x > 1000) {
      // Respawn enemy postiion & speed
      this.x = gameMaster.getRandomX();
      this.y = gameMaster.getRandomY();
      this.speed = gameMaster.levelSpeed();
    }
    // console.log('enemy position: ', this.x, this.y);
    this.checkCollisions();
  }

  checkCollisions() {

    if (this.x + this.width > player.x && this.x - this.width < player.x
      && this.y + this.height > player.y && this.y - this.height < player.y) {

        // Show blood stain
        let blood = new Decals(player.x, player.y);
        allDecals.push(blood);
        gameMaster.isPlayerDead = true;
        // Respawn player
        player.respawn();
      }
    }

    // Draw the enemy on the screen, required method for game
    render() {
      ctx.drawImage(Resources.get(this.sprite), this.x, this.y)
    }
  }

  // Player
  class Player {

    constructor(locX, locY) {
      this.sprite = 'images/char-boy.png';
      this.x = locX;
      this.y = locY;
    }

    respawn() {
      // Hide player off screen
      this.x = 200;
      this.y = 800;

      setTimeout(() => {
        // respawn point
        this.x = 404;
        this.y = 460;
        gameMaster.isPlayerDead = false;
      }, 1000);
    }

    update() {

    }

    render() {
      ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    handleInput(keyInput) {

      switch (keyInput) {
        case 'left':
        this.x < 101 ? this.x = this.x : this.x -= 101;
        break;
        case 'up':
        this.y < 0 ? this.y = this.y : this.y -= 83;
        break;
        case 'right':
        this.x > 707 ? this.x = this.x : this.x += 101;
        break;
        case 'down':
        this.y > 440 ? this.y = this.y : this.y += 83;
      }
    }
  }


  // Decals (blood stain, trap, etc...)
  class Decals {

    constructor(posX, posY) {
      this.x = posX;
      this.y = posY;
      this.sprite = 'images/blood.png';
    }

    render() {
      ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
  }

  const player = new Player(404, 460);

  let allEnemies = [];
  let allDecals = [];

  // Game Master, control enemies, score, health, gems, levels...
  class GameMaster {

    constructor() {
      this.isPlayerDead = false;

      // TODO: when player's life is less than 0, game over
      this.gameOver = false;
    }

    generateEnemies(num) {
      this.randomX = () => -(Math.floor(Math.random() * 500));

      const positionY = [60, 144, 228, 312, 396];

      this.randomY = () => {
        let ind = Math.floor(Math.random() * positionY.length);
        return positionY[ind];
      }

      for (let i = 0; i < num; i++) {
        let enemy = new Enemy(this.randomX(), this.randomY());
        allEnemies.push(enemy);
      }

    }

    // Increse speed for next level
    levelSpeed() {
      this.randomSpeed = Math.floor(Math.random() * 140) + 140;
      return this.randomSpeed;
    }

    getRandomX() {
      return this.randomX();
    }

    getRandomY() {
      return this.randomY();
    }

    update() {

    }

    render() {

    }

  }


  // TODO: Start game when press spacebar
  let gameMaster = new GameMaster();
  gameMaster.generateEnemies(6);

  // This listens for key presses and sends the keys to Player.handleInput() method
  document.addEventListener('keydown', function(e) {

    if (gameMaster.isPlayerDead) return;

    var allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
  });

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
        // Update player's lives
        gameMaster.updateLives();
      }
    }

    // Draw the enemy on the screen, required method for game
    render() {
      ctx.drawImage(Resources.get(this.sprite), this.x, this.y)
    }
  }

  // Player
  class Player {

    constructor() {
      this.sprite = 'images/char-boy.png';
      this.x = 404;
      this.y = 460;
    }

    respawn() {
      // Hide player off screen
      this.hide();

      setTimeout(() => {
        // respawn point
        this.init();
        gameMaster.isPlayerDead = false;
      }, 1000);
    }

    hide() {
      this.x = 200;
      this.y = 800;
    }

    init() {
      this.x = 404;
      this.y = 460;
    }

    update() {

    }

    render() {
      ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    handleInput(keyInput) {
      console.log(this.x, this.y);
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

  // Key required for door to enter next level
  class Key {

    constructor() {
      this.sprite = 'images/key.png';
    }

    setKey(posX, posY) {
      this.x = posX;
      this.y = posY;
    }

    hideKey() {
      this.x = 200;
      this.y = 800;
    }

    update() {
      this.checkCollisions();
    }

    render() {
      ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    checkCollisions() { // If player pick up the key
      if (this.x === player.x && this.y === player.y) {
        // hide the key and look for door
        gameMaster.isPlayerGetKey = true;
      }
    }
  }

  class Door {

    constructor() {
      this.isShown = true;
      this.sprite = 'images/door.png';
    }

    setDoor(posX, posY) {
      this.x = posX;
      this.y = posY;
    }

    hideDoor() {
      this.isShown = false;
    }

    showDoor() {
      this.isShown = true;
    }

    update() {
      if (!this.isShown) return;
      this.checkCollisions();
    }

    render() {
      if (!this.isShown) return;
      ctx.drawImage(Resources.get(this.sprite), this.x , this.y);
    }

    checkCollisions() { // If player pick up the key & reach the door
      if (this.x === player.x && this.y === player.y && gameMaster.isPlayerGetKey) {
        // hide the door and go to next level
        gameMaster.isPlayerGetDoor = true;
        console.log('level complete');
      }
    }
  }

  let key = new Key();
  let door = new Door();

  let player = new Player();

  let allEnemies = [];
  let allDecals = [];

  // Game Master, controls enemies, score, health, gems, levels, key & door
  class GameMaster {

    constructor() {
      this.isPlayerDead = false;
      this.playerLives = 3;
      this.isGameStart = false;
      this.isGameover = false;
      // All characters to select
      const chars = document.querySelectorAll('.char');
      this.characters = [];
      for (const c of chars) {
        this.characters.push(c);
      }
      this.charInd = 1;
      this.isPlayerGetKey = false;
      this.isPlayerGetDoor = false;
    }

    choosePlayer(num) {

      this.charInd += num;
      this.charSelected = this.characters[this.charInd];

      this.characters.forEach(el => el.parentNode.querySelector('.selector').innerHTML = '');

      let currentChar = this.characters[this.charInd].parentNode.querySelector('.selector');

      const imgContent = `<img src="images/Selector.png">`;

      // Add selector on selected player
      currentChar.innerHTML = imgContent;
      // Update selected player
      player.sprite = this.selectedPlayer();
    }

    selectedPlayer() {
      player.sprite = this.characters[this.charInd].querySelector('img').getAttribute('src');
      return player.sprite;
    }

    init() {
      this.playerLives = 3;
      this.isGameover = false;
      player.init();
      allEnemies = [];
      allDecals = [];
    }

    generateKey() {
      let randomX = Math.floor(Math.random() * 9) * 101;
      let randomY = Math.floor(Math.random() * 7) * 83 - 38;
      randomY = (randomY == -38) ? 45 : (randomY == 460) ? 377 : randomY;
      console.log('Key postion: ', randomX, randomY);
      key.setKey(randomX, randomY);
    }

    generateDoor() {
      let randomX = Math.floor(Math.random() * 9) * 101;
      door.setDoor(randomX, -38);

      setTimeout(() => {
        door.showDoor();
      }, 1200);
    }

    updateLives() {
      this.playerLives--;

      if (this.playerLives < 1) {
        this.isGameover = true;
      }
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
      // Reset game when game over
      document.querySelector('#lives').innerHTML = this.playerLives;
      if (this.isGameover) {
        this.gameOver();
      }

      // Detect if player get the key
      this.isPlayerGetKey ? key.hideKey() : false;
      // Detect if player get the door with key
      // If true, reset player's postion and go to next level
      if (this.isPlayerGetDoor) {
        this.isPlayerGetKey = false;
        this.isPlayerGetDoor = false;
        
        door.hideDoor();
        this.generateKey();
        this.generateDoor();
        player.respawn();
      }

    }

    gameOver() {
      gameOverModal.style.display = 'block';
      player.hide();
    }

  }

  let gameMaster = new GameMaster();

  const gameOverModal = document.querySelector('.gameover-modal');
  const gameStartMenu = document.querySelector('.start-menu');


  document.addEventListener('keydown', function(e) {

    if (gameMaster.isPlayerDead || gameMaster.isGameover || gameMaster.isPlayerGetDoor) return;

    var allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };

    // Game start menu
    if (!gameMaster.isGameStart) {
      if (e.keyCode === 32) {
        gameStartMenu.style.display = 'none';
        gameMaster.isGameStart = true;
        gameMaster.generateEnemies(6);
        gameMaster.generateKey();
        gameMaster.generateDoor();
      } else if (e.keyCode === 37) { // select left hand player
        gameMaster.charInd <= 0 ? false : gameMaster.choosePlayer(-1);
      } else if (e.keyCode === 39) { // select right hand player
        gameMaster.charInd >= 2 ? false : gameMaster.choosePlayer(1);
      }

      return;
    }

    player.handleInput(allowedKeys[e.keyCode]);

  });


// Replay & reset game
gameOverModal.addEventListener('click', function(e) {
  this.style.display = 'none';
  gameStartMenu.style.display = 'block';
  gameMaster.isGameover = false;
  gameMaster.isGameStart = false;
  gameMaster.init();
});

class Entities {

  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.isShown = true;
  }

  update() {
    if (!this.isShown) return;
  }

  // Draw entities on the screen, required method for game
  render() {
    if (!this.isShown) return;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y)
  }
}


class Enemy extends Entities {

  constructor(x, y, sprite) {
    // The image/sprite for our enemies, this uses a helper we've provided to easily load images
    super(x, y, sprite);
    this.width = 64;
    this.height = 20;
    this.speed = gameMaster.levelSpeed();
  }

  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt) {
    // Multiply any movement by the dt parameter to ensure the game runs at the same speed for all computers.
    // Random speed change according to the level
    this.x += this.speed * dt;

    if (this.x > 1000) {
      // Respawn enemy position & set speed
      this.x = gameMaster.enemyRandomX();
      this.y = gameMaster.enemyRandomY();
      this.speed = gameMaster.levelSpeed();
    }
  }

  checkCollisions() {

    if (this.x + this.width > player.x && this.x - this.width < player.x
    && this.y + this.height > player.y && this.y - this.height < player.y) {

        // Show blood stain
        let blood = new Decals(player.x, player.y, 'images/blood.png');
        allDecals.push(blood);
        gameMaster.isPlayerDead = true;
        // Respawn player
        player.respawn();
        // Update player's lives
        gameMaster.updateLives();

        new Audio('sound/hit.mp3').play();
      }
    }

  }

  class Player extends Entities {

    constructor(x, y, sprite) {
      super(x, y, sprite);
    }

    respawn() {
      // Hide player off screen
      this.hide();

      setTimeout(() => {
        // respawn point
        this.init();
        gameMaster.isPlayerDead = false;
      }, 600);
    }

    hide() {
      this.x = 200;
      this.y = 800;
    }

    init() {
      this.x = 404;
      this.y = 460;
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

      new Audio('sound/move.mp3').play();
    }
  }


  // Decals (blood stain)
  class Decals extends Entities {

    constructor(x, y, sprite) {
      super(x, y, sprite);
    }
  }

  // Key required for door to enter next level
  class Key extends Entities {

    constructor(sprite) {
      super();
      this.sprite = sprite;
      this.isSoundPlayed = false;
    }

    checkCollisions() {
      // If player pick up the key, hide the key and look for door
      if (this.x === player.x && this.y === player.y) {
        gameMaster.isPlayerGetKey = true;
        this.playSound();
      }
    }

    playSound() {
      if (!this.isSoundPlayed) {
        new Audio('sound/pickup.mp3').play();
        this.isSoundPlayed = true;
      }
    }
  }


  class Door extends Entities {

    constructor(sprite) {
      super();
      this.sprite = sprite;
    }

    hideDoor() {
      this.isShown = false;
    }

    showDoor() {
      this.isShown = true;
    }

    checkCollisions() { // If player pick up the key & reach the door
      if (this.x === player.x && this.y === player.y && gameMaster.isPlayerGetKey) {
        // hide the door and go to next level
        gameMaster.isPlayerGetDoor = true;
      }
    }
  }

  class Pickup extends Entities {

    constructor(x, y, sprite, value) {
      super(x, y, sprite);
      this.shown = true;
      this.value = value;
      this.isSoundPlayed = false;
    }

    update() {
      // Stop adding value when it's invisible
      gameMaster.isBonusAdded = this.shown ? false : true;
    }

    checkCollisions() {
      if (player.x === this.x && player.y == this.y) {
        this.shown = false;
        // Add bonus when the item is picked
        gameMaster.updateBonus(this.value);

        this.playSound();
      }
    }

    render() {
      if (!this.shown) return;
      ctx.drawImage(Resources.get(this.sprite), this.x , this.y);
    }

    playSound() {
      if (!this.isSoundPlayed) {
        new Audio('sound/pickup.mp3').play();
        this.isSoundPlayed = true;
      }
    }
  }

  let key = new Key('images/key.png');
  let door = new Door('images/door.png');

  let player = new Player(404, 460, 'images/char_01.png');

  let allEnemies = [];
  let allDecals = [];
  let allPickup = [];

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
      this.level = 0;
      this.money = 0;
      this.bonus = 0;
      this.isBonusAdded = false;
      this.heartSlots = document.querySelector('.stat-heart').children;
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
      this.isGameStart = false;
      this.isPlayerGetKey = false;
      player.init();
      this.level = 0;
      this.money = 0;
      this.bonus = 0;
      for (let heart of this.heartSlots) {
        heart.src = 'images/heart-full.png';
      }
      allEnemies = [];
      allPickup = [];
      allDecals = [];

      document.querySelector('.gameover-modal').style.display = 'none';
      document.querySelector('.start-menu').style.display = 'block';
    }

    generateKey() {
      let randomX = Math.floor(Math.random() * 9) * 101;
      let randomY = () => {
        let y = Math.floor(Math.random() * 7) * 83 - 38;
        if (y === -38 || y === 460) return randomY();
        return y;
      }

      key.x = randomX;
      key.y = randomY();
      key.isSoundPlayed = false;
    }

    generateDoor() {
      let randomX = Math.floor(Math.random() * 9) * 101;
      door.x = randomX;
      door.y = -38;

      setTimeout(() => {
        door.showDoor();
      }, 500);
    }

    updateLives() {
      this.playerLives--;

      // update heart image
      this.heartSlots[this.playerLives].src = 'images/heart-empty.png';

      if (this.playerLives < 1) {
        this.isGameover = true;
        this.playSound();
      }
    }

    playSound() {
      new Audio('sound/gameover.mp3').play();
    }

    updateBonus(val) {
      if (!this.isBonusAdded) {
        this.isBonusAdded = true;
        this.bonus += val;
      }
    }

    generateEnemies(num) {
      const positionY = [60, 144, 228, 312, 396];

      this.enemyRandomX = () => -(Math.floor(Math.random() * 400));
      this.enemyRandomY = () => {
        let ind = Math.floor(Math.random() * positionY.length);
        return positionY[ind];
      }

      for (let i = 0; i < num; i++) {
        let enemy = new Enemy(this.enemyRandomX(), this.enemyRandomY(), 'images/enemy-bug.png');
        allEnemies.push(enemy);
      }
    }


    generatePickup() {
      let takenY = []; // temp array to store taken y slot

      let randomX = () => Math.floor(Math.random() * 9) * 101;
      let randomY = () => {
        let y = Math.floor(Math.random() * 7) * 83 - 38;

        // Avoid taking the same position from key
        if (y === -38 || y === 460 || (y === key.y && randomX() === key.x) || takenY.indexOf(y) > -1) {
          return randomY();
        }
        takenY.push(y);
        return y;
      }

      let pickupA = new Pickup(randomX(), randomY(), 'images/pickup_01.png', 50);
      let pickupB = new Pickup(randomX(), randomY(), 'images/pickup_02.png', 10);
      let pickupC = new Pickup(randomX(), randomY(), 'images/pickup_03.png', 30);

      let pickupArr = [pickupA, pickupB, pickupC];

      let randomAmount = Math.floor(Math.random() * pickupArr.length) + 1;

      // Randomize pickup quantity
      for (let i = 0 ; i < randomAmount; i++) allPickup.push(pickupArr[i])
    }

    levelSpeed() {
      let level = this.level;
      this.randomSpeed = Math.floor(Math.random() * 60) + 40 * (level / 10) + 80;
      return this.randomSpeed;
    }

    update() {
      // Reset game when game over
      document.querySelector('#lives').innerHTML = this.playerLives;

      if (this.isGameover) this.gameOver();

      document.querySelector('#level').textContent = this.level; // Current level
      document.querySelector('#money').textContent = this.money; // Current money
      document.querySelector('#bonus').textContent = this.bonus; // Current bonus

      // Detect if player get the key
      this.isPlayerGetKey ? key.isShown = false : key.isShown = true;

      // Detect if player get the door with key
      // If true, reset player's postion and go to next level
      if (this.isPlayerGetDoor) {
        this.isPlayerGetKey = false;
        this.isPlayerGetDoor = false;

        door.hideDoor();
        this.generateKey();
        this.generateDoor();
        allPickup = [];
        this.generatePickup();
        player.respawn();

        this.level += 1;
        this.money += 100;

        // Add extra enemy every 3 levels
        this.level % 3 === 0 ? this.generateEnemies(1) : false;
      }
    }

    gameStart() {
      gameMaster.isGameStart = true;
      gameMaster.generateEnemies(5);
      gameMaster.generateKey();
      gameMaster.generateDoor();
      gameMaster.generatePickup();
    }

    gameOver() {
      // Show result
      gameOverModal.querySelector('.salary-score').textContent = '$' + (this.money + this.bonus);
      gameOverModal.querySelector('.level-score').textContent = this.level;

      let msg = gameOverModal.querySelector('.message');

      if (this.level >= 40) {
        msg.textContent =  `Legendary developer.`;
      } else if (this.level >= 30) {
        msg.textContent =  `You're a rock star.`;
      } else if (this.level >= 15) {
        msg.textContent =  `Senior developer.`;
      } else if (this.level >= 4) {
        msg.textContent =  `Junior developer.`;
      } else {
        msg.textContent =  `You're fired.`;
      }

      gameOverModal.style.display = 'block';

      player.hide();
    }

  }

  let gameMaster = new GameMaster();

  const gameOverModal   = document.querySelector('.gameover-modal');
  const gameStartMenu   = document.querySelector('.start-menu');
  const showInstruction = document.querySelector('.instruction');

  document.addEventListener('keydown', function(e) {
    if (gameMaster.isPlayerDead || gameMaster.isPlayerGetDoor) return;

    var allowedKeys = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };


    // Game start/ player selection menu
    if (!gameMaster.isGameStart) {

      if (e.keyCode === 32) { // press space
        gameStartMenu.style.display = 'none';
        showInstruction.style.display = 'none';
        gameMaster.gameStart();
      } else if (e.keyCode === 37) { // select left hand player
        gameMaster.charInd <= 0 ? false : gameMaster.choosePlayer(-1);
      } else if (e.keyCode === 39) { // select right hand player
        gameMaster.charInd >= 2 ? false : gameMaster.choosePlayer(1);
      }

      return;
    }

    // Game over menu
    (gameMaster.isGameover && e.keyCode === 32) ? gameMaster.init() : false;

    player.handleInput(allowedKeys[e.keyCode]);
  });


  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('open')) { // Open instruction menu
      showInstruction.style.display = 'block';
      gameStartMenu.style.display = 'none';
    } else if (e.target.classList.contains('close')){ // Close instruction menu
      showInstruction.style.display = 'none';
      gameStartMenu.style.display = 'block';
    } else if (e.target.classList.contains('replay')) { // Replay & reset game
      gameMaster.init();
    }
  });

  document.addEventListener('mouseover', function(e) {
    let target = e.target.classList;
    let parent = e.target.parentNode;
    if (target.contains('open') && parent.querySelector('svg').classList.contains('gameplay') ||
        target.contains('close') && parent.querySelector('svg').classList.contains('gameplay')) {
        parent.querySelector('.gameplay').classList.add('active');
    }
  });

  document.addEventListener('mouseout', function(e) {
    let target = e.target.classList;
    let parent = e.target.parentNode;
    if (target.contains('open') && parent.querySelector('svg').classList.contains('gameplay') ||
        target.contains('close') && parent.querySelector('svg').classList.contains('gameplay')) {
        parent.querySelector('.gameplay').classList.remove('active');
    }
  });

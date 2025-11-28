// Chek if the browser supports tactile events
if ('ontouchstart' in window) {
    document.body.classList.add('tactile');
}

// Front screen canvas
var canvas = document.getElementById('spaceinvaders');
var ctx = canvas.getContext("2d");

// Off screen canvas
var offScreenCanvas = document.createElement("canvas");
offScreenCanvas.width = canvas.width;
offScreenCanvas.height = canvas.height;
var offscreenctx = offScreenCanvas.getContext("2d", { willReadFrequently: false });

const spr_list = [
    './assets/img/invader01.png',
    './assets/img/invader02.png',
    './assets/img/invader03.png',
    './assets/img/explode.png',
    './assets/img/tourelle.png',
    './assets/img/missileup.png',
    './assets/img/missiledown.png',
    './assets/img/bunker.png'
];

const sprite01 = new Image();
sprite01.src = spr_list[0];

const sprite02 = new Image();
sprite02.src = spr_list[1];

const sprite03 = new Image();
sprite03.src = spr_list[2];

const explode = new Image();
explode.src = spr_list[3];

const cannon = new Image();
cannon.src = spr_list[4];

const missileup = new Image();
missileup.src = spr_list[5];

const missiledown = new Image();
missiledown.src = spr_list[6];

const bunker = new Image();
bunker.src = spr_list[7];

let framenb = 0;
let heat = 0;

let x = 0;
let y = 0;
let stepx = 1;
let stepy = 5;
let level = 0;
let isPlaying = false;
let gameOver = false;
let hitcannon = false;

let cannonpos = 0;

let invaders = [];
let bullets = [];

let pressedKeys = {
    left: 0,
    right: 0,
    fire: 0,
};

function newLevel(reset) {
    if (reset) {
        level = 0;
    }
    else {
        level++;
    }

    stepx = (level + 1) / 2.0;

    heat = 0;
    hitcannon = false;

    x = 0;
    y = 0;

    invaders = [
        [2, 2, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3]];

    bullets = [];

    // Redraw the bunkers
    offscreenctx.clearRect(0, 0, canvas.width, canvas.height);
    const steps = canvas.width / 4;

    offscreenctx.drawImage(bunker, steps - 64, canvas.height - 70);
    offscreenctx.drawImage(bunker, 2 * steps - 32, canvas.height - 70);
    offscreenctx.drawImage(bunker, 3 * steps, canvas.height - 70);

    // reset the cannon position
    cannonpos = canvas.width / 2;

    document.getElementById("gamestatus").innerHTML = 'Get ready for level ' + level;
}

function canStep(step) {
    let canmove = true;
    let lost = false;
    let count = 0;
    let removedbullets = 0;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 5; j++) {
            if (invaders[j][i]) {
                count++;
                let posx = 32 * i + x + step;
                let posy = 24 * j + y + stepy;

                if ((posx + 32 >= canvas.width) || (posx < 0))
                    canmove = false;

                // Invasion is done
                if ((posy + 24) >= (canvas.height - 60)) {
                    lost = true;
                }

                // Collision tests
                for (let k = 0; k < bullets.length; k++) {
                    if (((bullets[k][0] > posx) && (bullets[k][0] < (posx + 32))) &&
                        ((bullets[k][1] > posy) && (bullets[k][1] < (posy + 24)))) {
                        invaders[j][i] = 16;
                        bullets[k][1] = 0;
                        removedbullets++;
                    }
                }
            }
        }
    }

    // Remove the bullets that hit the invaders
    if (removedbullets > 0) {
        bullets = bullets.filter((bullet) => bullet[1] > 0);
    }

    if (count === 0) {
        newLevel(false);
    }

    if (lost) {
        gameOver = true;
        isPlaying = false;
        document.getElementById("gamestatus").innerHTML = 'You failed, invasion is complete !';
        playButton.value = "Play Game";
    }

    return canmove;
}

function displayState(text) {
    // Set the font properties
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';

    // Get the width of the text
    const width = ctx.measureText(text).width;

    // Calculate the position of the text (centered)
    const posx = (canvas.width - width) / 2;
    const posy = (canvas.height) / 2;

    // Draw text with stroke
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 5;
    ctx.strokeText(text, posx, posy);

    // Draw the text
    ctx.fillText(text, posx, posy);
}

function animateInvaders() {
    framenb++;
    if (framenb >= 16) {
        framenb = 0;
    }

    if (canStep(stepx))
        x += stepx;
    else {
        stepx = -stepx;
        y += stepy;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw invaders grid
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 5; j++) {
            if (invaders[j][i] == 1)
                ctx.drawImage(sprite01, x + 32 * i, y + 24 * j);
            else if (invaders[j][i] == 2)
                ctx.drawImage(sprite02, x + 32 * i, y + 24 * j);
            else if (invaders[j][i] == 3)
                ctx.drawImage(sprite03, x + 32 * i, y + 24 * j);
            else if (invaders[j][i] > 10) {
                ctx.drawImage(explode, x + 32 * i, y + 24 * j);
                invaders[j][i]--;
            }
            else if (invaders[j][i] == 10)
                invaders[j][i] = 0;
        }
    }

    // Animation of the bullets
    let removedbullets = 0
    for (let i = 0; i < bullets.length; i++) {
        let newbulletpos = bullets[i][1] + bullets[i][2];
        if ((newbulletpos > 0) && (newbulletpos < canvas.height)) {
            if (bullets[i][2] < 0)
                ctx.drawImage(missileup, bullets[i][0] - 1, newbulletpos - 3);
            else if (bullets[i][2] > 0)
                ctx.drawImage(missiledown, bullets[i][0] - 1, newbulletpos - 3);

            bullets[i][1] = newbulletpos;
        }
        else {
            bullets[i][1] = 0;
            removedbullets++;
        }
    }

    // Remove the bullets that are out of the screen
    if (removedbullets > 0) {
        bullets = bullets.filter((bullet) => bullet[1] > 0);
    }

    if (isPlaying && (framenb == 0)) {
        // Invaders fire
        let posx = 0;
        let posy = 0;

        for (let i = 0; i < 8; i++) {
            let maxj = -1;
            for (let j = 0; j < 5; j++) {
                if (invaders[j][i]) {
                    maxj = j;
                    posx = 32 * i + Math.floor(x) + 16;
                    posy = 24 * j + y + 24 + 7;
                }
            }

            if (maxj >= 0) {
                if (Math.random() < 0.1) {
                    let newbullet = [posx, posy, 3];
                    bullets.push(newbullet);

                    ctx.drawImage(missiledown, posx - 1, posy - 3);
                }
            }
        }
    }

    // Draw the bunkers destructed by bullets
    let imageData = offscreenctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    removedbullets = 0;

    for (let nb = 0; nb < bullets.length; nb++) {
        let xPos = bullets[nb][0];
        let yPos = bullets[nb][1];

        let offset = 4 * (yPos * canvas.width + xPos);

        if (yPos > 0) {
            let hit = false;

            for (let i = -2; i <= 2; i++) {
                if (data[offset + 4 * i + 3] != 0)
                    hit = true;
            }

            if (hit) {
                for (let i = -2; i <= 2; i++) {
                    for (let j = -3; j <= 3; j++) {
                        data[offset + 4 * (j * canvas.width + i) + 3] = 0;
                    }
                }

                bullets[nb][1] = 0;
                removedbullets++;
            }
        }
    }

    offscreenctx.putImageData(imageData, 0, 0);

    // Remove the bullets that exploded the bunkers
    if (removedbullets > 0) {
        bullets = bullets.filter((bullet) => bullet[1] > 0);
    }

    ctx.drawImage(offScreenCanvas, 0, 0);

    // Check if bullets hit the cannon
    for (let i = 0; i < bullets.length; i++) {
        if ((bullets[i][0] > (cannonpos - 8)) && (bullets[i][0] < (cannonpos + 8)) &&
            (bullets[i][1] > (canvas.height - 24)) && (bullets[i][1] < canvas.height)) {
            hitcannon = true;
            bullets[i][1] = 0;
        }
    }

    // Draw cannon heat level
    let level = (canvas.width - 20) * Math.min(1000, heat) / 1000;
    ctx.beginPath();
    ctx.moveTo(10, canvas.height - 5);
    ctx.lineTo(10 + level, canvas.height - 5);
    ctx.stroke();

    if ((heat > 1000) || (hitcannon))
        ctx.drawImage(explode, cannonpos - 16, canvas.height - 24);
    else
        ctx.drawImage(cannon, cannonpos - 16, canvas.height - 24);

    if (isPlaying) {
        if (hitcannon) {
            gameOver = true;
            isPlaying = false;
            document.getElementById("gamestatus").innerHTML = '<div style="color: red;">Cannon was hit, you failed !</div>';
            playButton.value = "Play Game";
        }

        if (heat < 10)
            heat = 0;
        else if (heat > 1000) {
            gameOver = true;
            isPlaying = false;
            document.getElementById("gamestatus").innerHTML = '<div style="color: red;">Gun explosion due to heat, you failed !</div>';
            playButton.value = "Play Game";
        }
        else {
            heat -= 10;
        }


        if ((framenb & 1) == 1) {
            if (pressedKeys["left"]) {
                doGoLeft();
            }
            if (pressedKeys["right"]) {
                doGoRight();
            }
        }

        if ((framenb & 7) == 7) {
            if (pressedKeys["fire"]) {
                doFire();
            }
        }
    }

    if (isPlaying) {
        // Request the next frame
        requestAnimationFrame(animateInvaders);
    }
    else {
        if (gameOver) {
            displayState('GAME OVER !');
        }
        else {
            displayState('GET READY !');
        }
    }
}

/* Wait for every sprite is Loaded */

let loaded = 0;
const toload = spr_list.length;

function checkEverythingLoaded() {
    loaded++;
    if (loaded == toload) {
        newLevel(true);
        animateInvaders();
    }
}

sprite01.onload = function () {
    checkEverythingLoaded();
};

sprite02.onload = function () {
    checkEverythingLoaded();
};

sprite03.onload = function () {
    checkEverythingLoaded();
};

explode.onload = function () {
    checkEverythingLoaded();
};

cannon.onload = function () {
    checkEverythingLoaded();
}

missileup.onload = function () {
    checkEverythingLoaded();
}

missiledown.onload = function () {
    checkEverythingLoaded();
}

bunker.onload = function () {
    checkEverythingLoaded();
}

/* Animate functions */

function doGoLeft() {
    if (isPlaying) {
        if (cannonpos >= (4 + 8))
            cannonpos -= 4;
    }
}

function doGoRight() {
    if (isPlaying) {
        if (cannonpos <= (canvas.width - 4 - 8))
            cannonpos += 4;
    }
}

function doFire() {
    if (isPlaying) {
        let posx = cannonpos;
        let posy = canvas.height - 24;
        let newbullet = [posx, posy, -3];

        bullets.push(newbullet);

        heat += 100;
    }
}

function doPlayPause() {
    if (!isPlaying) {
        isPlaying = true;

        if (gameOver) {
            gameOver = false;
            newLevel(true);
        }

        playButton.innerText = "Pause";

        // Start the animation
        requestAnimationFrame(animateInvaders);
    }
    else {
        isPlaying = false;
        playButton.innerText = "Play";
    }
}

document.body.addEventListener("keydown", (ev) => {
    if (ev.key == "ArrowLeft") {
        pressedKeys["left"] = 1;
    }
    else if (ev.key == "ArrowRight") {
        pressedKeys["right"] = 1;
    }
    else if (ev.key == "f") {
        pressedKeys["fire"] = 1;
    }
    else if (ev.key == "p")
        doPlayPause();
});

document.body.addEventListener("keyup", (ev) => {
    if (ev.key == "ArrowLeft") {
        pressedKeys["left"] = 0;
    }
    else if (ev.key == "ArrowRight") {
        pressedKeys["right"] = 0;
    }
    else if (ev.key == "f") {
        pressedKeys["fire"] = 0;
    }
})

const goLeft = document.getElementById("left");
goLeft.addEventListener('click', doGoLeft);

const goRight = document.getElementById("right");
goRight.addEventListener("click", doGoRight);

const fireButton = document.getElementById("firebutton");
fireButton.addEventListener('click', doFire);

const playButton = document.getElementById("playbutton");
playButton.addEventListener('click', doPlayPause);

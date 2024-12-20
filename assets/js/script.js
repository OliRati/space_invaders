var canvas = document.getElementById('spaceinvaders');
var ctx = canvas.getContext("2d");

const spr_list = [
    './assets/img/invader01.png',
    './assets/img/invader02.png',
    './assets/img/invader03.png',
    './assets/img/explode.png',
    './assets/img/tourelle.png',
    './assets/img/missile.png',
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

const canon = new Image();
canon.src = spr_list[4];

const missile = new Image();
missile.src = spr_list[5];

const bunker = new Image();
bunker.src = spr_list[6];

// Off screen canavas
var offScreenCanvas = document.createElement("canvas");
offScreenCanvas.width = canvas.width;
offScreenCanvas.height = canvas.height;
var offscreenctx = offScreenCanvas.getContext("2d");

let framenb = 0;
let heat = 0;

let x = 0;
let y = 0;
let stepx = 1;
let stepy = 5;
let level = 0;
let isPlaying = false;
let gameOver = true;

let canonpos = 0;

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

    x = 0;
    y = 0;

    invaders = [
        [2, 2, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3]];
    bullets = [];

    offscreenctx.clearRect(0, 0, canvas.width, canvas.height);
    const steps = canvas.width / 4;

    offscreenctx.drawImage(bunker, steps - 64, canvas.height - 80);
    offscreenctx.drawImage(bunker, 2 * steps - 32, canvas.height - 80);
    offscreenctx.drawImage(bunker, 3 * steps, canvas.height - 80);

    canonpos = canvas.width / 2;

    document.getElementById("gamestatus").innerHTML = 'Get ready for level ' + level;
}

function canStep(step) {
    let canmove = true;
    let lost = false;
    let count = 0;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 5; j++) {
            if (invaders[j][i]) {
                count++;
                let posx = 32 * i + x + step;
                let posy = 24 * j + y + stepy;

                if ((posx + 32 >= canvas.width) || (posx < 0))
                    canmove = false;

                // Invasion is done
                if ((posy + 24 >= canvas.height)) {
                    lost = true;
                }

                // Collision tests
                for (let k = 0; k < bullets.length; k++) {
                    if (((bullets[k][0] > posx) && (bullets[k][0] < (posx + 32))) &&
                        ((bullets[k][1] > posy) && (bullets[k][1] < (posy + 24)))) {
                        invaders[j][i] = 16;
                        bullets[k][1] = 0;
                    }
                }
            }
        }
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
        if (y + 24 > canvas.height) {
            x = 0;
            y = 0;
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offScreenCanvas, 0, 0);

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

    // Animate bullets
    for (let i = 0; i < bullets.length; i++) {
        let newbulletpos = bullets[i][1] - 3;
        if (newbulletpos > 0) {
            ctx.drawImage(missile, bullets[i][0] - 16, newbulletpos - 18);
            bullets[i][1] = newbulletpos;
        }
        else {
            bullets[i][1] = 0;
        }
    }

    // Draw Gun heat level
    let level = (canvas.width - 20) * Math.min(1000, heat) / 1000;
    ctx.beginPath();
    ctx.moveTo(10, canvas.height - 5);
    ctx.lineTo(10 + level, canvas.height - 5);
    ctx.stroke();

    if (heat > 1000)
        ctx.drawImage(explode, canonpos - 16, canvas.height - 24);
    else
        ctx.drawImage(canon, canonpos - 16, canvas.height - 24);

    if (isPlaying) {
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
}

/* Wait for every sprite is Loaded */

let loaded = 0;
const toload = 7;

function checkEverithingLoaded() {
    loaded++;
    if (loaded == toload) {
        newLevel(true);
        animateInvaders();
    }
}

sprite01.onload = function () {
    checkEverithingLoaded();
};

sprite02.onload = function () {
    checkEverithingLoaded();
};

sprite03.onload = function () {
    checkEverithingLoaded();
};

explode.onload = function () {
    checkEverithingLoaded();
};

canon.onload = function () {
    checkEverithingLoaded();
}

missile.onload = function () {
    checkEverithingLoaded();
}

bunker.onload = function () {
    checkEverithingLoaded();
}

/* Animate functions */

function doGoLeft() {
    if (isPlaying) {
        if (canonpos >= 5)
            canonpos -= 5;
    }
}

function doGoRight() {
    if (isPlaying) {
        if (canonpos <= (canvas.width - 5))
            canonpos += 5;
    }
}

function doFire() {
    if (isPlaying) {
        let posx = canonpos;
        let posy = canvas.height - 24;
        let newbullet = [posx, posy];

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

        playButton.value = "Pause Game";

        // Start the animation
        requestAnimationFrame(animateInvaders);
    }
    else {
        isPlaying = false;
        playButton.value = "Play Game";
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

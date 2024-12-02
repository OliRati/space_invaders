var canvas = document.getElementById('spaceinvaders');
var ctx = canvas.getContext("2d");

const sprite = new Image();
sprite.src = './assets/img/invader01.png';

let x = 0;
let y = 0;
let stepx = 1;
let stepy = 5;
let level = 1;
let isPlaying = false;

let invaders = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]];

let bullets = [];

function newLevel() {
    level++;

    x = 0;
    y = 0;
    invaders = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]];
    bullets = [];
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
                        invaders[j][i] = 0;
                        bullets[k][1] = 0;
                    }
                }
            }
        }
    }

    if (count === 0) {
        newLevel();
    }

    if (lost) {
        playButton.value = "Play Game";
        newLevel();
        isPlaying = false;
    }

    return canmove;
}

function animateInvaders() {
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

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 5; j++) {
            if (invaders[j][i])
                ctx.drawImage(sprite, x + 32 * i, y + 24 * j);
        }
    }

    // Animate bullets
    for (let i = 0; i < bullets.length; i++) {
        let newbulletpos = bullets[i][1] - 3;
        if (newbulletpos > 0) {
            ctx.beginPath();
            ctx.moveTo(bullets[i][0], newbulletpos);
            ctx.lineTo(bullets[i][0], newbulletpos + 10);
            ctx.stroke();

            bullets[i][1] = newbulletpos;
        }
        else {
            bullets[i][1] = 0;
        }

    }

    if (isPlaying) {
        // Request the next frame
        requestAnimationFrame(animateInvaders);
    }
}

sprite.onload = function () {
    animateInvaders();
};

const fireButton = document.getElementById("firebutton");
fireButton.addEventListener('click', () => {
    if (isPlaying) {
        let width = canvas.width;
        let posx = Math.floor(Math.random() * width);
        let posy = canvas.height;
        let newbullet = [posx, posy];

        bullets.push(newbullet);
    }
});

const playButton = document.getElementById("playbutton");
playButton.addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;

        playButton.value = "Pause Game";

        // Start the animation
        requestAnimationFrame(animateInvaders);
    }
    else {
        isPlaying = false;
        playButton.value = "Play Game";
    }
});

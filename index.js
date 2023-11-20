let phase = "waiting";
let lastTimestamp;

let heroX;
let heroY;
let sceneOffset;

let platforms = [
    {x: 50, w: 50},
    {x: 90, w: 30},
];

let sticks = [
    {x: 100, length: 50, rotation: 60}
];

let score = 0;

const canvas = document.getElementById("game");

const ctx = canvas.getContext("2d");

const canvasWidth = 375;
const canvasHeight = 375;
const platformHeight = 100;

const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restart");


const stretchingSpeed = 4;
const turningSpeed = 4;
const walkingSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 2;

resetGame();

function resetGame(){

    phase = "waiting";
    lastTimestamp = undefined;

    platforms = [{x: 50, w: 50}];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();

    heroX = platforms[0].x + platforms[0].w - 30;
    heroY =0;

    sceneOffset = 0;

    sticks = [{x:platforms[0].x + platforms[0].w, length:0, rotation:0 }];

    score = 0;
    
    restartButton.style.display = "none";
    scoreElement.innerText = score;

    draw();
}

function draw(){
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();

    ctx.translate(-sceneOffset, 0);

    drawPlatforms();
    drawHero();
    drawSticks();

    ctx.restore;
}

window.addEventListener("mousedown", function (){
    if (phase == "waiting") {
        phase = "stretching";
        lastTimestamp = undefined;
        window.requestAnimationFrame(animate);
    }
});

window.addEventListener("mouseup", function (){
    if (phase == "stretching") {
        phase = turning;
    }
});

resetButton.addEventListener("click", function() {
    resetGame();
    restartButton.style.display = "none";
})

function animate(timestamp) {
    if (!lastTimestamp){
        lastTimestamp = timestamp;
        window.requestAnimationFrame(animate);
        return;
    }

    let timePassed = timestamp - lastTimestamp;

    switch (phase) {
        case "waiting" :
            return;
        case "stretching": {
            sticks[sticks.length - 1].length += timePassed / stretchingSpeed;
            
            break;
        }
        case "turning": {
            sticks[sticks.length - 1].rotation += timePassed / turningSpeed;

            if (sticks[sticks.length - 1].rotation >= 90){
                sticks[sticks.length - 1].rotation =90;

                const nextPlatform = thePlatformTheStickHits();
                if (nextPlatform) {
                    score++;
                    scoreElement.innerText = score;

                    generatePlatform;
                }
                phase = "walking";
            }

            
            break;
        }
        case "walking":{
            heroX += timePassed / walkingSpeed;
            
            const nextPlatform = thePlatformTheStickHits();
            
            if (nextPlatform) {
                const maxHeroX = nextPlatform.x + nextPlatform.w - 30;
                if (heroX > maxHeroX){
                    heroX = maxHeroX;
                    phase = "transitioning";
                }
            } else {
                const maxHeroX =
                sticks[sticks.length - 1].x +
                sticks[sticks.length - 1].length;
                if (heroX > maxHeroX) {
                    heroX = maxHeroX;
                    phase = "falling";
                }
            }

            
            break;
        }
        case "transitioning": {
            sceneOffset += timePassed / transitioningSpeed;

            const nextPlatform = thePlatformTheStickHits();
            if (nextPlatform.x + nextPlatform.w - sceneOffset < 100){
                sticks.push({
                    x: nextPlatform.x + nextPlatform.w,
                    length: 0,
                    rotation: 0,
                });
                phase = "waiting";
            }

            
            break;
        }
        case "falling": {
            heroY += timePassed / fallingSpeed;

            if (sticks[sticks.length - 1].rotation < 180) {
                sticks[sticks.length -1].rotation += timePassed / turningSpeed;
            }

            const maxHeroY = platformHeight + 100;
            if (heroY > maxHeroY) {
                restartButton.style.display = "block";
                return;
            }

            
            break;
        }
    }

    draw ();
    lastTimestamp = timestamp;

    window.requestAnimationFrame(animate);
}

function generatePlatform(){
    const minimumGap = 40;
    const maximumGap = 200;
    const minimumWidth = 20;
    const maximumWidth = 100;

    const lastPlatform = platforms[platforms.length - 1];
    let furthestX = lastPlatform.x + lastPlatform.w;

    const x =
    furthestX +
    minimumGap +
    Math.floor(Math.random() * (maximumGap - minimumGap));
    const w =
    minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));

    platforms.push({ x, w});
}

function drawPlatforms() {
    platforms.forEach(({ x, w }) => {
        ctx.fillStyle = "black";
        ctx.fillRect(x, canvasHeight - platformHeight, w, platformHeight);
    })
}

function drawHero() {
    const heroWidth = 20;
    const heroHeight = 30;

    ctx.fillStyle = "red";
    ctx.fillRect(
        heroX,
        heroY + canvasHeight - platformHeight - heroHeight,
        heroWidth,
        heroHeight
    )
}

function drawSticks() {
    sticks.forEach((stick) => {
        ctx.save();

        ctx.translate(stick.x, canvasHeight - platformHeight);
        ctx.rotate((Math.PI / 180) * stick.rotation);

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, - stick.length);
        ctx.stroke();

        ctx.restore();
    })
}

function thePlatformTheStickHits() {
    const lastStick = sticks[sticks.length - 1];
    const stickFarX = lastStick.x + lastStick.length;

    const platformTheStickHits = platform.find(
        (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    );

    return platformTheStickHits;
}
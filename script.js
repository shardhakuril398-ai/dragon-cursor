const canvas = document.getElementById("dragonCanvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
let dpr = window.devicePixelRatio || 1;

function resize() {

    width = window.innerWidth;
    height = window.innerHeight;

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();


// ======================================================
// MOUSE
// ======================================================

const mouse = {
    x: width / 2,
    y: height / 2
};

window.addEventListener("pointermove", (event) => {

    mouse.x = event.clientX;
    mouse.y = event.clientY;

});


// ======================================================
// DRAGON BODY
// ======================================================

const SEGMENTS = 36;

const dragon = [];

for (let i = 0; i < SEGMENTS; i++) {

    dragon.push({
        x: mouse.x,
        y: mouse.y,
        angle: 0
    });

}


// ======================================================
// SPARKLES
// ======================================================

const sparkles = [];


// ======================================================
// HELPERS
// ======================================================

function lerp(a, b, amount) {
    return a + (b - a) * amount;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}


// ======================================================
// UPDATE DRAGON
// ======================================================

function updateDragon() {

    // HEAD
    dragon[0].x = lerp(
        dragon[0].x,
        mouse.x,
        0.20
    );

    dragon[0].y = lerp(
        dragon[0].y,
        mouse.y,
        0.20
    );


    // BODY
    for (let i = 1; i < SEGMENTS; i++) {

        const current = dragon[i];
        const previous = dragon[i - 1];

        const dx = previous.x - current.x;
        const dy = previous.y - current.y;

        const angle = Math.atan2(dy, dx);

        const distance = 15 + i * 0.25;

        current.x = lerp(
            current.x,
            previous.x - Math.cos(angle) * distance,
            0.35
        );

        current.y = lerp(
            current.y,
            previous.y - Math.sin(angle) * distance,
            0.35
        );

        current.angle = angle;
    }

}


// ======================================================
// SPARKLE CREATION
// ======================================================

function createSparkle() {

    const tail = dragon[SEGMENTS - 1];

    sparkles.push({

        x: tail.x + random(-4, 4),
        y: tail.y + random(-4, 4),

        vx: random(-0.5, 0.5),
        vy: random(-1.2, 0.2),

        size: random(1, 3),

        life: 1,

        rotation: random(0, Math.PI),

        color: Math.random() > 0.5
            ? "#ff69b4"
            : "#8fffff"
    });

}


// ======================================================
// UPDATE SPARKLES
// ======================================================

function updateSparkles() {

    if (Math.random() < 0.45) {
        createSparkle();
    }

    for (let i = sparkles.length - 1; i >= 0; i--) {

        const p = sparkles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.life -= 0.018;

        p.rotation += 0.05;

        if (p.life <= 0) {
            sparkles.splice(i, 1);
        }

    }

}


// ======================================================
// DRAW SPARKLE
// ======================================================

function drawSparkle(p) {

    ctx.save();

    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    ctx.globalAlpha = p.life;

    ctx.shadowBlur = 18;
    ctx.shadowColor = p.color;

    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.2;

    ctx.beginPath();

    ctx.moveTo(-p.size * 2, 0);
    ctx.lineTo(p.size * 2, 0);

    ctx.moveTo(0, -p.size * 2);
    ctx.lineTo(0, p.size * 2);

    ctx.stroke();

    ctx.restore();

}


// ======================================================
// FAIRY WINGS
// ======================================================

function drawWing(index, side) {

    const p = dragon[index];

    if (!p) return;

    const pulse =
        Math.sin(Date.now() * 0.006 + index) * 3;

    const wingSize =
        27 - index * 0.45;

    if (wingSize < 7) return;

    ctx.save();

    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    ctx.globalAlpha = 0.65;

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ff69b4";

    const gradient = ctx.createLinearGradient(
        0,
        0,
        wingSize,
        side * wingSize
    );

    gradient.addColorStop(
        0,
        "rgba(255,105,180,0.75)"
    );

    gradient.addColorStop(
        0.45,
        "rgba(175,120,255,0.55)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,255,255,0)"
    );

    ctx.fillStyle = gradient;

    // TOP WING

    ctx.beginPath();

    ctx.moveTo(0, 0);

    ctx.bezierCurveTo(
        wingSize * 0.25,
        side * (wingSize + pulse),
        wingSize * 0.95,
        side * (wingSize * 1.4),
        wingSize * 1.35,
        side * (wingSize * 0.45)
    );

    ctx.bezierCurveTo(
        wingSize * 0.9,
        side * (wingSize * 0.25),
        wingSize * 0.4,
        side * (wingSize * 0.1),
        0,
        0
    );

    ctx.fill();


    // WING VEINS

    ctx.globalAlpha = 0.55;

    ctx.strokeStyle = "#ff9ddd";
    ctx.lineWidth = 0.8;

    ctx.beginPath();

    ctx.moveTo(2, 0);

    ctx.lineTo(
        wingSize * 1.05,
        side * wingSize * 0.45
    );

    ctx.moveTo(4, 0);

    ctx.lineTo(
        wingSize * 0.85,
        side * wingSize * 0.85
    );

    ctx.stroke();

    ctx.restore();

}


// ======================================================
// BODY
// ======================================================

function drawBody() {

    for (
        let i = SEGMENTS - 1;
        i >= 1;
        i--
    ) {

        const p = dragon[i];

        const progress = i / SEGMENTS;

        const size =
            10 * (1 - progress) + 2.5;

        ctx.save();

        ctx.translate(p.x, p.y);

        ctx.rotate(p.angle);

        ctx.shadowBlur = 18;

        ctx.shadowColor = "#00ffff";

        const gradient = ctx.createLinearGradient(
            -size,
            0,
            size,
            0
        );

        // ORIGINAL BEAUTIFUL GRADIENT
        gradient.addColorStop(
            0,
            "#00ffff"
        );

        gradient.addColorStop(
            0.5,
            "#00eaff"
        );

        gradient.addColorStop(
            1,
            "#35ffb0"
        );

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            size * 1.5,
            size * 0.65,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

}


// ======================================================
// TAIL
// ======================================================

function drawTail() {

    ctx.save();

    ctx.lineCap = "round";

    ctx.lineWidth = 3;

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#35ffb0";

    ctx.beginPath();

    ctx.moveTo(
        dragon[20].x,
        dragon[20].y
    );

    for (let i = 21; i < SEGMENTS; i++) {

        ctx.lineTo(
            dragon[i].x,
            dragon[i].y
        );

    }

    ctx.strokeStyle =
        "rgba(80,255,220,0.65)";

    ctx.stroke();

    ctx.restore();

}


// ======================================================
// CUTE DRAGON HEAD
// ======================================================

function drawHead() {

    const head = dragon[0];

    ctx.save();

    ctx.translate(head.x, head.y);

    ctx.rotate(head.angle);


    // --------------------------------------------------
    // FAIRY GLOW
    // --------------------------------------------------

    ctx.shadowBlur = 35;
    ctx.shadowColor = "#ff69b4";


    // --------------------------------------------------
    // BACK HAIR / MANE
    // --------------------------------------------------

    const hairGradient =
        ctx.createLinearGradient(
            -15,
            -15,
            15,
            15
        );

    hairGradient.addColorStop(
        0,
        "#ff69b4"
    );

    hairGradient.addColorStop(
        0.5,
        "#c77dff"
    );

    hairGradient.addColorStop(
        1,
        "#6ffcff"
    );

    ctx.fillStyle = hairGradient;

    ctx.beginPath();

    ctx.moveTo(-10, -8);

    ctx.quadraticCurveTo(
        -23,
        -18,
        -16,
        -3
    );

    ctx.quadraticCurveTo(
        -25,
        3,
        -12,
        7
    );

    ctx.quadraticCurveTo(
        -20,
        14,
        -7,
        11
    );

    ctx.closePath();

    ctx.fill();


    // --------------------------------------------------
    // CUTE HEAD
    // --------------------------------------------------

    const faceGradient =
        ctx.createRadialGradient(
            -5,
            -5,
            2,
            0,
            0,
            20
        );

    faceGradient.addColorStop(
        0,
        "#ffffff"
    );

    faceGradient.addColorStop(
        0.25,
        "#9fffff"
    );

    faceGradient.addColorStop(
        0.65,
        "#32e8e8"
    );

    faceGradient.addColorStop(
        1,
        "#087c9c"
    );

    ctx.fillStyle = faceGradient;

    ctx.beginPath();

    ctx.ellipse(
        0,
        0,
        17,
        12,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // --------------------------------------------------
    // CUTE EARS
    // --------------------------------------------------

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff69b4";

    ctx.fillStyle = "#ff8fcf";

    // Upper ear

    ctx.beginPath();

    ctx.moveTo(-8, -8);

    ctx.lineTo(-13, -20);

    ctx.lineTo(-3, -12);

    ctx.closePath();

    ctx.fill();


    // Lower ear

    ctx.beginPath();

    ctx.moveTo(-8, 8);

    ctx.lineTo(-13, 20);

    ctx.lineTo(-3, 12);

    ctx.closePath();

    ctx.fill();


    // --------------------------------------------------
    // LITTLE HORNS
    // --------------------------------------------------

    ctx.fillStyle = "#ffe5ff";

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#c77dff";

    ctx.beginPath();

    ctx.moveTo(-3, -9);

    ctx.quadraticCurveTo(
        0,
        -18,
        5,
        -13
    );

    ctx.lineTo(3, -7);

    ctx.closePath();

    ctx.fill();


    // --------------------------------------------------
    // SNOUT
    // --------------------------------------------------

    ctx.fillStyle = "#75ffff";

    ctx.beginPath();

    ctx.moveTo(11, -5);

    ctx.quadraticCurveTo(
        19,
        0,
        11,
        5
    );

    ctx.quadraticCurveTo(
        8,
        0,
        11,
        -5
    );

    ctx.fill();


    // --------------------------------------------------
    // EYE
    // --------------------------------------------------

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff69b4";

    ctx.beginPath();

    ctx.arc(
        5,
        -5,
        4,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#fff5ff";

    ctx.fill();


    // Pupil

    ctx.shadowBlur = 5;
    ctx.shadowColor = "#ff1493";

    ctx.beginPath();

    ctx.ellipse(
        6,
        -5,
        1.2,
        3,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ff1493";

    ctx.fill();


    // --------------------------------------------------
    // LITTLE SMILE
    // --------------------------------------------------

    ctx.shadowBlur = 8;
    ctx.shadowColor = "#ff69b4";

    ctx.strokeStyle = "#ff69b4";
    ctx.lineWidth = 1.2;

    ctx.beginPath();

    ctx.arc(
        10,
        2,
        4,
        0.1,
        Math.PI * 0.7
    );

    ctx.stroke();


    // --------------------------------------------------
    // PINK CHEEK
    // --------------------------------------------------

    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ff69b4";

    ctx.fillStyle =
        "rgba(255,105,180,0.7)";

    ctx.beginPath();

    ctx.arc(
        8,
        6,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


// ======================================================
// LITTLE FAIRY CROWN
// ======================================================

function drawCrown() {

    const p = dragon[0];

    ctx.save();

    ctx.translate(p.x, p.y);

    ctx.rotate(p.angle);

    ctx.globalAlpha = 0.9;

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ffd6ff";

    ctx.strokeStyle = "#ffe8ff";
    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.moveTo(-5, -12);

    ctx.lineTo(-2, -18);

    ctx.lineTo(2, -13);

    ctx.lineTo(6, -19);

    ctx.lineTo(9, -10);

    ctx.stroke();

    ctx.restore();

}


// ======================================================
// MAIN ANIMATION
// ======================================================

function animate() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    updateDragon();

    updateSparkles();


    // Wings behind body

    drawWing(4, -1);
    drawWing(4, 1);

    drawWing(8, -1);
    drawWing(8, 1);

    drawWing(13, -1);
    drawWing(13, 1);


    // Body

    drawTail();

    drawBody();


    // Head wings

    drawWing(1, -1);
    drawWing(1, 1);


    // Head

    drawHead();

    drawCrown();


    // Sparkles

    for (const sparkle of sparkles) {
        drawSparkle(sparkle);
    }


    requestAnimationFrame(animate);
}

animate();

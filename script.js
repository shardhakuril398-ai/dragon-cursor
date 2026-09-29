const canvas = document.getElementById("dragonCanvas");
const ctx = canvas.getContext("2d");

let width;
let height;
let dpr;

function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// ========================================
// MOUSE
// ========================================

const mouse = {
    x: width / 2,
    y: height / 2
};

window.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});


// ========================================
// DRAGON SETTINGS
// ========================================

const SEGMENTS = 32;

const points = [];

for (let i = 0; i < SEGMENTS; i++) {

    points.push({
        x: mouse.x,
        y: mouse.y,
        oldX: mouse.x,
        oldY: mouse.y,
        angle: 0
    });
}


// ========================================
// HELPERS
// ========================================

function lerp(a, b, amount) {
    return a + (b - a) * amount;
}


function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}


function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}


// ========================================
// UPDATE DRAGON
// ========================================

function updateDragon() {

    // Head follows cursor
    points[0].oldX = points[0].x;
    points[0].oldY = points[0].y;

    points[0].x = lerp(points[0].x, mouse.x, 0.22);
    points[0].y = lerp(points[0].y, mouse.y, 0.22);


    // Every body segment follows previous segment
    for (let i = 1; i < SEGMENTS; i++) {

        const previous = points[i - 1];
        const current = points[i];

        current.oldX = current.x;
        current.oldY = current.y;

        const dx = previous.x - current.x;
        const dy = previous.y - current.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        const targetDistance = 17 + i * 0.15;

        if (dist > targetDistance) {

            const angle = Math.atan2(dy, dx);

            current.x =
                previous.x -
                Math.cos(angle) * targetDistance;

            current.y =
                previous.y -
                Math.sin(angle) * targetDistance;
        }

        current.angle = Math.atan2(
            previous.y - current.y,
            previous.x - current.x
        );
    }
}


// ========================================
// GLOW
// ========================================

function createGlow() {

    ctx.shadowBlur = 25;
    ctx.shadowColor = "cyan";
}


// ========================================
// DRAW BODY
// ========================================

function drawBody() {

    for (let i = SEGMENTS - 1; i > 0; i--) {

        const p = points[i];

        const progress = i / SEGMENTS;

        const size =
            11 * (1 - progress) + 3;

        ctx.save();

        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        createGlow();

        // Body
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

        const gradient = ctx.createLinearGradient(
            -size,
            0,
            size,
            0
        );
gradient.addColorStop(0, "#00ffff");
gradient.addColorStop(0.5, "#00eaff");
gradient.addColorStop(1, "#35ffb0");
        

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }
}


// ========================================
// DRAW FINS
// ========================================

function drawFin(index, side) {

    const p = points[index];

    if (!p) return;

    const size = 28 - index * 0.6;

    if (size <= 5) return;

    ctx.save();

    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    ctx.shadowBlur = 30;
    ctx.shadowColor = "#00ff88";

    const wave =
        Math.sin(Date.now() * 0.004 + index) * 4;

    ctx.beginPath();

    ctx.moveTo(0, 0);

    ctx.quadraticCurveTo(
        size * 0.3,
        side * (size + wave),
        size * 1.3,
        side * (size * 0.4)
    );

    ctx.quadraticCurveTo(
        size * 0.7,
        side * (size * 0.15),
        0,
        0
    );

    const gradient = ctx.createLinearGradient(
        0,
        0,
        size,
        side * size
    );

    gradient.addColorStop(0, "rgba(0,255,150,0.8)");
    gradient.addColorStop(1, "rgba(0,255,80,0)");

    ctx.fillStyle = gradient;

    ctx.fill();

    ctx.restore();
}


// ========================================
// DRAW HEAD
// ========================================

function drawHead() {

    const head = points[0];

    ctx.save();

    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);

    // Outer glow
    ctx.shadowBlur = 35;
    ctx.shadowColor = "#00ffff";

    // Head
    ctx.beginPath();

    ctx.ellipse(
        0,
        0,
        16,
        10,
        0,
        0,
        Math.PI * 2
    );

    const headGradient = ctx.createRadialGradient(
        -4,
        -3,
        1,
        0,
        0,
        18
    );

    headGradient.addColorStop(0, "#ffffff");
    headGradient.addColorStop(0.25, "#00ffff");
    headGradient.addColorStop(0.7, "#00d9d9");
    headGradient.addColorStop(1, "#003333");

    ctx.fillStyle = headGradient;
    ctx.fill();


    // Snout
    ctx.beginPath();

    ctx.moveTo(10, -5);
    ctx.lineTo(25, 0);
    ctx.lineTo(10, 5);
    ctx.closePath();

    ctx.fillStyle = "#00ffff";
    ctx.fill();


    // Eye
    ctx.shadowBlur = 15;
    ctx.shadowColor = "yellow";

    ctx.beginPath();

    ctx.arc(
        4,
        -5,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffff00";
    ctx.fill();


    // Eye pupil
    ctx.shadowBlur = 0;

    ctx.beginPath();

    ctx.arc(
        4,
        -5,
        1,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#000";
    ctx.fill();


    ctx.restore();
}


// ========================================
// DRAW TAIL
// ========================================

function drawTail() {

    const tailStart = Math.floor(SEGMENTS * 0.7);

    ctx.save();

    ctx.lineWidth = 3;

    ctx.lineCap = "round";

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffff";

    ctx.beginPath();

    ctx.moveTo(
        points[tailStart].x,
        points[tailStart].y
    );

    for (
        let i = tailStart + 1;
        i < SEGMENTS;
        i++
    ) {

        ctx.lineTo(
            points[i].x,
            points[i].y
        );
    }

    ctx.strokeStyle = "rgba(0,255,255,0.7)";

    ctx.stroke();

    ctx.restore();
}


// ========================================
// PARTICLES
// ========================================

const particles = [];

function createParticle() {

    const tail = points[SEGMENTS - 1];

    particles.push({
        x: tail.x,
        y: tail.y,

        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,

        life: 1,

        size: Math.random() * 3 + 1
    });
}


function updateParticles() {

    if (Math.random() < 0.35) {
        createParticle();
    }

    for (let i = particles.length - 1; i >= 0; i--) {

        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.life -= 0.025;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}


function drawParticles() {

    for (const p of particles) {

        ctx.save();

        ctx.globalAlpha = p.life;

        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffff";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#00ffff";

        ctx.fill();

        ctx.restore();
    }
}


// ========================================
// MAIN ANIMATION
// ========================================

function animate() {

    // Clear screen
    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    updateDragon();

    updateParticles();

    drawParticles();

    drawTail();

    drawBody();

    // Fins
    drawFin(7, -1);
    drawFin(7, 1);

    drawFin(13, -1);
    drawFin(13, 1);

    drawFin(19, -1);
    drawFin(19, 1);

    // Head
    drawHead();

    requestAnimationFrame(animate);
}

animate();

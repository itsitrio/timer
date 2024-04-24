const canvas = document.getElementById('timecodeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 100;

function drawBlock(value, max, x, width) {
    const luminance = Math.floor((1 - value / max) * 255);
    const color = `rgb(${luminance},${luminance},${luminance})`;
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, width, canvas.height);
}

function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    const deciseconds = Math.floor(milliseconds / 100);
    const centiseconds = Math.floor((milliseconds % 100) / 10);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBlock(hours, 23, 0, 100); // Hours
    drawBlock(minutes, 59, 100, 100); // Minutes
    drawBlock(seconds, 59, 200, 100); // Seconds
    drawBlock(deciseconds, 9, 300, 100); // Upper Deciseconds
    drawBlock(centiseconds, 9, 400, 100); // Lower Deciseconds
    // Add more blocks as needed

    requestAnimationFrame(updateTime);
}

requestAnimationFrame(updateTime);
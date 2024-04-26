const canvas = document.getElementById('timecodeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 320;
canvas.height = 40;

function drawBlock(value, max, x, width) {
    const luminance = Math.floor((255 - (value / max) * 255));
    const color = `rgb(${luminance},${luminance},${luminance})`;
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, width, canvas.height);
}

function calculateChecksum(values) {
    // Sum up all the time values and then take modulo 64 to keep it within byte range
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum % 64;
}

function updateTime() {
    const now = new Date();
    const days = now.getUTCDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    const deciseconds = Math.floor(milliseconds / 100);
    const centiseconds = Math.floor((milliseconds % 100) / 10);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw time blocks
    drawBlock(days, 6, 0, 40); // Hours
    drawBlock(hours, 23, 40, 40); // Hours
    drawBlock(minutes, 59, 80, 40); // Minutes
    drawBlock(seconds, 59, 120, 40); // Seconds
    drawBlock(deciseconds, 9, 160, 40); // Upper Deciseconds
    drawBlock(centiseconds, 9, 200, 40); // Lower Centiseconds

    // Calculate and draw checksum block
    const values = [days,hours, minutes, seconds, deciseconds, centiseconds];
    const checksum = calculateChecksum(values);
    drawBlock(checksum, 63, 240, 40); // Checksum block

    requestAnimationFrame(updateTime);
}

requestAnimationFrame(updateTime);
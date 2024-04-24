const canvas = document.getElementById('timecodeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 80;
canvas.height = 10;

function drawBlock(value, max, x, width) {
    const luminance = Math.floor((255 - (value / max) * 255));
    const color = `rgb(${luminance},${luminance},${luminance})`;
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, width, canvas.height);
}

function calculateChecksum(values) {
    // Sum up all the time values and then take modulo 256 to keep it within byte range
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum % 256;
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

    // Draw time blocks
    drawBlock(hours, 23, 0, 10); // Hours
    drawBlock(minutes, 59, 10, 10); // Minutes
    drawBlock(seconds, 59, 20, 10); // Seconds
    drawBlock(deciseconds, 9, 30, 10); // Upper Deciseconds
    drawBlock(centiseconds, 9, 40, 10); // Lower Centiseconds

    // Calculate and draw checksum block
    const values = [hours, minutes, seconds, deciseconds, centiseconds];
    const checksum = calculateChecksum(values);
    drawBlock(checksum, 255, 50, 10); // Checksum block

    requestAnimationFrame(updateTime);
}

requestAnimationFrame(updateTime);
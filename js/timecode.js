const canvas = document.getElementById('timecodeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 320;
canvas.height = 40;

//define framerate expectation & get current time for high precision
const frameRate = 24;
const startTime = performance.now();

// Colors for drawing the colors
const colors = ['red','green','blue','black','cyan','yellow','magenta','white']

function drawBlock(value, max, x, width) {
    const luminance = Math.floor(255-(255 - (value / max) * 255));
    const color = `rgb(${luminance},${luminance},${luminance})`;
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, width, canvas.height);
}
function drawColorBlock(minute, x, width) {
    const colorIndex = minute % colors.length; // Cycle through the color array based on the minute
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(x, 0, width, canvas.height);
}

function drawText(text, x, width) {
    ctx.fillStyle = 'black';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(text, x, 30); // Adjusted to ensure text is in a visible part of the canvas
}
function calculateChecksum(values) {
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum % 64;
}

function updateTime() {
    const elapsed = performance.now() - startTime;
    const totalSeconds = Math.floor(elapsed /1000);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const seconds = totalSeconds % 60;
    const frames = Math.floor((elapsed % 1000) / (1000 / frameRate));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBlock(hours, 23, 0, 40); // Hours
    drawBlock(minutes,59, 40, 40); // Minutes
    drawBlock(seconds, 59, 80, 40); // Seconds
    drawBlock(frames, frameRate - 1, 120, 40); // Frames

    // Display SMPTE timecode as text
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    drawText(timeString, 165, 115); // Adjusted for new dimensions

    requestAnimationFrame(updateTime);
}

requestAnimationFrame(updateTime);
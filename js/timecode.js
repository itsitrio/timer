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

function drawText(text,x,width) {
    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    ctx.textAlign ='center';
    ctx.fillText(text,x,50)
}

function calculateChecksum(values) {
    // Sum up all the time values and then take modulo 64 to keep it within byte range
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

    drawBlock(hours,23,0,40);
    drawBlock(minutes,23,40,40);
    drawBlock(seconds,23,80,40);
    drawBlock(frames,frameRate-1,120,40);

    //text pls
    const timeString = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}:${frames.toString().padStart(2,'0')}`;
    drawText(timeString, 140, 160);

    requestAnimationFrame(updateTime);
}

//Old Update Time that was based on current time, not page load time
//function updateTime() {
//    const now = new Date();
//    const days = now.getUTCDay();
//    const hours = now.getHours();
//    const minutes = now.getMinutes();
//    const seconds = now.getSeconds();
//    const milliseconds = now.getMilliseconds();
//    const deciseconds = Math.floor(milliseconds / 100);
//    const centiseconds = Math.floor((milliseconds % 100) / 10);
//    const frames = Math.floor((milliseconds/1000)*frameRate)
//
//    ctx.clearRect(0, 0, canvas.width, canvas.height);

//    /// Draw time blocks
//    drawBlock(days, 6, 0, 40); // Hours
//    drawBlock(hours, 23, 40, 40); // Hours
//    drawColorBlock(minutes, 80, 40); // Minutes
//    drawBlock(minutes, 59, 120, 40); // Minutes
//    drawBlock(seconds, 59, 160, 40); // Seconds
//    drawBlock(deciseconds, 9, 200, 40); // Upper Deciseconds
//    drawBlock(centiseconds, 9, 240, 40); // Lower Centiseconds
//    drawBlock(frames, frameRate - 1, 280, 40)
//
//    // Calculate and draw checksum block
//    const values = [days,hours, minutes, seconds, deciseconds, centiseconds];
//    const checksum = calculateChecksum(values);
//    drawBlock(checksum, 63, 280, 40); // Checksum block
//
//    requestAnimationFrame(updateTime);
//}


requestAnimationFrame(updateTime);
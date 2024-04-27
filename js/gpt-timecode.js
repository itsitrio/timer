function drawBlock(value, max, x, width) {
    const luminance = Math.floor((255 - (value / max) * 255));
    const color = `rgb(${luminance},${luminance},${luminance})`;
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, width, canvas.height);
}

function drawColorBlock(minute, x, width) {
    const colorIndex = minute % colors.length;
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(x, 0, width, canvas.height);
}

function drawText(text, x, width) {
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';  // Reduced font size for the smaller canvas
    ctx.textAlign = 'left';
    ctx.fillText(text, x, 50); // Ensure text fits in the height
}

function updateTime() {
    const elapsed = performance.now() - startTime;
    const totalSeconds = Math.floor(elapsed / 1000);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const seconds = totalSeconds % 60;
    const frames = Math.floor((elapsed % 1000) / (1000 / frameRate));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Adjusted block widths for smaller canvas
    drawBlock(hours, 23, 0, 40); // Hours
    drawBlock(minutes,59, 50, 40); // Minutes
    drawBlock(seconds, 59, 100, 40); // Seconds
    drawBlock(frames, frameRate - 1, 150, 50); // Frames

    const values = [hours, minutes, seconds, frames];
    const checksum = calculateChecksum(values);
    drawBlock(checksum, 255, 200, 50); // Checksum block

    // Display SMPTE timecode as text
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    drawText(timeString, 250, 70); // Adjusted for new dimensions

    requestAnimationFrame(updateTime);
}

requestAnimationFrame(updateTime);

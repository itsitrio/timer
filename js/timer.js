document.addEventListener('DOMContentLoaded', function() {
    const endDate = getDateFromURL();
    const textColor = getColorFromURL();
    document.documentElement.style.setProperty('--text-color', textColor);
    document.getElementById('countdownTitle').textContent = getTitleFromURL() || 'Countdown Timer';
    const timezone = getTimezoneFromURL();
    displayTargetTimes(endDate, timezone);
    const showClocks = getShowClocksFromURL();
    if (!showClocks) {
        document.querySelector('.timezone-display').style.display = 'none';
    }
    setInterval(() => updateAll(endDate), 1000);
    updateAll(endDate); // Initial call to avoid delay

    // Set button color based on text color
    const timestampButton = document.getElementById('copyTimestampButton');
    timestampButton.style.backgroundColor = textColor;

    const shortUrlButton = document.getElementById('copyShortUrlButton');
    shortUrlButton.style.backgroundColor = textColor;

    // Show the copy buttons on mouse move
    let timeout;
    document.addEventListener('mousemove', function() {
        timestampButton.style.display = 'block';
        if (shortUrlButton.getAttribute('data-url')) {
            shortUrlButton.style.display = 'block';
        }
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timestampButton.style.display = 'none';
            shortUrlButton.style.display = 'none';
        }, 5000); // 30 seconds
    });

    // Calculate and set the Discord timestamp
    const unixTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    timestampButton.setAttribute('data-timestamp', `<t:${unixTimestamp}:R>`);

    // Display the shortId if present
    const shortId = getShortIdFromURL();
    if (shortId) {
        const shortUrl = `https://getmy.timer.pet/${shortId}`;
        shortUrlButton.setAttribute('data-url', shortUrl);
        shortUrlButton.style.display = 'block';
    }
});

function copyToClipboard(type) {
    let text;
    let button;
    if (type === 'timestamp') {
        button = document.getElementById('copyTimestampButton');
        text = button.getAttribute('data-timestamp');
    } else if (type === 'shortUrl') {
        button = document.getElementById('copyShortUrlButton');
        text = button.getAttribute('data-url');
    }

    navigator.clipboard.writeText(text).then(function() {
        button.classList.add('success');
        button.textContent = '';
        setTimeout(() => {
            button.classList.remove('success');
            button.textContent = type === 'timestamp' ? 'Copy Discord Timestamp' : 'Copy Short URL';
        }, 3000);
    }, function(err) {
        alert(`Failed to copy the ${type}`);
    });
}

function getTitleFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('title') ? decodeURIComponent(urlParams.get('title')) : 'Countdown Timer';
}

function getColorFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('color') || '#ffa629'; // Default color if none specified
}

function getDateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 1); // Default to 1 hour from now
    return urlParams.get('date') ? new Date(decodeURIComponent(urlParams.get('date'))) : defaultDate;
}

function getShowClocksFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('showClocks') === 'true';
}

function getTimezoneFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const timezone = urlParams.get('timezone');
    return timezone ? decodeURIComponent(timezone) : 'UTC'; // Default to 'UTC' if not specified
}

function getShortIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('shortId');
}

function updateAll(endDate) {
    updateCountdown(endDate);
    updateClocks();
}

function updateClocks() {
    updateIfChanged('localTime', new Date().toLocaleTimeString());
    updateIfChanged('nyTime', new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }));
    updateIfChanged('ukTime', new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/London' }));
}

function updateIfChanged(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (element.textContent !== newValue) {
        element.textContent = newValue;
    }
}

function updateCountdown(targetDate) {
    const now = new Date();
    const distance = targetDate - now;

    if (distance < 0) {
        document.querySelector('.countdown').innerHTML = "<h1>Countdown Ended</h1>";
        return;
    }

    // Determine visibility based on significance
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    let anyUnitVisible = false;
    anyUnitVisible = updateUnitVisibility('days', days, anyUnitVisible);
    anyUnitVisible = updateUnitVisibility('hours', hours, anyUnitVisible);
    anyUnitVisible = updateUnitVisibility('minutes', minutes, anyUnitVisible);
    updateUnitVisibility('seconds', seconds, anyUnitVisible); // Seconds are always updated
}

function displayTargetTimes(targetDateUTC, targetTimezone) {
    // Hide the target timezone display if 'Local' is selected
    if (targetTimezone === 'Local') {
        document.getElementById('targetTimeInTargetTimezone').style.display = 'none';
    } else {
        const targetTimeInTargetTimezone = moment.utc(targetDateUTC).tz(targetTimezone).format('YYYY-MM-DD HH:mm:ss');
        document.getElementById('targetTimeInTargetTimezone').textContent = `Target in ${targetTimezone}: ${targetTimeInTargetTimezone}`;
        document.getElementById('targetTimeInTargetTimezone').style.display = 'block';
    }
    
    // Always show the target time in the user's local timezone
    const targetTimeInLocalTimezone = moment.utc(targetDateUTC).tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm:ss');
    document.getElementById('targetTimeInLocalTimezone').textContent = `Local Target Time: ${targetTimeInLocalTimezone}`;
}

function updateUnitVisibility(unit, value, anyUnitVisible) {
    const unitElement = document.getElementById(unit);
    const unitContainer = unitElement.closest('.time-unit');
    // Show the unit if its value is not 0 or any more significant unit is visible
    if (value > 0 || anyUnitVisible) {
        unitContainer.style.display = 'inline-block';
        unitElement.textContent = value.toString().padStart(2, '0');
        return true; // Indicates that this, or a more significant unit, is visible
    } else {
        unitContainer.style.display = 'none';
        return anyUnitVisible; // State unchanged, pass it through
    }
}

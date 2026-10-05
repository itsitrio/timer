document.addEventListener('DOMContentLoaded', function() {
    const endDate = getDateFromURL();
    if (isNaN(endDate)) {
        document.querySelector('.countdown').innerHTML = '<h1>Invalid Date</h1>';
        document.querySelector('.timezone-display').style.display = 'none';
        return;
    }
    const textColor = getColorFromURL();
    document.documentElement.style.setProperty('--text-color', textColor);
    document.getElementById('countdownTitle').textContent = getTitleFromURL() || 'Countdown Timer';
    const orgCredit = getOrgCreditFromURL();
    const orgCreditElement = document.getElementById('orgCredit');
    if (orgCredit) {
        orgCreditElement.textContent = orgCredit;
    } else {
        orgCreditElement.style.display = 'none';
    }
    const timezone = getTimezoneFromURL();
    displayTargetTimes(endDate, timezone);
    const showClocks = getShowClocksFromURL();
    if (!showClocks) {
        document.querySelector('.timezone-display').style.display = 'none';
    }
    tick(endDate);

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
        }, 5000); // Hide again after 5 seconds of inactivity
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

// Self-correcting timer: schedules each update just after the next whole
// second so it never drifts, and stops once the countdown has ended
function tick(endDate) {
    if (!updateAll(endDate)) {
        return;
    }
    setTimeout(() => tick(endDate), 1000 - (Date.now() % 1000) + 5);
}

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
    return urlParams.get('title') || 'Countdown Timer'; // URLSearchParams already decodes
}

function getColorFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('color') || '#ffa629'; // Default color if none specified
}

function getDateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 1); // Default to 1 hour from now
    return urlParams.get('date') ? new Date(urlParams.get('date')) : defaultDate;
}

function getShowClocksFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('showClocks') === 'true';
}

function getTimezoneFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const timezone = urlParams.get('timezone');
    return timezone || 'UTC'; // Default to 'UTC' if not specified
}

function getOrgCreditFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('orgCredit');
}

function getShortIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('shortId');
}

// Returns false once the countdown has ended so the caller can stop ticking
function updateAll(endDate) {
    updateClocks();
    return updateCountdown(endDate);
}

function updateClocks() {
    const now = new Date();
    updateIfChanged('localTime', now.toLocaleTimeString());
    updateIfChanged('nyTime', now.toLocaleTimeString('en-US', { timeZone: 'America/New_York' }));
    updateIfChanged('ukTime', now.toLocaleTimeString('en-US', { timeZone: 'Europe/London' }));
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
        return false;
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
    return true;
}

// Formats a date as 'YYYY-MM-DD HH:mm:ss' in the given IANA timezone.
// The sv-SE locale happens to use exactly that layout.
function formatInTimezone(date, timeZone) {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hourCycle: 'h23'
    }).format(date);
}

function displayTargetTimes(targetDate, targetTimezone) {
    const targetElement = document.getElementById('targetTimeInTargetTimezone');
    let formattedTarget = null;
    // Skip the target timezone display if 'Local' is selected or the zone is unknown
    if (targetTimezone !== 'Local') {
        try {
            formattedTarget = formatInTimezone(targetDate, targetTimezone);
        } catch (e) {
            console.warn(`Unknown timezone "${targetTimezone}"`);
        }
    }
    if (formattedTarget) {
        targetElement.textContent = `Target in ${targetTimezone}: ${formattedTarget}`;
        targetElement.style.display = 'block';
    } else {
        targetElement.style.display = 'none';
    }

    // Always show the target time in the user's local timezone
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById('targetTimeInLocalTimezone').textContent =
        `Local Target Time: ${formatInTimezone(targetDate, localZone)}`;
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

const SHORTENER_URL = 'https://getmy.timer.pet/shorten';
const SHORT_URL_PREFIX = 'https://getmy.timer.pet/';
const TIMER_BASE_URL = 'https://timer.pet/timer';

document.addEventListener('DOMContentLoaded', function() {
    // Default the end date to 24 hours from now, formatted as YYYY-MM-DDTHH:MM
    const now = new Date();
    now.setHours(now.getHours() + 24);
    const pad = (n) => String(n).padStart(2, '0');
    document.getElementById('endDate').value =
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    populateTimezones();

    document.getElementById('toggleDisplaySettings').addEventListener('click', function() {
        const displaySettings = document.getElementById('displaySettings');
        const hidden = displaySettings.style.display === 'none';
        displaySettings.style.display = hidden ? 'block' : 'none';
        this.setAttribute('aria-expanded', String(hidden));
    });

    document.getElementById('wizardForm').addEventListener('submit', handleSubmit);
});

// Fill the "All Timezones" group from the browser's IANA timezone list
function populateTimezones() {
    if (typeof Intl.supportedValuesOf !== 'function') {
        return;
    }
    const group = document.getElementById('allTimezones');
    for (const zone of Intl.supportedValuesOf('timeZone')) {
        const option = document.createElement('option');
        option.value = zone;
        option.textContent = zone.replace(/_/g, ' ');
        group.appendChild(option);
    }
}

// Offset (ms) of a timezone from UTC at the given instant
function timezoneOffset(timestamp, timeZone) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hourCycle: 'h23'
    }).formatToParts(new Date(timestamp));
    const v = {};
    for (const p of parts) {
        v[p.type] = Number(p.value);
    }
    const asUtc = Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second);
    return asUtc - Math.floor(timestamp / 1000) * 1000;
}

// Convert a 'YYYY-MM-DDTHH:MM' wall-clock time in a timezone to a UTC Date
function zonedTimeToUtc(input, timeZone) {
    const [, y, mo, d, h, mi] = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    const wallAsUtc = Date.UTC(+y, +mo - 1, +d, +h, +mi);
    // Apply the offset twice so times near a DST change resolve correctly
    let result = wallAsUtc - timezoneOffset(wallAsUtc, timeZone);
    result = wallAsUtc - timezoneOffset(result, timeZone);
    return new Date(result);
}

async function handleSubmit(e) {
    e.preventDefault();
    const title = encodeURIComponent(document.getElementById('title').value);
    const orgCredit = encodeURIComponent(document.getElementById('orgCredit').value);
    const showClocks = document.getElementById('showClocks').value;
    const endDateInput = document.getElementById('endDate').value;
    const timezone = document.getElementById('timezone').value;
    const textColor = document.getElementById('textColor').value;

    if (!endDateInput) {
        alert('Please choose an end date.');
        return;
    }

    const endDate = timezone === 'Local' ? new Date(endDateInput) : zonedTimeToUtc(endDateInput, timezone);
    const endDateUTC = endDate.toISOString().replace(/\.\d{3}Z$/, 'Z');

    const countdownUrl = `${TIMER_BASE_URL}?title=${title}&showClocks=${showClocks}&date=${encodeURIComponent(endDateUTC)}&timezone=${encodeURIComponent(timezone)}&color=${encodeURIComponent(textColor)}&orgCredit=${orgCredit}`;

    try {
        const response = await fetch(SHORTENER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: countdownUrl })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (typeof data.shortUrl !== 'string' || !data.shortUrl.startsWith(SHORT_URL_PREFIX)) {
            throw new Error('Unexpected shortener response');
        }
        window.location.href = data.shortUrl;
    } catch (error) {
        // Shortener is unavailable: the full URL works just as well
        console.error('Could not shorten URL, using full URL:', error);
        window.location.href = countdownUrl;
    }
}

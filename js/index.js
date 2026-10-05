const SHORTENER_URL = 'https://getmy.timer.pet/shorten';
const SHORT_URL_PREFIX = 'https://getmy.timer.pet/';
const TIMER_BASE_URL = 'https://timer.pet/timer';

// The full-URL fallback stays on whatever site is serving the wizard, so
// preview deploys and local servers link to themselves rather than production
function fallbackBaseUrl() {
    return location.protocol.startsWith('http') ? `${location.origin}/timer` : TIMER_BASE_URL;
}

document.addEventListener('DOMContentLoaded', function() {
    // Default the end date to 24 hours from now, formatted as YYYY-MM-DDTHH:MM
    const now = new Date();
    now.setHours(now.getHours() + 24);
    const pad = (n) => String(n).padStart(2, '0');
    document.getElementById('endDate').value =
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    populateTimezones();
    document.getElementById('endDate').addEventListener('change', populateTimezones);
    document.getElementById('toggleTimezones').addEventListener('click', function() {
        showAllTimezones = !showAllTimezones;
        this.textContent = showAllTimezones ? 'Show common timezones' : 'Show all timezones';
        this.setAttribute('aria-expanded', String(showAllTimezones));
        populateTimezones();
    });

    document.getElementById('toggleDisplaySettings').addEventListener('click', function() {
        const displaySettings = document.getElementById('displaySettings');
        const hidden = displaySettings.style.display === 'none';
        displaySettings.style.display = hidden ? 'block' : 'none';
        this.setAttribute('aria-expanded', String(hidden));
    });

    document.getElementById('wizardForm').addEventListener('submit', handleSubmit);
});

const COMMON_TIMEZONES = [
    ['America/Los_Angeles', 'Pacific'],
    ['America/Phoenix', 'Arizona'],
    ['America/Denver', 'Mountain'],
    ['America/Chicago', 'Central'],
    ['America/New_York', 'Eastern'],
    ['UTC', 'UTC']
];

let showAllTimezones = false;

// 'GMT-5', 'GMT+5:30' or 'GMT' for an offset in milliseconds
function formatOffset(offsetMs) {
    const minutes = Math.round(offsetMs / 60000);
    if (minutes === 0) {
        return 'GMT';
    }
    const sign = minutes < 0 ? '-' : '+';
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    return `GMT${sign}${hours}${mins ? ':' + String(mins).padStart(2, '0') : ''}`;
}

// Offsets depend on DST, so they are calculated for the chosen end date
function selectedInstant() {
    const value = document.getElementById('endDate').value;
    const date = value ? new Date(value) : new Date();
    return isNaN(date) ? Date.now() : date.getTime();
}

function makeOption(value, label, instant) {
    const option = document.createElement('option');
    option.value = value;
    const zone = value === 'Local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : value;
    option.textContent = `(${formatOffset(timezoneOffset(instant, zone))}) ${label}`;
    return option;
}

// Rebuild the timezone list: common zones, or every IANA zone when expanded
function populateTimezones() {
    const select = document.getElementById('timezone');
    const previous = select.value || 'Local';
    const instant = selectedInstant();
    select.replaceChildren(makeOption('Local', 'My local time', instant));

    const common = document.createElement('optgroup');
    common.label = 'Common Timezones';
    for (const [value, label] of COMMON_TIMEZONES) {
        common.appendChild(makeOption(value, label, instant));
    }
    select.appendChild(common);

    if (showAllTimezones && typeof Intl.supportedValuesOf === 'function') {
        const commonValues = new Set(COMMON_TIMEZONES.map(([value]) => value));
        const zones = Intl.supportedValuesOf('timeZone')
            .filter((zone) => !commonValues.has(zone))
            .map((zone) => ({ zone, offset: timezoneOffset(instant, zone) }))
            .sort((a, b) => a.offset - b.offset || a.zone.localeCompare(b.zone));
        const all = document.createElement('optgroup');
        all.label = 'All Timezones';
        for (const { zone } of zones) {
            all.appendChild(makeOption(zone, zone.replace(/_/g, ' '), instant));
        }
        select.appendChild(all);
    }

    // Keep the user's choice if it still exists (collapsing hides uncommon zones)
    select.value = previous;
    if (select.value !== previous) {
        select.value = 'Local';
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

    const query = `?title=${title}&showClocks=${showClocks}&date=${encodeURIComponent(endDateUTC)}&timezone=${encodeURIComponent(timezone)}&color=${encodeURIComponent(textColor)}&orgCredit=${orgCredit}`;
    const countdownUrl = TIMER_BASE_URL + query;

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
        window.location.href = fallbackBaseUrl() + query;
    }
}

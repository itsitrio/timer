# Timer Pet

A simple countdown timer for events, with a wizard for building links. Static
site, no build step. Open `index.html` to create a countdown; it redirects to
`timer.html` (served at `/timer`).

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Countdown wizard. Builds a timer URL and shortens it via `getmy.timer.pet`. If the shortener is unavailable it uses the full URL. |
| `timer.html` | The countdown itself, configured through URL parameters. |
| `timecode.html` | Visual timecode generator (HH:MM:SS:FF canvas). |

## Timer URL parameters

| Parameter | Default | Description |
| --- | --- | --- |
| `date` | 1 hour from now | End time as an ISO 8601 string, ideally UTC (`2026-12-31T23:59:00Z`). |
| `title` | `Countdown Timer` | Heading shown above the countdown. |
| `orgCredit` | none | Organization name shown under the title. |
| `timezone` | `UTC` | IANA timezone (or `Local`) used to show the target time. |
| `color` | `#ffa629` | Text colour. |
| `showClocks` | `false` | `true` shows your time, Eastern and European clocks. |
| `shortId` | none | Enables the "Copy Short URL" button (`https://getmy.timer.pet/<shortId>`). |

Example: `/timer?title=New%20Year&date=2026-12-31T23%3A59%3A00Z&timezone=America%2FNew_York`

## Development

No dependencies. Serve the folder with any static server, for example
`python3 -m http.server`, and visit `/index.html` and `/timer.html`.

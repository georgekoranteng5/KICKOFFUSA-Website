/**
 * Events page
 *
 * Add an object here when an event is announced. Join Tournament links to
 * the earliest upcoming event that has an href. Leave the list empty until then.
 *
 * {
 *   iso: '2026-11-08T14:00:00-04:00',
 *   name: 'KICKOFF CUP',
 *   label: 'KICKOFF CUP · Nov 8 · 2:00 PM ET',
 *   status: 'November 8th · 2:00 PM',
 *   summary: 'Short description shown on the events page.',
 *   href: 'https://your-ticket-link.example'
 * }
 */
(function () {
  const UPCOMING_EVENTS = [];

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function upcomingEvents() {
    const now = Date.now();
    return UPCOMING_EVENTS
      .filter((event) => event && event.iso && new Date(event.iso).getTime() > now)
      .slice()
      .sort((a, b) => new Date(a.iso) - new Date(b.iso));
  }

  function initEventCountdown(events) {
    const root = document.getElementById('event-countdown');
    if (!root) return;

    const els = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]'),
      label: root.querySelector('.countdown-event-name'),
      status: root.querySelector('.countdown-status'),
      eyebrow: root.querySelector('.countdown-eyebrow')
    };

    if (!events.length) {
      root.classList.add('countdown-unannounced');
      root.classList.remove('countdown-ended');
      if (els.eyebrow) els.eyebrow.textContent = 'Next kickoff';
      if (els.label) els.label.textContent = 'More events coming soon';
      if (els.status) {
        els.status.textContent = 'Nothing is announced yet.';
        els.status.classList.remove('is-live');
      }
      return;
    }

    root.classList.remove('countdown-unannounced');
    const event = events[0];

    function tick() {
      const diff = new Date(event.iso).getTime() - Date.now();

      if (diff <= 0) {
        if (els.days) els.days.textContent = '00';
        if (els.hours) els.hours.textContent = '00';
        if (els.minutes) els.minutes.textContent = '00';
        if (els.seconds) els.seconds.textContent = '00';
        if (els.status) {
          els.status.textContent = "We're live. See you on the pitch.";
          els.status.classList.add('is-live');
        }
        root.classList.add('countdown-ended');
        return;
      }

      root.classList.remove('countdown-ended');
      if (els.eyebrow) els.eyebrow.textContent = 'Next kickoff in';
      if (els.label) els.label.textContent = event.label || event.name || 'Upcoming event';
      if (els.status) {
        els.status.textContent = event.status || '';
        els.status.classList.remove('is-live');
      }

      const totalSec = Math.floor(diff / 1000);
      if (els.days) els.days.textContent = pad(Math.floor(totalSec / 86400));
      if (els.hours) els.hours.textContent = pad(Math.floor((totalSec % 86400) / 3600));
      if (els.minutes) els.minutes.textContent = pad(Math.floor((totalSec % 3600) / 60));
      if (els.seconds) els.seconds.textContent = pad(totalSec % 60);
    }

    tick();
    setInterval(tick, 1000);
  }

  function renderFeaturedEvents(events) {
    const root = document.getElementById('featured-events');
    const lead = document.getElementById('featured-events-lead');
    if (lead) {
      lead.textContent = events.length
        ? 'The next kickoffs on the calendar.'
        : "New dates are on the way. We'll post them here as soon as they're announced.";
    }
    if (!root || !events.length) return;

    root.innerHTML = events.map((event) => {
      const name = event.name || 'Upcoming event';
      const when = event.status || event.label || '';
      const summary = event.summary || '';
      const link = event.href
        ? '<a class="featured-event-link" href="' + event.href + '">Event details</a>'
        : '';
      return (
        '<article class="featured-event">' +
          '<p class="featured-event-kicker">Upcoming</p>' +
          '<h3>' + name + '</h3>' +
          (when ? '<p class="featured-event-when">' + when + '</p>' : '') +
          (summary ? '<p class="featured-event-summary">' + summary + '</p>' : '') +
          link +
        '</article>'
      );
    }).join('');
  }

  function initJoinTournament(events) {
    const btn = document.getElementById('join-tournament-btn');
    const note = document.getElementById('join-tournament-note');
    if (!btn) return;

    const linked = events.find((event) => event.href);
    if (!linked) {
      btn.classList.add('is-disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.removeAttribute('href');
      btn.addEventListener('click', function (event) {
        event.preventDefault();
      });
      if (note) {
        note.textContent = 'Join Tournament stays closed until the next event is announced.';
      }
      return;
    }

    btn.classList.remove('is-disabled');
    btn.removeAttribute('aria-disabled');
    btn.href = linked.href;
    if (/^https?:/i.test(linked.href)) {
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
    }
    if (note) {
      note.textContent = 'Join ' + (linked.name || 'the next event') + ' — registration opens from this button.';
    }
  }

  function initInstagramSection() {
    const iframe = document.querySelector('.instagram-embed-wrap iframe');
    if (!iframe) return;

    iframe.addEventListener('load', function () {
      iframe.classList.add('is-loaded');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const events = upcomingEvents();
    initEventCountdown(events);
    renderFeaturedEvents(events);
    initJoinTournament(events);
    initInstagramSection();
  });
})();

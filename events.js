/**
 * Events page: live countdown + Instagram embed helpers
 */
(function () {
  const UPCOMING_EVENTS = [
    {
      iso: '2026-06-19T18:00:00-04:00',
      label: 'KICKOFF Summer Series V2 · June 19 · 6:00 PM ET',
      status: 'June 19th · 6:00 PM Eastern'
    },
    {
      iso: '2026-07-11T11:00:00-04:00',
      label: 'KICKOFF UNITY CUP · July 11 · 11:00 AM ET',
      status: 'July 11th · 11:00 AM Eastern'
    }
  ];

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function getNextEvent() {
    const now = Date.now();
    for (let i = 0; i < UPCOMING_EVENTS.length; i++) {
      const event = UPCOMING_EVENTS[i];
      if (new Date(event.iso).getTime() > now) {
        return { event, index: i };
      }
    }
    return null;
  }

  function initEventCountdown() {
    const root = document.getElementById('event-countdown');
    if (!root) return;

    const els = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]'),
      label: root.querySelector('.countdown-event-name'),
      status: root.querySelector('.countdown-status')
    };

    function applyEvent(event) {
      if (els.label) els.label.textContent = event.label;
      if (els.status) {
        els.status.textContent = event.status;
        els.status.classList.remove('is-live');
      }
      root.classList.remove('countdown-ended');
    }

    function tick() {
      const next = getNextEvent();

      if (!next) {
        const last = UPCOMING_EVENTS[UPCOMING_EVENTS.length - 1];
        if (els.label) els.label.textContent = last.label;
        if (els.days) els.days.textContent = '00';
        if (els.hours) els.hours.textContent = '00';
        if (els.minutes) els.minutes.textContent = '00';
        if (els.seconds) els.seconds.textContent = '00';
        if (els.status) {
          els.status.textContent = "We're live! See you on the pitch!";
          els.status.classList.add('is-live');
        }
        root.classList.add('countdown-ended');
        return;
      }

      applyEvent(next.event);

      const target = new Date(next.event.iso);
      const diff = target.getTime() - Date.now();

      if (diff <= 0) {
        tick();
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      if (els.days) els.days.textContent = pad(days);
      if (els.hours) els.hours.textContent = pad(hours);
      if (els.minutes) els.minutes.textContent = pad(minutes);
      if (els.seconds) els.seconds.textContent = pad(seconds);
    }

    tick();
    setInterval(tick, 1000);
  }

  function initInstagramSection() {
    const iframe = document.querySelector('.instagram-embed-wrap iframe');
    if (!iframe) return;

    iframe.addEventListener('load', function () {
      iframe.classList.add('is-loaded');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initEventCountdown();
    initInstagramSection();
  });
})();

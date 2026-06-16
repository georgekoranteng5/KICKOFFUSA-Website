/**
 * KICKOFF UNITY CUP page helpers
 *
 * Update DONATION_TOTAL whenever you want to reflect new fundraising numbers.
 */
(function () {
  const DONATION_TOTAL = 0;
  const DONATION_GOAL = 1000;

  const UPCOMING_EVENTS = [
    { iso: '2026-06-19T18:00:00-04:00', label: 'KICKOFF Summer Series V2 · June 19 · 6:00 PM ET', status: 'June 19th · 6:00 PM Eastern' },
    { iso: '2026-07-11T11:00:00-04:00', label: 'KICKOFF UNITY CUP · July 11 · 11:00 AM ET', status: 'July 11th · 11:00 AM Eastern' }
  ];

  const TEAMS = [
    { name: '500H', logo: 'assets/unity cup /500H.png' },
    { name: 'C2C', logo: 'assets/unity cup /C2C.png' },
    { name: 'CRWN', logo: 'assets/unity cup /CRWN.png' },
    { name: 'CYKLANTA', logo: 'assets/unity cup /CYKLANTA.png' },
    { name: 'ENJ', logo: 'assets/unity cup /ENJ.png' },
    { name: 'HAUS419', logo: 'assets/unity cup /HAUS419.png' },
    { name: 'PLAYHSE', logo: 'assets/unity cup /PLAYHSE.png' },
    { name: 'SME', logo: 'assets/unity cup /SME.png' }
  ];

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function initCountdown() {
    const root = document.getElementById('unity-countdown');
    if (!root) return;

    const event = UPCOMING_EVENTS[1];
    const target = new Date(event.iso);

    const els = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]'),
      label: root.querySelector('.countdown-event-name'),
      status: root.querySelector('.countdown-status')
    };

    if (els.label) els.label.textContent = event.label;
    if (els.status) els.status.textContent = event.status;

    function tick() {
      const diff = target.getTime() - Date.now();

      if (diff <= 0) {
        if (els.days) els.days.textContent = '00';
        if (els.hours) els.hours.textContent = '00';
        if (els.minutes) els.minutes.textContent = '00';
        if (els.seconds) els.seconds.textContent = '00';
        if (els.status) els.status.textContent = "We're live! See you on the pitch!";
        return;
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

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function initDonationTracker() {
    const amountEl = document.getElementById('donation-amount');
    const updatedEl = document.getElementById('donation-updated');
    const percentEl = document.getElementById('donation-percent');
    const progressBar = document.getElementById('donation-progress-bar');
    if (!amountEl) return;

    const duration = 1200;
    const start = performance.now();
    const from = 0;
    const to = DONATION_TOTAL;
    const goal = DONATION_GOAL;

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      const pct = Math.min(Math.round((current / goal) * 100), 100);

      amountEl.textContent = formatCurrency(current);
      if (percentEl) percentEl.textContent = pct + '%';
      if (progressBar) progressBar.style.width = pct + '%';

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else if (updatedEl) {
        updatedEl.textContent = 'Updated ' + new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    }

    requestAnimationFrame(frame);
  }

  function initTeams() {
    const grid = document.getElementById('unity-teams-grid');
    if (!grid) return;

    grid.innerHTML = TEAMS.map(function (team) {
      return (
        '<article class="unity-team-card">' +
          '<div class="unity-team-logo-wrap">' +
            '<img src="' + team.logo + '" alt="' + team.name + ' logo" loading="lazy">' +
          '</div>' +
          '<h3>' + team.name + '</h3>' +
        '</article>'
      );
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCountdown();
    initDonationTracker();
    initTeams();
  });
})();

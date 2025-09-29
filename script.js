// Global variables
let currentTournament = null;
let tournaments = [];
let isAdminLoggedIn = false;
const ADMIN_PASSWORD = 'GGS7338&'; // Change this to your desired password

// Navigation categories and their sub-links
const navigationCategories = {
  discover: [
    { text: 'Home', href: 'index.html', icon: '🏠' },
    { text: 'Events', href: 'events.html', icon: '⚽' },
    { text: 'Tournament', href: 'tournament.html', icon: '🏆' }
  ],
  store: [
    { text: 'Shop', href: 'shop.html', icon: '🛍️' }
  ],
  community: [
    { text: 'Gallery', href: 'gallery.html', icon: '📸' },
    { text: 'Contact', href: 'contact.html', icon: '📧' },
    { text: 'Admin', href: '#', onclick: 'toggleAdminPanel(); return false;', special: true, icon: '⚙️' }
  ]
};

// Function to get current page category
function getCurrentPageCategory() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (currentPage === 'index.html' || currentPage === '') {
    return 'discover';
  } else if (currentPage === 'events.html' || currentPage === 'tournament.html') {
    return 'discover';
  } else if (currentPage === 'shop.html') {
    return 'store';
  } else if (currentPage === 'gallery.html' || currentPage === 'contact.html') {
    return 'community';
  }
  
  return 'discover'; // default
}

// Function to set active secondary nav link
function setActiveSecondaryNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.secondary-nav-link').forEach(link => {
    link.classList.remove('active');
    link.style.background = 'transparent';
    
    if (link.getAttribute('href') === currentPage || 
        (currentPage === '' && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
      link.style.background = '';
    }
  });
}

// Function to update secondary navigation
function updateSecondaryNav(category) {
  const secondaryNav = document.getElementById('secondary-nav-links');
  if (!secondaryNav) return;
  
  const links = navigationCategories[category] || [];
  
  secondaryNav.innerHTML = links.map((link, index) => {
    const isAdmin = link.special;
    const adminStyle = isAdmin ? 'color: #666; font-size: 12px;' : '';
    const onclickAttr = link.onclick ? `onclick="${link.onclick}"` : '';
    const icon = link.icon ? `<span style="margin-right: 8px; font-size: 16px;">${link.icon}</span>` : '';
    
    return `<li><a href="${link.href}" class="secondary-nav-link" ${onclickAttr} style="color: #000; background: transparent; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-size: 14px; padding: 12px 20px; border-radius: 6px; border: none; text-decoration: none; transition: all 0.2s ease; display: inline-flex; align-items: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; ${adminStyle}">${icon}${link.text}</a></li>`;
  }).join('');
  
  // Add click handlers to secondary nav links
  document.querySelectorAll('.secondary-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      // Don't prevent default for admin link as it has its own onclick
      if (!link.getAttribute('onclick')) {
        // For regular links, let them navigate naturally
        // The active state will be set by setActiveSecondaryNavLink() on the new page
      }
    });
  });
}

// Function to set active category
function setActiveCategory(category) {
  // Remove active class from all categories
  document.querySelectorAll('.nav-category').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to clicked category
  const activeLink = document.querySelector(`[data-category="${category}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Initialize navigation
function initializeNavigation() {
  // Set category based on current page
  const currentCategory = getCurrentPageCategory();
  setActiveCategory(currentCategory);
  
  // Initially hide secondary nav
  const secondaryNav = document.querySelector('.secondary-nav');
  if (secondaryNav) {
    secondaryNav.style.display = 'none';
  }
  
  // Set active secondary nav link
  setTimeout(setActiveSecondaryNavLink, 100);
  
  // Add hover handlers to category links
  document.querySelectorAll('.nav-category').forEach(link => {
    link.addEventListener('mouseenter', (e) => {
      const category = link.getAttribute('data-category');
      updateSecondaryNav(category);
      setActiveCategory(category);
      
      // Show secondary nav
      const secondaryNav = document.querySelector('.secondary-nav');
      if (secondaryNav) {
        secondaryNav.style.display = 'block';
      }
    });
    
    // Add click handlers to category links - navigate to first item
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.getAttribute('data-category');
      const firstLink = navigationCategories[category]?.[0];
      
      if (firstLink && firstLink.href && !firstLink.special) {
        window.location.href = firstLink.href;
      }
    });
  });
  
  // Hide secondary nav when mouse leaves the header area
  const header = document.querySelector('header');
  if (header) {
    header.addEventListener('mouseleave', () => {
      const secondaryNav = document.querySelector('.secondary-nav');
      if (secondaryNav) {
        secondaryNav.style.display = 'none';
      }
    });
  }
}

// Notification system
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  const icon = document.getElementById('notification-icon');
  const messageEl = document.getElementById('notification-message');
  
  // Set message and icon based on type
  messageEl.textContent = message;
  
  if (type === 'success') {
    notification.style.backgroundColor = '#10b981';
    icon.textContent = '✓';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#ef4444';
    icon.textContent = '✕';
  } else if (type === 'info') {
    notification.style.backgroundColor = '#3b82f6';
    icon.textContent = 'ℹ';
  }
  
  // Show notification
  notification.style.transform = 'translateX(0)';
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
  }, 5000);
}

// Contact form submission
async function submitContactForm(event) {
  event.preventDefault();
  
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  
  // Validation
  if (!firstName || !lastName || !email || !message) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        message
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
      event.target.reset();
    } else {
      showNotification('Error sending message: ' + (result.message || 'Please try again'), 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showNotification('Unable to send message. Please check your internet connection.', 'error');
    } else {
      showNotification('Failed to send message. Please try again later.', 'error');
    }
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Countdown Timer Function
function startCountdown() {
  // Set the target date (October 4, 2025 at 2:00 PM) - using a future date
  const targetDate = new Date(2025, 9, 4, 14, 0, 0).getTime(); // Month is 0-indexed, so 9 = October
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    console.log('Countdown check:', { now, targetDate, distance }); // Debug log
    
    if (distance < 0) {
      // Event has passed
      const daysEl = document.getElementById('days');
      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');
      
      if (daysEl) daysEl.innerHTML = '00';
      if (hoursEl) hoursEl.innerHTML = '00';
      if (minutesEl) minutesEl.innerHTML = '00';
      if (secondsEl) secondsEl.innerHTML = '00';
      return;
    }
    
    // Calculate time units
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    console.log('Time remaining:', { days, hours, minutes, seconds }); // Debug log
    
    // Update the display
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.innerHTML = days.toString().padStart(2, '0');
    if (hoursEl) hoursEl.innerHTML = hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.innerHTML = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.innerHTML = seconds.toString().padStart(2, '0');
    
    // Add pulse animation to seconds
    if (secondsEl) {
      secondsEl.style.transform = 'scale(1.1)';
      setTimeout(() => {
        secondsEl.style.transform = 'scale(1)';
      }, 100);
    }
  }
  
  // Update immediately and then every second
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Enhanced scroll animations and intersection observer
function initializeScrollAnimations() {
  // Create intersection observer for scroll-triggered animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        
        // Add stagger animation to child elements
        if (entry.target.classList.contains('animate-stagger')) {
          const children = entry.target.children;
          Array.from(children).forEach((child, index) => {
            setTimeout(() => {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            }, index * 100);
          });
        }
      }
    });
  }, observerOptions);

  // Observe elements with animation classes
  document.querySelectorAll('.animate-on-scroll, .animate-stagger, .event-card, .tournament-card, .gallery-item').forEach(el => {
    observer.observe(el);
  });
}

// Parallax scroll effect
function initializeParallax() {
  const parallaxElements = document.querySelectorAll('.parallax-element');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    parallaxElements.forEach(element => {
      element.style.transform = `translateY(${rate}px)`;
    });
  });
}

// Enhanced loading states
function showLoadingState(element, message = 'Loading...') {
  const originalContent = element.innerHTML;
  element.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div class="loading-spinner loading-spinner-large"></div>
      <span style="margin-left: 12px; color: var(--muted);">${message}</span>
    </div>
  `;
  element.dataset.originalContent = originalContent;
}

function hideLoadingState(element) {
  if (element.dataset.originalContent) {
    element.innerHTML = element.dataset.originalContent;
    delete element.dataset.originalContent;
  }
}

// Smooth scroll to element
function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const targetPosition = element.offsetTop - headerHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// Load tournaments on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeScrollAnimations();
  initializeParallax();
  
  // Only run page-specific functions if elements exist
  if (document.getElementById('countdown')) {
    startCountdown();
  }
  
  if (document.getElementById('tournamentSelect')) {
    loadTournaments();
    loadCurrentTournament();
  }
  
  if (document.getElementById('galleryGrid')) {
    loadGallery();
    initializeGallery();
  }
  
  // Handle Enter key in password field
  const passwordField = document.getElementById('adminPassword');
  if (passwordField) {
    passwordField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        adminLogin();
      }
    });
  }

  // Add scroll indicator click handler
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const nextSection = document.querySelector('section');
      if (nextSection) {
        smoothScrollTo(nextSection.id);
      }
    });
  }
});

// Load available tournaments
async function loadTournaments() {
  try {
    const response = await fetch('http://localhost:3000/api/tournaments');
    tournaments = await response.json();
    
    const select = document.getElementById('tournamentSelect');
    if (select) {
      select.innerHTML = '<option value="">Select Tournament</option>';
      
      tournaments.forEach(tournament => {
        if (tournament.status === 'upcoming' || tournament.status === 'active') {
          const option = document.createElement('option');
          option.value = tournament.id;
          option.textContent = tournament.name;
          select.appendChild(option);
        }
      });
    }
  } catch (error) {
    console.error('Error loading tournaments:', error);
  }
}

// Load current active tournament
async function loadCurrentTournament() {
  try {
    const response = await fetch('http://localhost:3000/api/tournaments');
    const allTournaments = await response.json();
    
    // Find active tournament
    const activeTournament = allTournaments.find(t => t.status === 'active');
    
    const currentTournamentEl = document.getElementById('currentTournament');
    if (currentTournamentEl) {
      if (activeTournament) {
        currentTournament = activeTournament;
        displayCurrentTournament(activeTournament);
        loadTournamentData();
      } else {
        currentTournamentEl.innerHTML = 
          '<p style="text-align: center; color: #374151;">No active tournament</p>';
      }
    }
  } catch (error) {
    console.error('Error loading current tournament:', error);
  }
}

// Display current tournament info
function displayCurrentTournament(tournament) {
  const container = document.getElementById('currentTournament');
  if (!container) return;
  
  container.innerHTML = `
    <div class="tournament-status">
      <div class="status-badge active">${tournament.status.toUpperCase()}</div>
      <h4 style="color: #111827; margin: 8px 0;">${tournament.name}</h4>
      <p style="color: #374151; margin: 4px 0;">Teams can register and view live updates</p>
    </div>
  `;
}

// Team registration function
async function createTeam() {
  const tournamentId = document.getElementById('tournamentSelect').value;
  const teamName = document.getElementById('teamName').value;
  const captainName = document.getElementById('captainName').value;
  const captainEmail = document.getElementById('captainEmail').value;
  const phoneNumber = document.getElementById('phoneNumber').value;
  const skillLevel = document.getElementById('skillLevel').value;

  // Enhanced validation
  if (!tournamentId || !teamName || !captainName || !captainEmail || !phoneNumber || !skillLevel) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(captainEmail)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }

  // Phone validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
    showNotification('Please enter a valid phone number', 'error');
    return;
  }

  // Show loading state
  const submitBtn = document.querySelector('.team-form button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Registering...';
  submitBtn.disabled = true;

  try {
    // Send data to backend
    const response = await fetch('http://localhost:3000/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tournamentId,
        teamName,
        captainName,
        captainEmail,
        phoneNumber,
        skillLevel
      })
    });

    const result = await response.json();

    if (response.ok) {
      showNotification(`Team "${teamName}" registered successfully! You'll receive a confirmation email shortly.`, 'success');
      // Reset form
      document.querySelector('.team-form').reset();
      loadTournaments(); // Refresh tournament list
    } else {
      showNotification('Error registering team: ' + (result.error || 'Unknown error occurred'), 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showNotification('Unable to connect to server. Please check your internet connection and try again.', 'error');
    } else {
      showNotification('Failed to register team. Please try again later.', 'error');
    }
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Admin functions
// Toggle admin panel (now shows login first)
function toggleAdminPanel() {
  if (isAdminLoggedIn) {
    // If already logged in, show admin panel
    const panel = document.getElementById('adminPanel');
    if (panel) {
      const newDisplay = panel.style.display === 'none' ? 'block' : 'none';
      panel.style.display = newDisplay;
      
      if (newDisplay === 'block') {
        loadKnockoutStage();
      }
    }
  } else {
    // If not logged in, show login panel
    const loginPanel = document.getElementById('adminLoginPanel');
    if (loginPanel) {
      loginPanel.style.display = 'block';
      document.getElementById('adminPassword').focus();
    }
  }
}

// Admin login function
function adminLogin() {
  const password = document.getElementById('adminPassword').value;
  const errorElement = document.getElementById('adminLoginError');
  
  if (password === ADMIN_PASSWORD) {
    isAdminLoggedIn = true;
    closeAdminLogin();
    toggleAdminPanel(); // This will now show the admin panel
    updateAdminButtonStatus();
    loadTournamentData(); // Refresh tournament data to show admin controls
    errorElement.style.display = 'none';
  } else {
    errorElement.style.display = 'block';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
  }
}

// Close admin login panel
function closeAdminLogin() {
  const loginPanel = document.getElementById('adminLoginPanel');
  if (loginPanel) {
    loginPanel.style.display = 'none';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminLoginError').style.display = 'none';
  }
}

// Admin logout function
function adminLogout() {
  isAdminLoggedIn = false;
  const panel = document.getElementById('adminPanel');
  if (panel) {
    panel.style.display = 'none';
  }
  updateAdminButtonStatus();
  loadTournamentData(); // Refresh tournament data to hide admin controls
  alert('Admin logged out successfully');
}

// Update admin button appearance based on login status
function updateAdminButtonStatus() {
  const adminLink = document.getElementById('adminLink');
  if (!adminLink) return;
  
  if (isAdminLoggedIn) {
    adminLink.textContent = 'Admin ✓';
    adminLink.style.color = '#10b981';
  } else {
    adminLink.textContent = 'Admin';
    adminLink.style.color = '#666';
  }
}

// Create tournament (Admin only)
async function createTournament() {
  if (!isAdminLoggedIn) {
    alert('Admin access required. Please log in first.');
    return;
  }
  
  const tournamentName = prompt('Enter tournament name:');
  if (!tournamentName) return;

  try {
    const response = await fetch('http://localhost:3000/api/tournaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: tournamentName })
    });

    const result = await response.json();

    if (response.ok) {
      alert('Tournament created successfully!');
      loadTournaments();
      loadCurrentTournament();
    } else {
      alert('Error creating tournament: ' + result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create tournament. Please check if the server is running.');
  }
}

// Generate groups and fixtures (Admin only)
async function generateGroups() {
  if (!isAdminLoggedIn) {
    handleApiWarning('Admin access required. Please log in first.', 'Authentication Required');
    return;
  }
  
  if (!currentTournament) {
    handleApiWarning('Please set a tournament as active first', 'No Active Tournament');
    return;
  }

  const button = event.target;
  setButtonLoading(button, true, 'Generating Tournament...');
  showLoadingOverlay('Generating tournament groups and fixtures...');

  try {
    const response = await fetch(`http://localhost:3000/api/tournaments/${currentTournament.id}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupSize: 4 })
    });

    const result = await response.json();

    if (response.ok) {
      handleApiSuccess(`Tournament generated successfully! Groups: ${result.groups}, Matches: ${result.matches}`, 'Tournament Generated');
      loadTournamentData();
    } else {
      handleApiError(new Error(result.error), 'Tournament Generation');
    }
  } catch (error) {
    handleApiError(error, 'Tournament Generation');
  } finally {
    setButtonLoading(button, false);
    hideLoadingOverlay();
  }
}

// Generate knockout stage
async function generateKnockout() {
  if (!isAdminLoggedIn) {
    handleApiWarning('Admin access required. Please log in first.', 'Authentication Required');
    return;
  }
  
  const button = event.target;
  setButtonLoading(button, true, 'Generating Knockout...');
  showLoadingOverlay('Generating knockout stage...');
  
  try {
    // First, get the active tournament
    const tournamentsResponse = await fetch('http://localhost:3000/api/tournaments');
    const tournaments = await tournamentsResponse.json();
    
    const activeTournament = tournaments.find(t => t.status === 'active');
    
    if (!activeTournament) {
      handleApiWarning('No active tournament found. Please create and activate a tournament first.', 'No Active Tournament');
      return;
    }

    // Generate knockout stage
    const response = await fetch(`http://localhost:3000/api/tournaments/${activeTournament.id}/knockout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    const result = await response.json();

    if (response.ok) {
      handleApiSuccess(`Knockout stage generated successfully! Semi-finals: ${result.semiFinals}, Final: ${result.final}, Teams: ${result.teams}`, 'Knockout Stage Generated');
      loadKnockoutStage();
      loadTournamentData();
    } else {
      handleApiError(new Error(result.error), 'Knockout Generation');
    }
  } catch (error) {
    handleApiError(error, 'Knockout Generation');
  } finally {
    setButtonLoading(button, false);
    hideLoadingOverlay();
  }
}

// Load knockout stage
async function loadKnockoutStage() {
  try {
    const tournamentsResponse = await fetch('http://localhost:3000/api/tournaments');
    const tournaments = await tournamentsResponse.json();
    
    const activeTournament = tournaments.find(t => t.status === 'active');
    
    const knockoutStageEl = document.getElementById('knockoutStage');
    if (!knockoutStageEl) return;
    
    if (!activeTournament) {
      knockoutStageEl.innerHTML = 
        '<p style="text-align: center; color: var(--muted);">No active tournament</p>';
      return;
    }

    const response = await fetch(`http://localhost:3000/api/tournaments/${activeTournament.id}/knockout`);
    const knockoutMatches = await response.json();
    
    displayKnockoutStage(knockoutMatches);
  } catch (error) {
    console.error('Error loading knockout stage:', error);
  }
}

// Display knockout stage
function displayKnockoutStage(matches) {
  const container = document.getElementById('knockoutStage');
  if (!container) return;
  
  if (matches.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted);">No knockout matches found</p>';
    return;
  }

  let html = '<div class="knockout-bracket">';
  
  // Group matches by round
  const allKnockoutMatches = matches.filter(m => m.stage === 'knockout');
  
  // Check if this is a single group tournament (direct final) or multi-group (semi-finals)
  // Single group: only 1 match with round_number = 1
  // Multi-group: 2 matches with round_number = 1 (semi-finals) + 1 match with round_number = 2 (final)
  const isSingleGroup = allKnockoutMatches.length === 1 && allKnockoutMatches[0].round_number === 1;
  
  if (isSingleGroup) {
    // Single group tournament - show as Final
    html += '<div class="knockout-round"><h4>Final</h4>';
    allKnockoutMatches.forEach(match => {
      const matchTime = new Date(match.match_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      const isCompleted = match.status === 'completed';
      const scoreDisplay = isCompleted ? 
        `${match.team1_score} - ${match.team2_score}` : 
        isAdminLoggedIn ? 
          `<input type="number" class="score-input" id="score1_${match.id}" placeholder="0" min="0"> - <input type="number" class="score-input" id="score2_${match.id}" placeholder="0" min="0">` :
          'TBD - TBD';
      
      const updateButton = isCompleted ? 
        '<span style="color: #10b981; font-size: 12px;">Completed</span>' :
        isAdminLoggedIn ? 
          `<button class="update-score-btn" onclick="updateMatchResult(${match.id})">Update</button>` :
          '<span style="color: #f59e0b; font-size: 12px;">Scheduled</span>';
      
      html += `
        <div class="knockout-match">
          <div class="match-time" style="color: #111827;">${matchTime}</div>
          <div class="match-teams" style="color: #111827;">${match.team1_name || 'TBD'} vs ${match.team2_name || 'TBD'}</div>
          <div class="match-score" style="color: #111827;">${scoreDisplay}</div>
          <div>${updateButton}</div>
        </div>
      `;
    });
    html += '</div>';
  } else {
    // Multi-group tournament - show semi-finals and final
    const semiFinals = allKnockoutMatches.filter(m => m.round_number === 1);
    const finals = allKnockoutMatches.filter(m => m.round_number === 2);
  
  if (semiFinals.length > 0) {
    html += '<div class="knockout-round"><h4>Semi-Finals</h4>';
    semiFinals.forEach(match => {
      const matchTime = new Date(match.match_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      const isCompleted = match.status === 'completed';
      const scoreDisplay = isCompleted ? 
        `${match.team1_score} - ${match.team2_score}` : 
        isAdminLoggedIn ? 
          `<input type="number" class="score-input" id="score1_${match.id}" placeholder="0" min="0"> - <input type="number" class="score-input" id="score2_${match.id}" placeholder="0" min="0">` :
          'TBD - TBD';
      
      const updateButton = isCompleted ? 
        '<span style="color: #10b981; font-size: 12px;">Completed</span>' :
        isAdminLoggedIn ? 
          `<button class="update-score-btn" onclick="updateMatchResult(${match.id})">Update</button>` :
          '<span style="color: #f59e0b; font-size: 12px;">Scheduled</span>';
      
      html += `
        <div class="knockout-match">
          <div class="match-time" style="color: #111827;">${matchTime}</div>
          <div class="match-teams" style="color: #111827;">${match.team1_name || 'TBD'} vs ${match.team2_name || 'TBD'}</div>
          <div class="match-score" style="color: #111827;">${scoreDisplay}</div>
          <div>${updateButton}</div>
        </div>
      `;
    });
    html += '</div>';
  }
  
  if (finals.length > 0) {
    html += '<div class="knockout-round"><h4>Final</h4>';
    finals.forEach(match => {
      const matchTime = new Date(match.match_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      const isCompleted = match.status === 'completed';
      const isPending = match.status === 'pending';
      const scoreDisplay = isCompleted ? 
        `${match.team1_score} - ${match.team2_score}` : 
        isPending ? 'TBD vs TBD' :
        isAdminLoggedIn ? 
          `<input type="number" class="score-input" id="score1_${match.id}" placeholder="0" min="0"> - <input type="number" class="score-input" id="score2_${match.id}" placeholder="0" min="0">` :
          'TBD - TBD';
      
      const updateButton = isCompleted ? 
        '<span style="color: #10b981; font-size: 12px;">Completed</span>' :
        isPending ? '<span style="color: #f59e0b; font-size: 12px;">Waiting for semi-finals</span>' :
        isAdminLoggedIn ? 
          `<button class="update-score-btn" onclick="updateMatchResult(${match.id})">Update</button>` :
          '<span style="color: #f59e0b; font-size: 12px;">Scheduled</span>';
      
      html += `
        <div class="knockout-match">
          <div class="match-time" style="color: #111827;">${matchTime}</div>
          <div class="match-teams" style="color: #111827;">${match.team1_name || 'TBD'} vs ${match.team2_name || 'TBD'}</div>
          <div class="match-score" style="color: #111827;">${scoreDisplay}</div>
          <div>${updateButton}</div>
        </div>
      `;
    });
    html += '</div>';
    }
  }
  
  html += '</div>';
  container.innerHTML = html;
}

// Load tournament data
async function loadTournamentData() {
  if (!currentTournament) return;

  try {
    // Load groups
    const groupsResponse = await fetch(`http://localhost:3000/api/tournaments/${currentTournament.id}/groups`);
    const groups = await groupsResponse.json();
    displayGroupStandings(groups);

    // Load matches
    const matchesResponse = await fetch(`http://localhost:3000/api/tournaments/${currentTournament.id}/matches`);
    const matches = await matchesResponse.json();
    displayMatchSchedule(matches);

    // Load knockout stage
    await loadKnockoutStage();
  } catch (error) {
    console.error('Error loading tournament data:', error);
  }
}

// Display group standings
function displayGroupStandings(groups) {
  const container = document.getElementById('groupStandings');
  if (!container) return;
  
  if (groups.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #374151;">No groups found</p>';
    return;
  }

  const groupDescription = groups.length === 1 ? 
    'All teams play in a single group for round-robin play' : 
    'Teams are randomly assigned to groups for round-robin play';

  let html = `
    <div style="margin-bottom: 20px; text-align: center;">
      <h3 style="color: #111827; margin: 0;">Tournament Groups (${groups.length} Group${groups.length > 1 ? 's' : ''})</h3>
      <p style="color: #374151; margin: 8px 0 0;">${groupDescription}</p>
    </div>
    <div class="groups-container">
  `;
  groups.forEach(group => {
    html += `
      <div class="group-standings">
        <h4 class="group-title">Group ${group.group_name}</h4>
        <div style="overflow-x: auto;">
          <table class="group-table">
            <thead>
              <tr>
                <th style="width: 40px;">Pos</th>
                <th style="width: 140px;">Team</th>
                <th style="width: 30px;">P</th>
                <th style="width: 30px;">W</th>
                <th style="width: 30px;">D</th>
                <th style="width: 30px;">L</th>
                <th style="width: 30px;">GF</th>
                <th style="width: 30px;">GA</th>
                <th style="width: 30px;">GD</th>
                <th style="width: 40px;">Pts</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    group.teams.forEach((team, index) => {
      const wins = Math.floor(team.points / 3);
      const draws = team.points % 3;
      const losses = team.matches_played - wins - draws;
      const goalDiff = team.goals_for - team.goals_against;
      
      html += `
        <tr>
          <td style="color: #111827;">${index + 1}</td>
          <td style="color: #111827; font-weight: 500;">${team.team_name}</td>
          <td style="color: #111827;">${team.matches_played}</td>
          <td style="color: #111827;">${wins}</td>
          <td style="color: #111827;">${draws}</td>
          <td style="color: #111827;">${losses}</td>
          <td style="color: #111827;">${team.goals_for}</td>
          <td style="color: #111827;">${team.goals_against}</td>
          <td style="color: #111827;">${goalDiff}</td>
          <td style="color: #111827; font-weight: 600;">${team.points}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table></div></div>';
  });
  
  html += '</div>'; // Close groups-container
  container.innerHTML = html;
}

// Display match schedule
function displayMatchSchedule(matches) {
  const container = document.getElementById('matchSchedule');
  if (!container) return;
  
  if (matches.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #374151;">No matches found</p>';
    return;
  }

  let html = '';
  matches.forEach(match => {
    const matchTime = new Date(match.match_time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const isCompleted = match.status === 'completed';
      const scoreDisplay = isCompleted ? 
        `${match.team1_score} - ${match.team2_score}` : 
        isAdminLoggedIn ? 
          `<input type="number" class="score-input" id="score1_${match.id}" placeholder="0" min="0"> - <input type="number" class="score-input" id="score2_${match.id}" placeholder="0" min="0">` :
          'TBD - TBD';
      
      const updateButton = isCompleted ? 
        '<span class="match-status completed">Completed</span>' :
        isAdminLoggedIn ? 
          `<button class="update-score-btn" onclick="updateMatchResult(${match.id})">Update</button>` :
          '<span class="match-status scheduled">Scheduled</span>';
    
    html += `
      <div class="match-item">
        <div class="match-time" style="color: #111827;">${matchTime}</div>
        <div class="match-teams" style="color: #111827;">${match.team1_name} vs ${match.team2_name}</div>
        <div class="match-score" style="color: #111827;">${scoreDisplay}</div>
        <div>${updateButton}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Update match result
async function updateMatchResult(matchId) {
  if (!isAdminLoggedIn) {
    handleApiWarning('Admin access required to update match scores. Please log in first.', 'Authentication Required');
    return;
  }
  
  const score1 = document.getElementById(`score1_${matchId}`).value;
  const score2 = document.getElementById(`score2_${matchId}`).value;
  
  if (!score1 || !score2) {
    handleApiWarning('Please enter both scores', 'Invalid Input');
    return;
  }

  const button = event.target;
  setButtonLoading(button, true, 'Updating Score...');

  try {
    const response = await fetch(`http://localhost:3000/api/matches/${matchId}/result`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        team1_score: parseInt(score1),
        team2_score: parseInt(score2)
      })
    });

    const result = await response.json();

    if (response.ok) {
      // Check if this is a final match and announce winner
      const isFinalMatch = await checkIfFinalMatch(matchId);
      if (isFinalMatch) {
        const winner = parseInt(score1) > parseInt(score2) ? 
          document.querySelector(`#score1_${matchId}`).parentElement.querySelector('.match-teams').textContent.split(' vs ')[0] :
          document.querySelector(`#score2_${matchId}`).parentElement.querySelector('.match-teams').textContent.split(' vs ')[1];
        handleApiSuccess(`🏆 TOURNAMENT WINNER ANNOUNCED! 🏆\n\n${winner} has won the tournament!\n\nFinal Score: ${score1} - ${score2}`, 'Tournament Winner!');
      } else {
        handleApiSuccess('Match result updated successfully!', 'Score Updated');
      }
      loadTournamentData(); // Refresh the display
    } else {
      handleApiError(new Error(result.error), 'Score Update');
    }
  } catch (error) {
    handleApiError(error, 'Score Update');
  } finally {
    setButtonLoading(button, false);
  }
}

// Check if a match is a final match
async function checkIfFinalMatch(matchId) {
  try {
    const response = await fetch(`http://localhost:3000/api/matches/${matchId}`);
    const match = await response.json();
    
    // A match is a final if it's a knockout match with round_number 1 (single group) or round_number 2 (multi-group)
    return match.stage === 'knockout' && (match.round_number === 1 || match.round_number === 2);
  } catch (error) {
    console.error('Error checking if final match:', error);
    return false;
  }
}

// Utility Functions for Loading States and Error Handling

// Show loading overlay
function showLoadingOverlay(message = 'Loading...') {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner loading-spinner-large"></div>
      <p style="margin-top: 15px; color: #2c3e50; font-weight: 500;">${message}</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Show button loading state
function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
  if (isLoading) {
    button.classList.add('button-loading');
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = `<span class="loading-spinner"></span>${loadingText}`;
  } else {
    button.classList.remove('button-loading');
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

// Toast notification system
function showToast(type, title, message, duration = 5000) {
  // Create toast container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-header">
      <h4 class="toast-title">${title}</h4>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <p class="toast-message">${message}</p>
  `;

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// Enhanced error handling with user-friendly messages
function handleApiError(error, context = 'operation') {
  console.error(`Error in ${context}:`, error);
  
  let userMessage = 'Something went wrong. Please try again.';
  let title = 'Error';
  
  if (error.message) {
    if (error.message.includes('Failed to fetch')) {
      userMessage = 'Unable to connect to the server. Please check your internet connection.';
      title = 'Connection Error';
    } else if (error.message.includes('400')) {
      userMessage = 'Invalid request. Please check your input and try again.';
      title = 'Invalid Request';
    } else if (error.message.includes('401')) {
      userMessage = 'You need to log in to perform this action.';
      title = 'Authentication Required';
    } else if (error.message.includes('403')) {
      userMessage = 'You don\'t have permission to perform this action.';
      title = 'Access Denied';
    } else if (error.message.includes('404')) {
      userMessage = 'The requested resource was not found.';
      title = 'Not Found';
    } else if (error.message.includes('500')) {
      userMessage = 'Server error. Please try again later.';
      title = 'Server Error';
    }
  }
  
  showToast('error', title, userMessage);
}

// Enhanced success handling
function handleApiSuccess(message, title = 'Success') {
  showToast('success', title, message);
}

// Enhanced warning handling
function handleApiWarning(message, title = 'Warning') {
  showToast('warning', title, message);
}

// Payment Integration Functions

// Show payment modal
function showPaymentModal(teamData, tournamentId, amount = 5) {
  const modal = document.createElement('div');
  modal.className = 'payment-modal';
  modal.id = 'payment-modal';
  modal.innerHTML = `
    <div class="payment-modal-content">
      <div class="payment-header">
        <h3>Complete Registration Payment</h3>
        <button class="payment-close" onclick="closePaymentModal()">×</button>
      </div>
      <div class="payment-body">
        <div class="payment-summary">
          <h4>Registration Summary</h4>
          <p><strong>Team:</strong> ${teamData.team_name}</p>
          <p><strong>Captain:</strong> ${teamData.captain_name}</p>
          <p><strong>Tournament Entry Fee:</strong> $${amount}</p>
          <div class="payment-total">
            <strong>Total: $${amount}</strong>
          </div>
        </div>
        <div class="payment-form">
          <div id="payment-element">
            <!-- Stripe Elements will be inserted here -->
          </div>
          <button id="payment-button" class="payment-button" onclick="processPayment()">
            <span class="loading-spinner" style="display: none;"></span>
            Pay $${amount}
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal styles
  const style = document.createElement('style');
  style.textContent = `
    .payment-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }
    .payment-modal-content {
      background: white;
      border-radius: 10px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .payment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }
    .payment-header h3 {
      margin: 0;
      color: #2c3e50;
    }
    .payment-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #7f8c8d;
    }
    .payment-body {
      padding: 20px;
    }
    .payment-summary {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .payment-summary h4 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }
    .payment-summary p {
      margin: 5px 0;
      color: #34495e;
    }
    .payment-total {
      border-top: 1px solid #ddd;
      padding-top: 10px;
      margin-top: 10px;
      font-size: 18px;
      color: #2c3e50;
    }
    #payment-element {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    .payment-button {
      width: 100%;
      padding: 15px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .payment-button:hover {
      background: #2980b9;
    }
    .payment-button:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(modal);
  
  // Store payment data
  window.currentPaymentData = {
    teamData,
    tournamentId,
    amount
  };
}

// Close payment modal
function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.remove();
  }
  delete window.currentPaymentData;
}

// Process payment
async function processPayment() {
  const button = document.getElementById('payment-button');
  const spinner = button.querySelector('.loading-spinner');
  
  setButtonLoading(button, true, 'Processing Payment...');
  
  try {
    const { teamData, tournamentId, amount } = window.currentPaymentData;
    
    // Create payment intent
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        tournamentId,
        teamId: teamData.id
      })
    });
    
    const { clientSecret } = await response.json();
    
    if (response.ok) {
      // In a real implementation, you would use Stripe Elements here
      // For now, we'll simulate a successful payment
      setTimeout(() => {
        confirmPayment(teamData.id, tournamentId);
      }, 2000);
    } else {
      handleApiError(new Error('Failed to create payment intent'), 'Payment');
    }
  } catch (error) {
    handleApiError(error, 'Payment');
  } finally {
    setButtonLoading(button, false);
  }
}

// Confirm payment
async function confirmPayment(teamId, tournamentId) {
  try {
    const response = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId: 'pi_test_' + Date.now(),
        teamId,
        tournamentId
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      handleApiSuccess('Payment successful! Team registration completed.', 'Payment Confirmed');
      closePaymentModal();
      // Refresh team list or redirect
      if (typeof loadTeams === 'function') {
        loadTeams();
      }
    } else {
      handleApiError(new Error(result.error), 'Payment Confirmation');
    }
  } catch (error) {
    handleApiError(error, 'Payment Confirmation');
  }
}

// Gallery Functions
let galleryItems = [];
let currentFilter = 'all';
let availableEvents = new Set();
let currentPage = 1;
const itemsPerPage = 9;

// Initialize gallery
function initializeGallery() {
  loadGallery();
}

// Load gallery items from static files
async function loadGallery() {
  try {
    // Static gallery data for GitHub Pages
    galleryItems = [
      // CHAMPION SOUND images
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6162.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6163.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6164.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6165.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6167.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6168.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6169.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6172.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6184.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6185.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6186.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      { src: 'assets/gallery/CHAMPION SOUND/IMG_6191.jpeg', event_name: 'CHAMPION SOUND', type: 'image' },
      
      // KICKOFF CUP images
      { src: 'assets/gallery/KICKOFF CUP/DSCN0336.JPG', event_name: 'KICKOFF CUP', type: 'image' },
      { src: 'assets/gallery/KICKOFF CUP/IMG_3762.HEIC', event_name: 'KICKOFF CUP', type: 'image' },
      { src: 'assets/gallery/KICKOFF CUP/IMG_3830.JPG', event_name: 'KICKOFF CUP', type: 'image' },
      { src: 'assets/gallery/KICKOFF CUP/IMG_3831.JPG', event_name: 'KICKOFF CUP', type: 'image' },
      { src: 'assets/gallery/KICKOFF CUP/IMG_3834.JPG', event_name: 'KICKOFF CUP', type: 'image' },
      { src: 'assets/gallery/KICKOFF CUP/IMG_3884.JPG', event_name: 'KICKOFF CUP', type: 'image' },
      { src: 'assets/gallery/KICKOFF CUP/IMG_3885.JPG', event_name: 'KICKOFF CUP', type: 'image' },
      { src: 'assets/gallery/KICKOFF CUP/IMG_5823.JPG', event_name: 'KICKOFF CUP', type: 'image' },
      
      // SUMMER SERIES images
      { src: 'assets/gallery/SUMMER SERIES /AO4I9247.jpg', event_name: 'SUMMER SERIES', type: 'image' },
      { src: 'assets/gallery/SUMMER SERIES /AO4I9452.jpg', event_name: 'SUMMER SERIES', type: 'image' },
      { src: 'assets/gallery/SUMMER SERIES /AO4I9498.jpg', event_name: 'SUMMER SERIES', type: 'image' },
      { src: 'assets/gallery/SUMMER SERIES /AO4I9753.jpg', event_name: 'SUMMER SERIES', type: 'image' },
      { src: 'assets/gallery/SUMMER SERIES /AO4I9895.jpg', event_name: 'SUMMER SERIES', type: 'image' },
      { src: 'assets/gallery/SUMMER SERIES /AO4I9928.jpg', event_name: 'SUMMER SERIES', type: 'image' },
      { src: 'assets/gallery/SUMMER SERIES /AO4I9950.jpg', event_name: 'SUMMER SERIES', type: 'image' }
    ];
    
    // Extract unique events for filter buttons
    availableEvents.clear();
    galleryItems.forEach(item => {
      availableEvents.add(item.event_name);
    });
    
    updateFilterButtons();
    displayGallery();
  } catch (error) {
    console.error('Error loading gallery:', error);
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
      galleryGrid.innerHTML = 
        '<div style="text-align: center; color: var(--muted); grid-column: 1 / -1; padding: 40px;"><p>Failed to load gallery. Please try again later.</p></div>';
    }
  }
}

// Update filter buttons based on available events
function updateFilterButtons() {
  const filtersContainer = document.getElementById('galleryFilters');
  if (!filtersContainer) return;
  
  let html = '<button class="filter-btn active" onclick="filterGallery(\'all\', this)">All Events</button>';
  
  Array.from(availableEvents).sort().forEach(eventName => {
    html += `<button class="filter-btn" onclick="filterGallery('${eventName}', this)">${eventName}</button>`;
  });
  
  filtersContainer.innerHTML = html;
}

// Display gallery items with pagination
function displayGallery() {
  const container = document.getElementById('galleryGrid');
  if (!container) return;
  
  if (galleryItems.length === 0) {
    container.innerHTML = 
      '<div style="text-align: center; color: var(--muted); grid-column: 1 / -1; padding: 40px;"><p>No media available yet. Check back soon for event photos and videos!</p></div>';
    return;
  }

  // Filter items
  const filteredItems = currentFilter === 'all' ? galleryItems : 
    galleryItems.filter(item => item.event_name === currentFilter);

  if (filteredItems.length === 0) {
    container.innerHTML = 
      '<div style="text-align: center; color: var(--muted); grid-column: 1 / -1; padding: 40px;"><p>No media found for this event.</p></div>';
    return;
  }

  // Calculate pagination
  const startIndex = 0;
  const endIndex = currentPage * itemsPerPage;
  const itemsToShow = filteredItems.slice(startIndex, endIndex);
  const hasMore = endIndex < filteredItems.length;

  let html = '';
  itemsToShow.forEach(item => {
    const isVideo = item.type === 'video';
    const mediaElement = isVideo ? 
      `<video controls><source src="${item.src}" type="video/mp4"></video>` :
      `<img src="${item.src}" alt="${item.event_name}" loading="lazy">`;
    
    const playIcon = isVideo ? '<div class="play-icon">▶</div>' : '';
    
    html += `
      <div class="gallery-item">
        <div class="media">
          ${mediaElement}
          ${playIcon}
        </div>
        <div class="content">
          <div class="event-name">${item.event_name}</div>
        </div>
      </div>
    `;
  });

  // Add "View More" button if there are more items
  if (hasMore) {
    html += `
      <div class="gallery-load-more" style="grid-column: 1 / -1; text-align: center; padding: 20px;">
        <button class="btn outline" onclick="loadMoreItems()" style="padding: 12px 24px; font-size: 16px;">
          View More (${filteredItems.length - endIndex} remaining)
        </button>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// Load more items
function loadMoreItems() {
  currentPage++;
  displayGallery();
}

// Filter gallery by event
function filterGallery(filter, clickedButton) {
  currentFilter = filter;
  currentPage = 1; // Reset to first page when filtering
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (clickedButton) {
    clickedButton.classList.add('active');
  }
  
  displayGallery();
}


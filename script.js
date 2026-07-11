// ===== MOBILE MENU TOGGLE =====
function toggleMenu() {
    const menu = document.querySelector('.nav-menu');
    menu.classList.toggle('open');
}

// Close menu when a link is clicked
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.remove('open');
    });
});

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .class-card, .stat-item').forEach(el => {
    observer.observe(el);
});

// ===== SEARCH FUNCTION (for later) =====
function searchResources() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    // This will be connected to your library
    console.log('Searching for:', query);
}

// ===== CLASS SELECTOR =====
function selectClass(className) {
    localStorage.setItem('selectedClass', className);
    window.location.href = 'library.html';
}

// Load saved class preference
document.addEventListener('DOMContentLoaded', () => {
    const savedClass = localStorage.getItem('selectedClass');
    if (savedClass) {
        console.log('Welcome back! Class:', savedClass);
    }
});

console.log('📚 Bidyut Educational Platform loaded successfully!');

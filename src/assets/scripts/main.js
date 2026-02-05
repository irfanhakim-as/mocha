// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSmoothScroll();
    initMobileMenu();
    initLightbox();
    updateAge();
});

// Theme toggle functionality
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const root = document.documentElement;

    // check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        root.setAttribute('data-theme', savedTheme);
    }
    // system preference is handled by CSS if none saved

    if (!toggle) return;

    toggle.addEventListener('click', () => {
        // add transition class for smooth theme change
        root.classList.add('theme-transition');
        // determine current theme
        const currentTheme = root.getAttribute('data-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let newTheme;
        if (currentTheme === 'dark') {
            newTheme = 'light';
        } else if (currentTheme === 'light') {
            newTheme = 'dark';
        } else {
            // toggle based on system preference if no explicit theme set
            newTheme = systemPrefersDark ? 'light' : 'dark';
        }
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        // remove transition class after animation completes
        setTimeout(() => {
            root.classList.remove('theme-transition');
        }, 300);
    });

    // listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        // apply if user has not set explicit preference
        if (!localStorage.getItem('theme')) {
            // add transition eventhough CSS should handle this automatically
            root.classList.add('theme-transition');
            setTimeout(() => {
                root.classList.remove('theme-transition');
            }, 300);
        }
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                // close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const toggle = document.querySelector('.header__menu-toggle');
    const nav = document.querySelector('.header__nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('is-open');
    });

    // close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    const toggle = document.querySelector('.header__menu-toggle');
    const nav = document.querySelector('.header__nav');
    if (toggle && nav) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
    }
}

// Calculate and update age from DOB
function updateAge() {
    const ageElements = document.querySelectorAll('[data-dob]');
    ageElements.forEach(el => {
        if (!el.dataset.dob) return;
        const dob = new Date(el.dataset.dob);
        if (isNaN(dob.getTime())) return;
        el.textContent = calculateAge(dob);
    });
}

function calculateAge(dob) {
    if (!dob || isNaN(dob.getTime())) return '';
    const now = new Date();
    const diff = now - dob;
    const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    if (years === 0) {
        return `${months} month${months !== 1 ? 's' : ''} old`;
    } else if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''} old`;
    } else {
        return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`;
    }
}

// Lightbox for images
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox__image');
    const lightboxClose = lightbox?.querySelector('.lightbox__close');

    if (!lightbox || !lightboxImg) return;

    // open lightbox when clicking on elements with data-lightbox
    document.querySelectorAll('[data-lightbox]').forEach(el => {
        el.addEventListener('click', () => {
            const src = el.dataset.lightbox;
            lightboxImg.src = src;
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    });

    // close lightbox
    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // close on button click
    lightboxClose?.addEventListener('click', closeLightbox);

    // close on backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
            closeLightbox();
        }
    });
}

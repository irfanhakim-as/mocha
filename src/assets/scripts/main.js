// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSmoothScroll();
    initMobileMenu();
    initLightbox();
    initLogoScroll();
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

// Logo scroll to top
function initLogoScroll() {
    const logo = document.querySelector('.header__logo');
    if (!logo) return;
    logo.addEventListener('click', (e) => {
        // prevent default only if we're already on the home page
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

// Lightbox for images
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const container = lightbox?.querySelector('.lightbox__container');
    const prevImg = lightbox?.querySelector('.lightbox__image--prev');
    const currentImg = lightbox?.querySelector('.lightbox__image--current');
    const nextImg = lightbox?.querySelector('.lightbox__image--next');
    const lightboxClose = lightbox?.querySelector('.lightbox__close');
    const lightboxPrev = lightbox?.querySelector('.lightbox__nav--prev');
    const lightboxNext = lightbox?.querySelector('.lightbox__nav--next');
    const caption = lightbox?.querySelector('.lightbox__caption');

    if (!lightbox || !container || !currentImg) return;

    let currentIndex = 0;
    let images = [];
    let alts = [];
    let hasNavigation = false;
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let translateX = 0; // current translate position in pixels
    let pendingReset = false; // track if we need to reset position after animation
    let galleryElements = []; // store gallery DOM elements for scroll sync

    // update prev, current, and next images based on current index
    function updateImages() {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        const nextIndex = (currentIndex + 1) % images.length;

        if (prevImg) prevImg.src = images[prevIndex] || '';
        currentImg.src = images[currentIndex] || '';
        if (nextImg) nextImg.src = images[nextIndex] || '';

        // update caption with alt text
        if (caption) {
            const alt = alts[currentIndex] || '';
            caption.textContent = alt;
            caption.style.display = alt ? '' : 'none';
        }

        // show or hide navigation buttons
        if (!hasNavigation || images.length <= 1) {
            lightboxPrev?.classList.add('is-hidden');
            lightboxNext?.classList.add('is-hidden');
        } else {
            lightboxPrev?.classList.remove('is-hidden');
            lightboxNext?.classList.remove('is-hidden');
        }
    }

    // set transform position
    function setPosition(x, transition = true) {
        if (transition) {
            container.classList.remove('is-dragging');
        } else {
            container.classList.add('is-dragging');
        }
        container.style.transform = `translateX(${x}px)`;
    }

    // navigate to specific index
    function goToIndex(index, direction = 0) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;

        if (direction !== 0) {
            // animate in the swipe direction to reveal the target image
            const targetX = direction < 0
                ? -window.innerWidth * 2  // slide to next when swiped left
                : 0;  // slide to previous when swiped right

            setPosition(targetX, true);
            pendingReset = true;

            // update images and reset to center after animation completes
            container.addEventListener('transitionend', function resetPosition() {
                container.removeEventListener('transitionend', resetPosition);
                if (pendingReset) {
                    updateImages();
                    translateX = -window.innerWidth;
                    setPosition(translateX, false);
                    pendingReset = false;
                }
            }, { once: true });
        } else {
            // instantly switch for keyboard or button navigation
            updateImages();
            translateX = -window.innerWidth;
            setPosition(translateX, false);
        }
    }

    // open lightbox
    function openLightbox() {
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        translateX = -window.innerWidth;
        updateImages();
        setPosition(translateX, false);
    }

    // close lightbox
    function closeLightbox() {
        // sync gallery scroll to current image instantly
        if (hasNavigation && galleryElements[currentIndex]) {
            const galleryGrid = galleryElements[currentIndex].parentElement;
            if (galleryGrid) {
                // temporarily override CSS scroll-behavior for instant positioning
                galleryGrid.classList.add('instant-scroll');
                // scroll to element while handling gaps and scroll-snap
                galleryElements[currentIndex].scrollIntoView({ block: 'nearest', inline: 'start' });
                // restore smooth scroll behavior
                galleryGrid.classList.remove('instant-scroll');
            }
        }
        // start close animation after scroll completes
        requestAnimationFrame(() => {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });
    }

    // setup gallery images
    const galleryImages = document.querySelectorAll('.gallery__item[data-lightbox]');
    if (galleryImages.length > 0) {
        galleryElements = Array.from(galleryImages);
        images = galleryElements.map(el => el.dataset.lightbox);
        alts = galleryElements.map(el => el.dataset.alt || '');
        galleryElements.forEach((el, index) => {
            el.addEventListener('click', () => {
                currentIndex = index;
                hasNavigation = images.length > 1;
                openLightbox();
            });
        });
    }

    // setup hero image
    const heroImage = document.querySelector('.hero__image-wrapper[data-lightbox]');
    if (heroImage) {
        heroImage.addEventListener('click', () => {
            const tempImages = images;
            const tempAlts = alts;
            images = [heroImage.dataset.lightbox];
            alts = [heroImage.dataset.alt || ''];
            currentIndex = 0;
            hasNavigation = false;
            openLightbox();
            images = tempImages;
            alts = tempAlts;
        });
    }

    // navigation buttons
    lightboxPrev?.addEventListener('click', () => {
        if (hasNavigation) goToIndex(currentIndex - 1);
    });

    lightboxNext?.addEventListener('click', () => {
        if (hasNavigation) goToIndex(currentIndex + 1);
    });

    lightboxClose?.addEventListener('click', closeLightbox);

    // close on backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft' && hasNavigation) {
            goToIndex(currentIndex - 1);
        } else if (e.key === 'ArrowRight' && hasNavigation) {
            goToIndex(currentIndex + 1);
        }
    });

    // touch drag support
    container.addEventListener('touchstart', (e) => {
        if (!hasNavigation) return;

        // complete any pending reset before starting new drag
        if (pendingReset) {
            updateImages();
            translateX = -window.innerWidth;
            setPosition(translateX, false);
            pendingReset = false;
        }

        isDragging = true;
        startX = e.touches[0].clientX;
        currentX = startX;
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging || !hasNavigation) return;
        e.preventDefault();

        currentX = e.touches[0].clientX;
        const diff = currentX - startX;

        setPosition(translateX + diff, false);
    });

    container.addEventListener('touchend', () => {
        if (!isDragging || !hasNavigation) return;
        isDragging = false;

        const diff = currentX - startX;
        const threshold = window.innerWidth * 0.2; // 20% of screen width

        if (Math.abs(diff) > threshold) {
            // change image when swipe threshold met
            if (diff > 0) {
                // previous when swiped right
                goToIndex(currentIndex - 1, 1);
            } else {
                // next when swiped left
                goToIndex(currentIndex + 1, -1);
            }
        } else {
            // snap back to current
            setPosition(translateX, true);
        }
    });
}

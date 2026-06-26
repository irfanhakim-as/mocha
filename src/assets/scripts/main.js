// Main JavaScript file

const {
    medicationStatus,
    sortByDatePinLast,
    statusLabel,
    vaccinationStatus,
} = require('../../../scripts/filters.core');

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAnnouncement();
    initSmoothScroll();
    initMobileMenu();
    initLightbox();
    initLogoScroll();
    updateAge();
    updateMedicationStatuses();
    updateVaccinationStatuses();
    document.fonts.ready.then(initPagination);
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

// Persist announcement banner dismissal
function initAnnouncement() {
    const banner = document.getElementById('announcement');
    if (!banner) return;

    const id = banner.dataset.announcementId;
    // hide if this announcement was the last one dismissed
    if (id && localStorage.getItem('announcement-dismissed-id') === id) {
        banner.classList.add('is-hidden');
        return;
    }

    banner.querySelector('.announcement__close')?.addEventListener('click', () => {
        banner.classList.add('is-hidden');
        // store last dismissed announcement id so it stays hidden
        if (id) localStorage.setItem('announcement-dismissed-id', id);
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
                const siteHeaderHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - siteHeaderHeight;
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

    // close menu when clicking away
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // close menu on scroll
    window.addEventListener('scroll', () => {
        if (nav.classList.contains('is-open')) {
            closeMobileMenu();
        }
    }, { passive: true });

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

// Update medication status badges and re-sort the list
function updateMedicationStatuses() {
    document.querySelectorAll('[data-med-start]').forEach(el => {
        const status = medicationStatus(el.dataset.medEnd, { startDate: el.dataset.medStart });
        el.className = el.className.replace(/health__badge--\S+/, `health__badge--${status.class}`);
        el.textContent = statusLabel(status.class);
    });
    sortMedicationItems();
}

// Re-sort medication items to reflect current statuses
function sortMedicationItems() {
    const list = document.querySelector('.health__medications .health__list');
    if (!list) return;
    const items = Array.from(list.children).map(el => ({
        el,
        startDate: el.dataset.startDate,
        isComplete: el.querySelector('.health__badge')?.classList.contains('health__badge--complete') || false,
    }));
    sortByDatePinLast(items, 'startDate', 'isComplete', true).forEach(({ el }) => list.appendChild(el));
}

// Update vaccination status badges
function updateVaccinationStatuses() {
    document.querySelectorAll('[data-vax-due]').forEach(el => {
        const status = vaccinationStatus(el.dataset.vaxDue, null, null);
        el.className = el.className.replace(/health__badge--\S+/, `health__badge--${status.class}`);
        el.textContent = statusLabel(status.class);
    });
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

// Card pagination
function initPagination() {
    const SVG_PREV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    const SVG_NEXT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>';

    document.querySelectorAll('[data-paginate]').forEach(container => {
        const pageSize = parseInt(container.dataset.paginate, 10);
        if (!pageSize || pageSize < 1) return;

        const items = Array.from(container.children);
        if (items.length <= pageSize) return;

        const totalPages = Math.ceil(items.length / pageSize);
        let currentPage = 1;

        const card = container.closest('.card');
        if (!card) return;

        // fix column widths before hiding rows so they stay consistent across pages
        if (container.tagName === 'TBODY') {
            container.closest('table')?.querySelectorAll('thead th').forEach(th => {
                th.style.width = th.offsetWidth + 'px';
            });
        }

        // prev button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'card__pagination-btn';
        prevBtn.type = 'button';
        prevBtn.setAttribute('aria-label', 'Previous page');
        prevBtn.innerHTML = SVG_PREV;

        // next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'card__pagination-btn';
        nextBtn.type = 'button';
        nextBtn.setAttribute('aria-label', 'Next page');
        nextBtn.innerHTML = SVG_NEXT;

        // page indicator dots
        const dotsEl = document.createElement('div');
        dotsEl.className = 'card__pagination-dots';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('span');
            dot.className = 'card__pagination-dot' + (i === 0 ? ' is-active' : '');
            dotsEl.appendChild(dot);
        }

        const pagination = document.createElement('div');
        pagination.className = 'card__pagination';
        pagination.appendChild(prevBtn);
        pagination.appendChild(dotsEl);
        pagination.appendChild(nextBtn);
        card.appendChild(pagination);

        function showPage(page) {
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            items.forEach((item, i) => {
                item.style.display = (i >= start && i < end) ? '' : 'none';
            });
            dotsEl.children[currentPage - 1]?.classList.remove('is-active');
            dotsEl.children[page - 1]?.classList.add('is-active');
            currentPage = page;
            prevBtn.disabled = page === 1;
            nextBtn.disabled = page === totalPages;
        }

        prevBtn.addEventListener('click', () => showPage(currentPage - 1));
        nextBtn.addEventListener('click', () => showPage(currentPage + 1));

        // touch swipe: horizontal swipe navigates pages, vertical swipe scrolls normally
        let startX = 0, startY = 0, swipeDir = null;

        card.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            swipeDir = null;
        }, { passive: true });

        card.addEventListener('touchmove', e => {
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            if (swipeDir === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                swipeDir = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
            }
            if (swipeDir === 'x') e.preventDefault();
        }, { passive: false });

        card.addEventListener('touchend', e => {
            if (swipeDir !== 'x') return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) < 40) return;
            if (dx < 0 && currentPage < totalPages) showPage(currentPage + 1);
            else if (dx > 0 && currentPage > 1) showPage(currentPage - 1);
        }, { passive: true });

        // accordion: if children are details elements, only allow one open at a time
        if (items.some(item => item.tagName === 'DETAILS')) {
            container.addEventListener('toggle', e => {
                if (!e.target.open) return;
                items.forEach(item => {
                    if (item !== e.target && item.tagName === 'DETAILS' && item.open) {
                        item.removeAttribute('open');
                    }
                });
            }, true);
        }

        // lock the content area to the tallest page so the dots never move
        const heightTarget = container.tagName === 'TBODY'
            ? (container.closest('.health__table-wrapper') || container.closest('table') || container)
            : container;
        let maxHeight = 0;
        for (let p = 1; p <= totalPages; p++) {
            const start = (p - 1) * pageSize;
            const end = start + pageSize;
            items.forEach((item, i) => {
                item.style.display = (i >= start && i < end) ? '' : 'none';
            });
            if (heightTarget.offsetHeight > maxHeight) maxHeight = heightTarget.offsetHeight;
        }
        heightTarget.style.minHeight = maxHeight + 'px';

        // ratchet: if a details element expands and grows the container, lock in the new height
        heightTarget.addEventListener('toggle', () => {
            requestAnimationFrame(() => {
                const h = heightTarget.offsetHeight;
                if (h > maxHeight) {
                    maxHeight = h;
                    heightTarget.style.minHeight = maxHeight + 'px';
                }
            });
        }, true);

        showPage(1);
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
        if (e.target === lightbox || e.target === container) closeLightbox();
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

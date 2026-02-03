/**
 * TSROW Studio — Main Application Logic
 * Orchestrates animations, scroll, and interactions
 */

// ============================================
// GSAP & LENIS SETUP
// ============================================
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
});

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ============================================
// PRELOADER
// ============================================
const preloader = document.getElementById('preloader');
const preloaderChars = document.querySelectorAll('.preloader-logo .char');
const preloaderProgress = document.getElementById('preloader-progress');
const preloaderCount = document.getElementById('preloader-count');

let loadProgress = 0;

// Animate preloader logo chars in
gsap.to(preloaderChars, {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.2
});

// Simulate loading
const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 15;
    if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(loadInterval);
        setTimeout(finishLoading, 500);
    }

    const displayValue = Math.floor(loadProgress);
    preloaderCount.textContent = displayValue.toString().padStart(3, '0');
    gsap.to(preloaderProgress, { width: `${loadProgress}%`, duration: 0.3 });
}, 100);

function finishLoading() {
    const tl = gsap.timeline({
        onComplete: () => {
            preloader.style.display = 'none';
            document.body.classList.add('loaded');
            initPageAnimations();
        }
    });

    // Animate chars out
    tl.to(preloaderChars, {
        y: -100,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power3.in'
    })
        .to(preloader, {
            yPercent: -100,
            duration: 1,
            ease: 'power4.inOut'
        }, '-=0.3');
}

// ============================================
// CUSTOM CURSOR
// ============================================
const cursor = document.getElementById('cursor');
const cursorBall = cursor.querySelector('.cursor-ball');
const cursorLabel = cursor.querySelector('.cursor-label');

let cursorX = 0;
let cursorY = 0;
let currentX = 0;
let currentY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

// Smooth cursor follow
function updateCursor() {
    const dx = cursorX - currentX;
    const dy = cursorY - currentY;

    currentX += dx * 0.15;
    currentY += dy * 0.15;

    cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(updateCursor);
}
updateCursor();

// Cursor hover states
const cursorTriggers = document.querySelectorAll('[data-cursor]');
cursorTriggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
        const label = trigger.getAttribute('data-cursor');
        cursorLabel.textContent = label;
        document.body.classList.add('cursor-hover');
    });

    trigger.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
});

// ============================================
// MAGNETIC BUTTONS
// ============================================
const magnetics = document.querySelectorAll('.magnetic');

magnetics.forEach(magnetic => {
    const strength = parseFloat(magnetic.getAttribute('data-strength')) || 30;

    magnetic.addEventListener('mousemove', (e) => {
        const rect = magnetic.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(magnetic, {
            x: x * (strength / 100),
            y: y * (strength / 100),
            duration: 0.4,
            ease: 'power2.out'
        });

        // Inner span parallax
        const span = magnetic.querySelector('span');
        if (span) {
            gsap.to(span, {
                x: x * (strength / 200),
                y: y * (strength / 200),
                duration: 0.4,
                ease: 'power2.out'
            });
        }
    });

    magnetic.addEventListener('mouseleave', () => {
        gsap.to(magnetic, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.3)'
        });

        const span = magnetic.querySelector('span');
        if (span) {
            gsap.to(span, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.3)'
            });
        }
    });
});

// ============================================
// PARALLAX SYSTEM
// ============================================
function initParallax() {
    // Select elements with data-speed attribute
    const parallaxParams = document.querySelectorAll('[data-speed]');

    parallaxParams.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed'));

        // Use fromTo for stable scrubbing
        gsap.fromTo(el,
            { y: 0 },
            {
                y: () => (window.innerHeight * speed), // Move relative to screen height
                ease: 'none',
                scrollTrigger: {
                    trigger: el,
                    start: 'top bottom', // Start when enters viewport
                    end: 'bottom top',   // End when leaves
                    scrub: 0
                }
            }
        );
    });
}

// ============================================
// SPLIT TEXT ANIMATIONS
// ============================================
function initPageAnimations() {
    initParallax(); // Start parallax system

    // Split all animatable text
    const animateChars = document.querySelectorAll('[data-animate="chars"]');
    const animateLines = document.querySelectorAll('[data-animate="lines"]');
    const animateWords = document.querySelectorAll('[data-animate="words"]');
    const animateFade = document.querySelectorAll('[data-animate="fade"]');

    // Character animations
    animateChars.forEach(el => {
        const split = new SplitType(el, { types: 'chars, lines' });

        gsap.from(split.chars, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 100,
            opacity: 0,
            rotateX: -90,
            stagger: 0.02,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Line animations
    animateLines.forEach(el => {
        const lines = el.querySelectorAll('.line');

        gsap.from(lines, {
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            yPercent: 100,
            opacity: 0,
            stagger: 0.15,
            duration: 1.2,
            ease: 'power4.out'
        });
    });

    // Word animations
    animateWords.forEach(el => {
        const split = new SplitType(el, { types: 'words' });

        gsap.from(split.words, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 30,
            opacity: 0,
            stagger: 0.03,
            duration: 0.8,
            ease: 'power2.out'
        });
    });

    // Fade animations
    animateFade.forEach(el => {
        // Prepare hidden elements
        gsap.set(el, { autoAlpha: 1 });

        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    });

    // Hero title special animation
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        gsap.set(heroTitle, { autoAlpha: 1 }); // Reveal container
        const heroSplit = new SplitType(heroTitle, { types: 'chars, lines' });

        gsap.from(heroSplit.chars, {
            y: 150,
            opacity: 0,
            rotateX: -45,
            stagger: 0.03,
            duration: 1.2,
            ease: 'power4.out',
            delay: 0.2
        });
    }

    // Hero Tagline (ensure visible)
    const heroTagline = document.querySelector('.hero-tagline');
    if (heroTagline) gsap.set(heroTagline, { autoAlpha: 1 });

    // Hero CTA
    const heroCta = document.querySelector('.hero-cta');
    if (heroCta) {
        gsap.set(heroCta, { autoAlpha: 1 });
        gsap.from(heroCta, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            delay: 1.0 // Wait for text
        });
    }

    // Counter animations
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));

        gsap.to(counter, {
            scrollTrigger: {
                trigger: counter,
                start: 'top 80%',
                toggleActions: 'play none none reset'
            },
            textContent: target,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            onUpdate: function () {
                counter.textContent = Math.floor(counter.textContent);
            }
        });
    });
}

// ============================================
// WORK HOVER ACCORDION (Desktop) + TOUCH HANDLING (Mobile)
// ============================================
const workCards = document.querySelectorAll('.work-card');

if (workCards.length > 0) {
    // Set initial state
    workCards[0].classList.add('active');

    // Check if touch device
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
        // Mobile: Use IntersectionObserver to activate cards as they scroll into view
        // Remove initial active state since all cards show info on mobile
        workCards.forEach(c => c.classList.remove('active'));

        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -30% 0px', // Trigger when card is in middle 40% of viewport
            threshold: 0
        };

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Optional: Add subtle visual feedback when card is in center
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, observerOptions);

        workCards.forEach(card => {
            cardObserver.observe(card);

            // Add touch feedback
            card.addEventListener('touchstart', () => {
                card.classList.add('touching');
            }, { passive: true });

            card.addEventListener('touchend', () => {
                card.classList.remove('touching');
            }, { passive: true });
        });
    } else {
        // Desktop: Keep original hover behavior
        workCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Deactivate all others
                workCards.forEach(c => c.classList.remove('active'));
                // Activate current
                card.classList.add('active');
            });
        });
    }
}

// ============================================
// STATS ENTRANCE
// ============================================
const statItems = document.querySelectorAll('.stat');
if (statItems.length > 0) {
    gsap.from(statItems, {
        scrollTrigger: {
            trigger: '.about-stats',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
    });
}



// ============================================
// SCENE INDICATOR & BACKGROUND MOOD
// ============================================
const sceneCurrent = document.getElementById('scene-current');
const sections = document.querySelectorAll('[data-scene]');

const MOOD_MAP = {
    '01': 'home',    // Hero
    '02': 'home',    // About
    '03': 'work',    // Work
    '04': 'work',    // Process
    '05': 'work',    // Services
    '06': 'contact', // Testimonial
    '07': 'contact'  // Contact
};

sections.forEach((section, index) => {
    ScrollTrigger.create({
        trigger: section,
        start: 'top 60%', // Trigger earlier for better feel
        end: 'bottom 60%',
        onEnter: () => {
            const id = section.getAttribute('data-scene');
            if (sceneCurrent) sceneCurrent.textContent = id;
            if (window.BG_ENGINE && MOOD_MAP[id]) {
                window.BG_ENGINE.setMood(MOOD_MAP[id]);
            }
        },
        onEnterBack: () => {
            const id = section.getAttribute('data-scene');
            if (sceneCurrent) sceneCurrent.textContent = id;
            if (window.BG_ENGINE && MOOD_MAP[id]) {
                window.BG_ENGINE.setMood(MOOD_MAP[id]);
            }
        }
    });
});

// ============================================
// TIME DISPLAY
// ============================================
const timeDisplay = document.getElementById('time-display');
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    if (timeDisplay) {
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }
}
setInterval(updateTime, 1000);
updateTime();

// ============================================
// VELOCITY DISPLAY
// ============================================
// ============================================
// VELOCITY DISPLAY & BACKGROUND SYNC
// ============================================
const velocityDisplay = document.getElementById('velocity');
lenis.on('scroll', (e) => {
    if (velocityDisplay) {
        velocityDisplay.textContent = Math.abs(e.velocity).toFixed(2);
    }
    // Update Background Engine Physics
    if (window.BG_ENGINE) {
        window.BG_ENGINE.setScrollVelocity(e.velocity);
    }
});

// ============================================
// MARQUEE SPEED BASED ON SCROLL
// ============================================
// ============================================
// SMOOTH SCROLL VELOCITY MARQUEE
// ============================================
const marqueeTrack = document.querySelector('.marquee-track');
const marqueeItems = document.querySelectorAll('.marquee-text');

if (marqueeTrack && marqueeItems.length > 0) {
    let progress = 0;
    let baseSpeed = 0.5; // Pixels per frame
    let scrollSpeed = 0; // Added velocity

    // Calculate total width of one set of text
    // Assuming simple duplication for loop
    const itemWidth = marqueeItems[0].offsetWidth;

    function animateMarquee() {
        // Smoothly decay scroll speed influence
        scrollSpeed *= 0.95;

        // Combined speed
        const currentSpeed = baseSpeed + scrollSpeed;

        // Move
        progress -= currentSpeed;

        // Loop logic: when we've moved past one item width, reset
        // The track typically contains 2 copies. We slide left.
        // When abs(progress) >= width, we add width to progress
        if (Math.abs(progress) >= itemWidth) {
            progress += itemWidth;
        }

        // Apply transform
        // translate3d for GPU perf
        marqueeTrack.style.transform = `translate3d(${progress}px, 0, 0)`;

        requestAnimationFrame(animateMarquee);
    }

    // Start loop
    requestAnimationFrame(animateMarquee);

    // Inject scroll velocity from Lenis
    lenis.on('scroll', (e) => {
        // Add scroll velocity to marquee speed
        // Sensitivity factor 0.2
        scrollSpeed += Math.abs(e.velocity) * 0.2;
    });
}

// ============================================
// TEXT SCRAMBLE EFFECT
// ============================================
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.originalText = el.textContent;
        this.update = this.update.bind(this);
    }

    scramble() {
        this.queue = [];
        const length = this.originalText.length;

        for (let i = 0; i < length; i++) {
            const from = this.randomChar();
            const to = this.originalText[i];
            const start = Math.floor(Math.random() * 20);
            const end = start + Math.floor(Math.random() * 20);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0; i < this.queue.length; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;

        if (complete < this.queue.length) {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Initialize scramble on hover
const scrambleElements = document.querySelectorAll('[data-scramble]');
scrambleElements.forEach(el => {
    const scramble = new TextScramble(el);

    el.parentElement.addEventListener('mouseenter', () => {
        scramble.scramble();
    });
});

// ============================================
// PROCESS STEPS ANIMATION
// ============================================
const processSteps = document.querySelectorAll('.process-step');
processSteps.forEach((step, index) => {
    gsap.from(step, {
        scrollTrigger: {
            trigger: step,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power2.out'
    });
});

// ============================================
// MOBILE MENU
// ============================================
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        document.body.classList.toggle('menu-open');

        // Stop/resume scroll when menu is open
        if (document.body.classList.contains('menu-open')) {
            lenis.stop();
        } else {
            lenis.start();
        }
    });

    // Close menu when clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.body.classList.remove('menu-open');
            lenis.start();
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
            document.body.classList.remove('menu-open');
            lenis.start();
        }
    });
}

// ============================================
// TOUCH DEVICE DETECTION
// ============================================
function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

if (isTouchDevice()) {
    document.body.classList.add('touch-device');
}

// ============================================
// VIEWPORT HEIGHT FIX (Mobile Safari)
// ============================================
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);

console.log('🚀 TSROW Studio — Loaded');

/**
 * TSROW Studio — Main Application Logic
 * Orchestrates animations, scroll, and interactions
 */

// ============================================
// GSAP & LENIS SETUP
// ============================================
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.8,
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
// DEVICE & ANIMATION CONFIG
// ============================================
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile-tuned animation parameters (snappier on small screens)
const ANIM = {
    pause: IS_MOBILE ? 0.08 : 0.12,
    chars: {
        y: IS_MOBILE ? 60 : 100,
        rotateX: IS_MOBILE ? 0 : -90,
        stagger: IS_MOBILE ? 0.04 : 0.025,
        duration: IS_MOBILE ? 0.85 : 1.05
    },
    lines: {
        stagger: IS_MOBILE ? 0.1 : 0.16,
        duration: IS_MOBILE ? 0.9 : 1.2
    },
    words: {
        y: IS_MOBILE ? 20 : 30,
        stagger: IS_MOBILE ? 0.03 : 0.045,
        duration: IS_MOBILE ? 0.75 : 0.95
    },
    fade: {
        y: IS_MOBILE ? 25 : 40,
        duration: IS_MOBILE ? 0.85 : 1.05
    },
    hero: {
        y: IS_MOBILE ? 80 : 150,
        rotateX: IS_MOBILE ? 0 : -45,
        stagger: IS_MOBILE ? 0.05 : 0.04,
        duration: IS_MOBILE ? 1 : 1.1
    }
};

const PACE = {
    fast: { duration: 0.9, stagger: 0.9, pause: 0.85 },
    slow: { duration: 1.15, stagger: 1.1, pause: 1.05 },
    crisp: { duration: 0.9, stagger: 0.85, pause: 0.75 },
    normal: { duration: 1, stagger: 1, pause: 1 }
};

function getPace(el) {
    const section = el.closest('[data-pace]');
    return section ? section.getAttribute('data-pace') : 'normal';
}

function getPaceSettings(pace) {
    return PACE[pace] || PACE.normal;
}

// ============================================
// IMAGE BLUR-UP LOADING
// ============================================
function initBlurUpImages() {
    const images = document.querySelectorAll('.work-card img, .modal-hero-img, .modal-artifact img');

    images.forEach(img => {
        // Skip already-loaded images
        if (img.complete && img.naturalWidth > 0) {
            img.classList.add('img-loaded');
            // Clear any inline filter so CSS takes over
            img.style.filter = '';
            return;
        }

        img.addEventListener('load', () => {
            // Smooth reveal animation
            const isActive = img.closest('.work-card.active');
            gsap.to(img, {
                filter: isActive
                    ? 'grayscale(0%) brightness(1) blur(0px)'
                    : 'grayscale(100%) brightness(0.6) blur(5px)',
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => {
                    img.classList.add('img-loaded');
                    // Clear inline style so CSS classes take over
                    img.style.filter = '';
                }
            });
        });

        img.addEventListener('error', () => {
            // Fallback: still mark as loaded on error
            img.classList.add('img-loaded');
            img.style.filter = '';
        });
    });
}

// Run on DOM ready and after preloader
initBlurUpImages();

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
        if (el.hasAttribute('data-animate')) return;
        if (el.closest('[data-animate]')) return;
        if (el.closest('.section-quiet')) return;
        if (el.getAttribute('data-parallax') === 'off') return;
        const section = el.closest('[data-pace]');
        if (section && section.getAttribute('data-pace') === 'slow') return;
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
    // Initialize parallax on all devices
    initParallax();

    // Split all animatable text
    const animateChars = document.querySelectorAll('[data-animate="chars"]');
    const animateLines = document.querySelectorAll('[data-animate="lines"]');
    const animateWords = document.querySelectorAll('[data-animate="words"]');
    const animateFade = document.querySelectorAll('[data-animate="fade"]');

    // Character animations
    animateChars.forEach(el => {
        const split = new SplitType(el, { types: 'chars, lines' });
        const paceSettings = getPaceSettings(getPace(el));

        gsap.from(split.chars, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: ANIM.chars.y,
            opacity: 0,
            rotateX: ANIM.chars.rotateX,
            stagger: ANIM.chars.stagger * paceSettings.stagger,
            duration: ANIM.chars.duration * paceSettings.duration,
            delay: ANIM.pause * paceSettings.pause,
            ease: 'power3.out'
        });
    });

    // Line animations
    animateLines.forEach(el => {
        const lines = el.querySelectorAll('.line');
        const paceSettings = getPaceSettings(getPace(el));

        gsap.from(lines, {
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            yPercent: 100,
            opacity: 0,
            stagger: ANIM.lines.stagger * paceSettings.stagger,
            duration: ANIM.lines.duration * paceSettings.duration,
            delay: ANIM.pause * paceSettings.pause,
            ease: 'power4.out'
        });
    });

    // Word animations
    animateWords.forEach(el => {
        const split = new SplitType(el, { types: 'words' });
        const paceSettings = getPaceSettings(getPace(el));

        gsap.from(split.words, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: ANIM.words.y,
            opacity: 0,
            stagger: ANIM.words.stagger * paceSettings.stagger,
            duration: ANIM.words.duration * paceSettings.duration,
            delay: ANIM.pause * paceSettings.pause,
            ease: 'power2.out'
        });
    });

    // Fade animations
    animateFade.forEach(el => {
        // Prepare hidden elements
        gsap.set(el, { autoAlpha: 1 });
        const paceSettings = getPaceSettings(getPace(el));

        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: ANIM.fade.y,
            opacity: 0,
            duration: ANIM.fade.duration * paceSettings.duration,
            delay: ANIM.pause * paceSettings.pause,
            ease: 'power2.out'
        });
    });

    // Hero title special animation
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        gsap.set(heroTitle, { autoAlpha: 1 }); // Reveal container
        const heroSplit = new SplitType(heroTitle, { types: 'chars, lines' });
        const paceSettings = getPaceSettings(getPace(heroTitle));

        gsap.from(heroSplit.chars, {
            y: ANIM.hero.y,
            opacity: 0,
            rotateX: ANIM.hero.rotateX,
            stagger: ANIM.hero.stagger * paceSettings.stagger,
            duration: ANIM.hero.duration * paceSettings.duration,
            ease: 'power4.out',
            delay: 0.2 + (ANIM.pause * paceSettings.pause)
        });
    }

    // Hero Tagline (ensure visible)
    const heroTagline = document.querySelector('.hero-tagline');
    if (heroTagline) gsap.set(heroTagline, { autoAlpha: 1 });

    // Hero CTA
    const heroCta = document.querySelector('.hero-cta');
    if (heroCta) {
        const paceSettings = getPaceSettings(getPace(heroCta));
        gsap.set(heroCta, { autoAlpha: 1 });
        gsap.from(heroCta, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            delay: 1.0 + (ANIM.pause * paceSettings.pause) // Wait for text
        });
    }

    initAmbientBreath();

    // Counter animations
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const paceSettings = getPaceSettings(getPace(counter));

        gsap.to(counter, {
            scrollTrigger: {
                trigger: counter,
                start: 'top 80%',
                toggleActions: 'play none none reset'
            },
            textContent: target,
            duration: 2 * paceSettings.duration,
            ease: 'power2.out',
            snap: { textContent: 1 },
            onUpdate: function () {
                counter.textContent = Math.floor(counter.textContent);
            }
        });
    });
}

// ============================================
// AMBIENT BREATHING MOTION
// ============================================
function initAmbientBreath() {
    if (IS_MOBILE || PREFERS_REDUCED_MOTION) return;

    const shouldBreathe = (el) => {
        if (!el) return false;
        if (el.closest('[data-animate]')) return false;
        if (el.closest('[data-pace="fast"]')) return false;
        return true;
    };

    const breathPrimary = Array.from(document.querySelectorAll(
        '.section-header, .about-statement, .testimonial-quote'
    )).filter(shouldBreathe);

    const breathSecondary = Array.from(document.querySelectorAll(
        '.work-card-window, .process-step, .service-category'
    )).filter(shouldBreathe);

    if (breathPrimary.length > 0) {
        gsap.to(breathPrimary, {
            scale: 1.01,
            duration: 8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            transformOrigin: 'center',
            stagger: 1.4
        });
    }

    if (breathSecondary.length > 0) {
        gsap.to(breathSecondary, {
            scale: 1.006,
            duration: 10,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            transformOrigin: 'center',
            stagger: 0.6
        });
    }
}

// ============================================
// WORK HOVER ACCORDION (Desktop) + TOUCH HANDLING (Mobile)
// ============================================
const workCards = document.querySelectorAll('.work-card');

// Helper function to pause/play GIFs by swapping src
function pauseGif(img) {
    if (!img || !img.src) return;
    // Only handle GIFs
    if (!img.src.toLowerCase().includes('.gif')) return;

    // Store original src if not already stored
    if (!img.dataset.gifSrc) {
        img.dataset.gifSrc = img.src;
    }
    // Create a canvas to capture the current frame
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // Set src to the static frame
    try {
        img.src = canvas.toDataURL('image/png');
    } catch (e) {
        // If cross-origin, just leave it
    }
}

function playGif(img) {
    if (!img) return;
    // Restore original GIF src
    if (img.dataset.gifSrc) {
        img.src = img.dataset.gifSrc;
    }
}

// Function to update card GIF states
function updateCardGifStates() {
    workCards.forEach(card => {
        const img = card.querySelector('img');
        if (card.classList.contains('active')) {
            playGif(img);
        } else {
            pauseGif(img);
        }
    });
}

function animateWorkCardFlex(activeCard) {
    if (PREFERS_REDUCED_MOTION) return;

    gsap.to(workCards, {
        flexGrow: 1,
        duration: 0.9,
        ease: 'power3.out',
        overwrite: 'auto'
    });

    if (activeCard) {
        gsap.to(activeCard, {
            flexGrow: 6,
            duration: 1,
            ease: 'power3.out',
            overwrite: 'auto'
        });
    }
}

if (workCards.length > 0) {
    // Set initial state
    workCards[0].classList.add('active');

    // Check if touch device
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (!isMobile) {
        // Ensure initial flex-grow matches the active card for smooth transitions
        workCards.forEach(card => {
            const isActive = card.classList.contains('active');
            gsap.set(card, { flexGrow: isActive ? 6 : 1 });
        });
    }

    // Initial GIF states - pause all non-active, play active
    setTimeout(() => {
        updateCardGifStates();
    }, 100);

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
                const img = entry.target.querySelector('img');
                if (entry.isIntersecting) {
                    // Optional: Add subtle visual feedback when card is in center
                    entry.target.classList.add('in-view');
                    playGif(img);
                } else {
                    entry.target.classList.remove('in-view');
                    pauseGif(img);
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
        // Desktop: Keep original hover behavior with smooth flex animation
        workCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Deactivate all others
                workCards.forEach(c => c.classList.remove('active'));
                // Activate current
                card.classList.add('active');
                // Update GIF states
                updateCardGifStates();
                // Animate flex transition
                animateWorkCardFlex(card);
            });
        });
    }
}

// ============================================
// STATS ENTRANCE
// ============================================
const statItems = document.querySelectorAll('.stat');
if (statItems.length > 0) {
    const paceSettings = getPaceSettings(getPace(statItems[0]));
    gsap.from(statItems, {
        scrollTrigger: {
            trigger: '.about-stats',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        duration: 0.8 * paceSettings.duration,
        stagger: 0.1 * paceSettings.stagger,
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

const MOOD_VALUES = {
    home: 0.0,
    work: 1.0,
    contact: -0.5
};

const moodProxy = { value: 0.0 };
let moodTween = null;

function rampMood(moodName) {
    if (!window.BG_ENGINE) return;
    const targetValue = MOOD_VALUES[moodName];
    if (typeof targetValue !== 'number') return;

    if (moodTween) moodTween.kill();
    moodTween = gsap.to(moodProxy, {
        value: targetValue,
        duration: 0.7,
        ease: 'sine.inOut',
        onUpdate: () => {
            if (window.BG_ENGINE && window.BG_ENGINE.setMoodValue) {
                window.BG_ENGINE.setMoodValue(moodProxy.value);
            } else if (window.BG_ENGINE) {
                window.BG_ENGINE.setMood(moodName);
            }
        }
    });
}

sections.forEach((section, index) => {
    ScrollTrigger.create({
        trigger: section,
        start: 'top 60%', // Trigger earlier for better feel
        end: 'bottom 60%',
        onEnter: () => {
            const id = section.getAttribute('data-scene');
            if (sceneCurrent) sceneCurrent.textContent = id;
            if (MOOD_MAP[id]) rampMood(MOOD_MAP[id]);
        },
        onEnterBack: () => {
            const id = section.getAttribute('data-scene');
            if (sceneCurrent) sceneCurrent.textContent = id;
            if (MOOD_MAP[id]) rampMood(MOOD_MAP[id]);
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
// PREMIUM MARQUEE LOOP
// ============================================
const marqueeSection = document.querySelector('.section-marquee');
const marqueeTrack = document.querySelector('.marquee-track');
let marqueeTween = null;
let marqueeBaseItems = [];
let marqueeScrollBound = false;

function buildMarquee() {
    if (!marqueeSection || !marqueeTrack || PREFERS_REDUCED_MOTION) return;

    if (marqueeTween) marqueeTween.kill();
    marqueeTrack.querySelectorAll('[data-marquee-clone="true"]').forEach(el => el.remove());

    if (marqueeBaseItems.length === 0) {
        marqueeBaseItems = Array.from(marqueeTrack.children);
    }

    const isMobileMarquee = window.matchMedia('(max-width: 768px)').matches;
    const containerWidth = marqueeSection.getBoundingClientRect().width;
    const fillMultiplier = isMobileMarquee ? 1.5 : 2;
    let trackWidth = marqueeTrack.scrollWidth;

    while (trackWidth < containerWidth * fillMultiplier) {
        marqueeBaseItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('data-marquee-clone', 'true');
            marqueeTrack.appendChild(clone);
        });
        trackWidth = marqueeTrack.scrollWidth;
    }

    const loopDistance = trackWidth / 2;
    gsap.set(marqueeTrack, { x: 0 });
    marqueeTween = gsap.to(marqueeTrack, {
        x: -loopDistance,
        duration: isMobileMarquee ? 20 : 28,
        ease: 'none',
        repeat: -1
    });

    if (!marqueeScrollBound) {
        lenis.on('scroll', (e) => {
            if (!marqueeTween) return;
            const velocity = Math.abs(e.velocity);
            const isMobile = window.matchMedia('(max-width: 768px)').matches;

            // Reduced intensity on mobile for smoother feel
            const maxBoost = isMobile ? 1.5 : 2.5;
            const velocityDivisor = isMobile ? 80 : 50;
            const skewMultiplier = isMobile ? 0.03 : 0.08;
            const maxSkew = isMobile ? 3 : 6;

            const speedBoost = Math.min(maxBoost, velocity / velocityDivisor);
            const skew = gsap.utils.clamp(-maxSkew, maxSkew, e.velocity * skewMultiplier);

            gsap.to(marqueeTween, {
                timeScale: 1 + speedBoost,
                duration: 0.35,
                ease: 'power2.out'
            });

            gsap.to(marqueeTrack, {
                skewX: skew,
                duration: 0.25,
                ease: 'power3.out'
            });

            gsap.to(marqueeTrack, {
                skewX: 0,
                duration: 0.9,
                ease: 'power3.out'
            });
        });
        marqueeScrollBound = true;
    }
}

buildMarquee();

let marqueeResizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(marqueeResizeTimer);
    marqueeResizeTimer = setTimeout(() => buildMarquee(), 250);
});

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
const processGrid = document.querySelector('.process-grid');

if (processSteps.length > 0 && processGrid) {
    // Set initial state for all steps
    gsap.set(processSteps, {
        y: 60,
        opacity: 0,
        willChange: 'transform, opacity'
    });

    // Create a timeline for smooth staggered reveal
    const stepsTl = gsap.timeline({
        scrollTrigger: {
            trigger: processGrid,
            start: 'top 75%',
            end: 'bottom 60%',
            scrub: 0.8,  // Smooth scrub for buttery animation
        }
    });

    // Animate all steps with stagger
    stepsTl.to(processSteps, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        clearProps: 'willChange'  // Clean up after animation
    });
}

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

// ============================================
// CASE STUDY MODAL
// ============================================
const CASE_STUDIES = {
    aerospace: {
        title: 'AEROSPACE MONOLITH',
        category: 'WEBGL / E-COMMERCE',
        subtitle: 'A fully immersive 3D product experience for a premium aerospace brand, redefining how luxury hardware is presented online.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
        disciplines: ['WebGL / Immersive', '3D Product UX', 'Commerce'],
        stats: [
            { value: '340%', label: 'CONVERSION LIFT' },
            { value: '4.2M', label: 'UNIQUE VISITORS' },
            { value: '12s', label: 'AVG. SESSION TIME' }
        ],
        challenge: 'Aerospace Monolith needed to convey the precision engineering of their products in a digital space. Traditional e-commerce felt flat and generic — failing to communicate the weight, texture, and craftsmanship of titanium-forged components. Their existing conversion rate was below industry average at 0.8%.',
        approach: 'We built a WebGL-powered product configurator with real-time material rendering. Every product page became a cinematic experience — users could rotate, zoom, and inspect products in photorealistic 3D. The checkout flow was redesigned with micro-animations that reduced cognitive load and created a sense of ceremony around each purchase.',
        results: [
            'Tripled conversion by anchoring the buying moment in tactile 3D inspection.',
            'Reduced pre-purchase support tickets by 41% with clearer product comprehension.',
            'Boosted repeat visits through personalized saved configurations.'
        ],
        artifacts: [
            { src: 'assets/artifact-webgl-wireframe.svg', label: 'Wireframe Geometry Pass' },
            { src: 'assets/artifact-webgl-lighting.svg', label: 'Lighting & Material Study' }
        ],
        tech: ['Three.js', 'WebGL Shaders', 'GSAP', 'Shopify Hydrogen', 'React Three Fiber', 'Blender']
    },
    quoteweb: {
        title: 'QUOTEWEB',
        category: 'PWA / QUOTES APP',
        subtitle: 'A beautiful, minimalist Progressive Web App that delivers daily inspiration through curated quotes with smooth animations.',
        image: 'assets/work1.gif',
        disciplines: ['Product UX', 'PWA', 'Motion UI'],
        stats: [
            { value: 'PWA', label: 'INSTALLABLE' },
            { value: '∞', label: 'DAILY QUOTES' },
            { value: '60fps', label: 'SMOOTH ANIMATIONS' }
        ],
        challenge: 'Creating a lightweight yet visually stunning quotes application that works offline and feels native on any device. The goal was to deliver daily inspiration with an immersive, distraction-free reading experience.',
        approach: 'Built as a Progressive Web App with offline-first architecture. Features include smooth CSS animations, blur transitions, responsive typography, and a clean minimalist interface. The app is fully installable and works seamlessly across all devices.',
        results: [
            'Achieved 97% offline availability with an optimized caching strategy.',
            'Increased daily return rate by 28% through lightweight reminders.',
            'Maintained a sub-2s first load on 3G networks.'
        ],
        artifacts: [
            { src: 'assets/artifact-product-flow.svg', label: 'Quote Discovery Flow' },
            { src: 'assets/artifact-motion-curve.svg', label: 'Motion Timing Spec' }
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript', 'PWA', 'Service Workers', 'Web Manifest'],
        liveUrl: 'https://chronos778.github.io/quote.web/'
    },
    quotation: {
        title: 'QUOTATION',
        category: 'SOCIAL / QUOTES',
        subtitle: 'A social platform for discovering, saving, and sharing meaningful quotes with a clean, focused reading experience.',
        image: 'assets/work2.gif',
        disciplines: ['Product UX', 'Content Curation', 'Frontend Engineering'],
        stats: [
            { value: 'PWA', label: 'PLATFORM' },
            { value: 'SOCIAL', label: 'FOCUS' },
            { value: 'OPEN', label: 'SOURCE' }
        ],
        challenge: 'Create a distraction-free quotes experience that feels premium while supporting discovery, collections, and sharing across devices.',
        approach: 'We built a lightweight PWA with a clean typographic system and fast navigation. The UI prioritizes readability and quick saves, while the social layer helps users surface and share the best lines.',
        results: [
            'Improved time-to-save by 42% with single-tap collection flows.',
            'Increased share rate by 27% through frictionless social actions.',
            'Maintained sub-2s first load on mid-tier mobile devices.'
        ],
        artifacts: [
            { src: 'assets/artifact-quotation-flow.svg', label: 'Save, Curate, Share Flow' },
            { src: 'assets/artifact-quotation-typography.svg', label: 'Quote Typography System' }
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript', 'PWA'],
        githubUrl: 'https://github.com/SC136/Quotation'
    },
    carbon: {
        title: 'CARBON FINANCE',
        category: 'FINTECH / IDENTITY',
        subtitle: 'Complete brand identity and product design for a carbon credit trading platform disrupting environmental finance.',
        image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1200',
        disciplines: ['Brand System', 'Product UX', 'Data Visualization'],
        stats: [
            { value: '$180M', label: 'TRADING VOLUME' },
            { value: '28', label: 'COUNTRIES SERVED' },
            { value: '4.8★', label: 'APP STORE RATING' }
        ],
        challenge: 'Carbon Finance was entering a market dominated by institutional-grade tools that felt impenetrable to smaller businesses. They needed a brand and product experience that made carbon credit trading feel accessible, trustworthy, and even aspirational — without dumbing down the complexity.',
        approach: 'We developed a complete brand identity system — from logo to motion guidelines — rooted in the visual language of growth and transformation. The trading dashboard uses data visualization techniques borrowed from Bloomberg Terminal but reimagined with modern UI patterns. Real-time charts, portfolio analytics, and one-click trading create a premium experience.',
        results: [
            'Delivered a cohesive brand kit used across 14 product touchpoints.',
            'Improved trade completion rate by 22% with simplified flows.',
            'Increased investor confidence scores by 31% in user testing.'
        ],
        artifacts: [
            { src: 'assets/artifact-brand-system.svg', label: 'Brand System Overview' },
            { src: 'assets/artifact-type-scale.svg', label: 'Type Scale & Hierarchy' }
        ],
        tech: ['React', 'D3.js', 'Node.js', 'WebSocket', 'Stripe', 'AWS']
    },
    vanguard: {
        title: 'VANGUARD MUSEUM',
        category: 'EXPERIENTIAL',
        subtitle: 'An interactive virtual museum experience that blends physical exhibitions with immersive digital storytelling.',
        image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200',
        disciplines: ['WebGL / Immersive', 'Spatial UX', 'Storytelling'],
        stats: [
            { value: '2.1M', label: 'VIRTUAL VISITORS' },
            { value: '8min', label: 'AVG. ENGAGEMENT' },
            { value: '15', label: 'EXHIBITIONS LIVE' }
        ],
        challenge: 'The Vanguard Museum wanted to extend their physical exhibitions into the digital realm — not as a flat website, but as a true spatial experience. Previous attempts at "virtual tours" felt like glorified slideshows. They needed something that captured the awe of walking through their galleries.',
        approach: 'We created a first-person navigable 3D environment using photogrammetry scans of actual gallery spaces. Visitors can walk through exhibitions, approach artworks for high-resolution detail views, and access curator commentary via spatial audio. The experience adapts between WebGL on desktop and AR on mobile devices.',
        results: [
            'Tripled average engagement time with spatial discovery cues.',
            'Increased virtual membership signups by 19% after launch.',
            'Scaled to 1.2M concurrent visitors during feature exhibits.'
        ],
        artifacts: [
            { src: 'assets/artifact-webgl-wireframe.svg', label: 'Gallery Spatial Layout' },
            { src: 'assets/artifact-webgl-lighting.svg', label: 'Immersive Light Pass' }
        ],
        tech: ['Three.js', 'Photogrammetry', 'Web Audio API', 'WebXR', 'GSAP', 'Cloudflare Workers']
    },
    noir: {
        title: 'NOIR HOSPITALITY',
        category: 'LUXURY / BOOKING',
        subtitle: 'A bespoke booking platform for an ultra-luxury boutique hotel chain, where every interaction feels like a concierge service.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
        disciplines: ['Product UX', 'Service Design', 'Luxury Commerce'],
        stats: [
            { value: '67%', label: 'BOOKING INCREASE' },
            { value: '$1,200', label: 'AVG. BOOKING VALUE' },
            { value: '22s', label: 'TIME TO BOOK' }
        ],
        challenge: 'Noir Hospitality\'s properties charge $2,000+ per night, but their booking experience felt no different from a budget chain. High-net-worth guests were abandoning the site and calling concierge directly. The digital experience needed to match the physical luxury of their properties.',
        approach: 'We designed a booking flow that feels like a private concierge conversation. Instead of a calendar grid, guests describe their ideal stay and our AI-assisted system suggests dates, suites, and experiences. Cinematic video backgrounds, smooth page transitions, and a monochromatic palette create an atmosphere of understated elegance. The entire booking takes under 30 seconds.',
        results: [
            'Reduced time-to-book by 38% with guided inquiry steps.',
            'Lifted suite upgrades by 24% through personalized offers.',
            'Cut concierge call volume by 45% without harming CSAT.'
        ],
        artifacts: [
            { src: 'assets/artifact-product-flow.svg', label: 'Concierge Booking Flow' },
            { src: 'assets/artifact-motion-curve.svg', label: 'Transition Rhythm Spec' }
        ],
        tech: ['Nuxt.js', 'GSAP', 'Prismic CMS', 'Stripe', 'OpenAI API', 'Vercel']
    }
};

const caseModal = document.getElementById('case-modal');
const caseModalClose = document.getElementById('case-modal-close');

function openCaseStudy(caseKey) {
    const data = CASE_STUDIES[caseKey];
    if (!data || !caseModal) return;

    // Populate modal content
    document.getElementById('case-hero-img').src = data.image;
    document.getElementById('case-hero-img').alt = data.title;
    document.getElementById('case-category').textContent = data.category;
    document.getElementById('case-title').textContent = data.title;
    document.getElementById('case-subtitle').textContent = data.subtitle;
    document.getElementById('case-challenge').textContent = data.challenge;
    document.getElementById('case-approach').textContent = data.approach;

    const disciplinesContainer = document.getElementById('case-disciplines');
    const disciplinesSection = caseModal.querySelector('.modal-disciplines');
    if (disciplinesContainer && disciplinesSection) {
        if (data.disciplines && data.disciplines.length > 0) {
            disciplinesContainer.innerHTML = data.disciplines.map(d =>
                `<span class="tech-tag">${d}</span>`
            ).join('');
            disciplinesSection.style.display = '';
        } else {
            disciplinesContainer.innerHTML = '';
            disciplinesSection.style.display = 'none';
        }
    }

    // Build stats
    const statsContainer = document.getElementById('case-stats');
    statsContainer.innerHTML = data.stats.map(s =>
        `<div class="modal-stat"><span class="modal-stat-value">${s.value}</span><span class="modal-stat-label">${s.label}</span></div>`
    ).join('');

    const resultsContainer = document.getElementById('case-results');
    const resultsSection = resultsContainer ? resultsContainer.closest('.modal-section') : null;
    if (resultsContainer && resultsSection) {
        if (data.results && data.results.length > 0) {
            resultsContainer.innerHTML = data.results.map(result =>
                `<li>${result}</li>`
            ).join('');
            resultsSection.style.display = '';
        } else {
            resultsContainer.innerHTML = '';
            resultsSection.style.display = 'none';
        }
    }

    const artifactsContainer = document.getElementById('case-artifacts');
    const artifactsSection = caseModal.querySelector('.modal-artifacts');
    if (artifactsContainer && artifactsSection) {
        if (data.artifacts && data.artifacts.length > 0) {
            artifactsContainer.innerHTML = data.artifacts.map(artifact =>
                `<div class="modal-artifact"><img src="${artifact.src}" alt="${artifact.label}"><span>${artifact.label}</span></div>`
            ).join('');
            artifactsSection.style.display = '';
        } else {
            artifactsContainer.innerHTML = '';
            artifactsSection.style.display = 'none';
        }
    }

    // Build tech tags
    const techContainer = document.getElementById('case-tech');
    techContainer.innerHTML = data.tech.map(t =>
        `<span class="tech-tag">${t}</span>`
    ).join('');

    // Remove existing modal-links if any
    const existingLinks = techContainer.parentNode.querySelector('.modal-links');
    if (existingLinks) existingLinks.remove();

    // Add project links if available
    let linksHtml = '';
    if (data.liveUrl || data.githubUrl) {
        linksHtml = '<div class="modal-links">';
        if (data.liveUrl) {
            linksHtml += `<a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="modal-link">VIEW LIVE →</a>`;
        }
        if (data.githubUrl) {
            linksHtml += `<a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="modal-link">VIEW CODE →</a>`;
        }
        linksHtml += '</div>';
    }
    techContainer.insertAdjacentHTML('afterend', linksHtml);

    // Show modal with GSAP
    caseModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    lenis.stop();

    const tl = gsap.timeline();
    tl.fromTo(caseModal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
        .fromTo(caseModal.querySelector('.modal-container'), {
            y: 60, scale: 0.97
        }, {
            y: 0, scale: 1, duration: 0.6, ease: 'power3.out'
        }, '-=0.2')
        .fromTo(caseModal.querySelector('.modal-hero-img'), {
            scale: 1.15
        }, {
            scale: 1, duration: 1.2, ease: 'power2.out'
        }, '-=0.5');

    // Reset scroll position inside modal
    const modalScroll = caseModal.querySelector('.modal-scroll');
    if (modalScroll) modalScroll.scrollTop = 0;
}

function closeCaseStudy() {
    if (!caseModal) return;

    gsap.to(caseModal, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            caseModal.classList.remove('active');
            document.body.style.overflow = '';
            lenis.start();
        }
    });
}

// Bind work card clicks
document.querySelectorAll('.work-card[data-case]').forEach(card => {
    card.addEventListener('click', () => {
        const caseKey = card.getAttribute('data-case');
        openCaseStudy(caseKey);
    });
    card.style.cursor = 'pointer';
});

// Close modal
if (caseModalClose) {
    caseModalClose.addEventListener('click', closeCaseStudy);
}
if (caseModal) {
    caseModal.addEventListener('click', (e) => {
        if (e.target === caseModal) closeCaseStudy();
    });
}

// ============================================
// CONTACT FORM MODAL
// ============================================
const contactModal = document.getElementById('contact-modal');
const contactModalClose = document.getElementById('contact-modal-close');
const openContactBtn = document.getElementById('open-contact-form');
const leadForm = document.getElementById('lead-form');
const formSuccess = document.getElementById('form-success');

function openContactModal() {
    if (!contactModal) return;

    contactModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    lenis.stop();

    const tl = gsap.timeline();
    tl.fromTo(contactModal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
        .fromTo(contactModal.querySelector('.modal-container'), {
            y: 60, scale: 0.97
        }, {
            y: 0, scale: 1, duration: 0.6, ease: 'power3.out'
        }, '-=0.2');

    // Reset scroll and form
    const modalScroll = contactModal.querySelector('.modal-scroll');
    if (modalScroll) modalScroll.scrollTop = 0;
    if (leadForm) leadForm.reset();
    if (formSuccess) formSuccess.classList.remove('visible');
}

function closeContactModal() {
    if (!contactModal) return;

    gsap.to(contactModal, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            contactModal.classList.remove('active');
            document.body.style.overflow = '';
            lenis.start();
        }
    });
}

// Bind open button
if (openContactBtn) {
    openContactBtn.addEventListener('click', openContactModal);
}

// Close modal
if (contactModalClose) {
    contactModalClose.addEventListener('click', closeContactModal);
}
if (contactModal) {
    contactModal.addEventListener('click', (e) => {
        if (e.target === contactModal) closeContactModal();
    });
}

// Form submission (Formspree or custom handler)
if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = leadForm.querySelector('.btn-submit');
        const originalText = submitBtn.querySelector('.btn-text').textContent;
        submitBtn.querySelector('.btn-text').textContent = 'SENDING...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(leadForm);
            const response = await fetch(leadForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Show success state
                if (formSuccess) formSuccess.classList.add('visible');
                gsap.from(formSuccess, { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' });

                // Auto-close after delay
                setTimeout(() => {
                    closeContactModal();
                }, 3000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Fallback: open mailto
            submitBtn.querySelector('.btn-text').textContent = 'ERROR — TRY EMAIL';
            setTimeout(() => {
                submitBtn.querySelector('.btn-text').textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }
    });
}

// Close any modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (caseModal && caseModal.classList.contains('active')) closeCaseStudy();
        if (contactModal && contactModal.classList.contains('active')) closeContactModal();
    }
});

// ============================================
// PAGE TRANSITIONS
// ============================================
const pageTransition = document.getElementById('page-transition');
const transitionPanels = document.querySelectorAll('.transition-panel');

function animatePageTransition(targetId, callback) {
    if (!pageTransition || transitionPanels.length === 0) {
        if (callback) callback();
        return;
    }

    const tl = gsap.timeline();

    // Panels slide in from opposite directions
    tl.to(transitionPanels[0], {
        scaleY: 1,
        duration: 0.5,
        ease: 'power4.inOut'
    })
        .to(transitionPanels[1], {
            scaleY: 1,
            duration: 0.5,
            ease: 'power4.inOut'
        }, '-=0.4')
        .add(() => {
            // Execute callback (scroll to target)
            if (callback) callback();
        })
        .to(transitionPanels, {
            scaleY: 0,
            duration: 0.6,
            ease: 'power4.inOut',
            stagger: 0.1,
            delay: 0.2
        })
        .set(transitionPanels[0], { transformOrigin: 'bottom' })
        .set(transitionPanels[1], { transformOrigin: 'top' });
}

// Intercept nav link clicks for smooth transitions
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .footer-links a[href^="#"], .hero-cta a[href^="#"], .logo');

navLinks.forEach(link => {
    const href = link.getAttribute('href');

    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Close mobile menu if open
        if (document.body.classList.contains('menu-open')) {
            document.body.classList.remove('menu-open');
            lenis.start();
        }

        // If href is # or no target, scroll to top with transition
        if (!href || href === '#') {
            animatePageTransition('top', () => {
                lenis.scrollTo(0, { duration: 1.2, immediate: false });
            });
            return;
        }

        // Handle anchor links
        if (href.startsWith('#')) {
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);

            if (!target) {
                animatePageTransition('top', () => {
                    lenis.scrollTo(0, { duration: 1.2 });
                });
                return;
            }

            // Animate transition then scroll
            animatePageTransition(targetId, () => {
                lenis.scrollTo(target, {
                    duration: 1.2,
                    offset: 0,
                    immediate: false
                });
            });
        }
    });
});

// ============================================
// STAGGERED SCROLL REVEALS
// ============================================

// Service Categories
const serviceCategories = document.querySelectorAll('.service-category');
if (serviceCategories.length > 0) {
    ScrollTrigger.create({
        trigger: '.services-list',
        start: 'top 80%',
        onEnter: () => {
            serviceCategories.forEach((cat, i) => {
                setTimeout(() => {
                    cat.classList.add('revealed');
                }, i * 150);
            });
        },
        once: true
    });
}

// Footer Columns
const footerCols = document.querySelectorAll('.footer-col');
if (footerCols.length > 0) {
    ScrollTrigger.create({
        trigger: '.footer-grid',
        start: 'top 85%',
        onEnter: () => {
            footerCols.forEach((col, i) => {
                setTimeout(() => {
                    col.classList.add('revealed');
                }, i * 100);
            });
        },
        once: true
    });
}

// ============================================
// ANIMATED LINE DRAWING
// ============================================
const animatedLines = document.querySelectorAll('.step-line, .label-line');
animatedLines.forEach(line => {
    ScrollTrigger.create({
        trigger: line,
        start: 'top 85%',
        onEnter: () => {
            line.classList.add('drawn');
        },
        once: true
    });
});

// ============================================
// TESTIMONIAL QUOTE REVEAL
// ============================================
const testimonialQuote = document.querySelector('.testimonial-quote');
if (testimonialQuote) {
    ScrollTrigger.create({
        trigger: testimonialQuote,
        start: 'top 80%',
        onEnter: () => {
            testimonialQuote.classList.add('visible');
        },
        once: true
    });
}

// ============================================
// COUNTER GLOW EFFECT
// ============================================
const counterNumbers = document.querySelectorAll('.stat-number[data-count]');
counterNumbers.forEach(counter => {
    ScrollTrigger.create({
        trigger: counter,
        start: 'top 80%',
        onEnter: () => {
            counter.classList.add('counting');
            setTimeout(() => {
                counter.classList.remove('counting');
            }, 2000);
        },
        once: true
    });
});

// ============================================
// WORK CARD IMAGE SCALE ON SCROLL
// ============================================
const workCardImages = document.querySelectorAll('.work-card-window img');
workCardImages.forEach(img => {
    gsap.fromTo(img,
        { scale: 1.15 },
        {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('.work-card'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        }
    );
});

console.log('✨ TSROW Studio — Enhanced Animations Loaded');
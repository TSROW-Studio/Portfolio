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
// DEVICE & ANIMATION CONFIG
// ============================================
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

// Mobile-tuned animation parameters (snappier on small screens)
const ANIM = {
    chars: {
        y: IS_MOBILE ? 60 : 100,
        rotateX: IS_MOBILE ? 0 : -90,
        stagger: IS_MOBILE ? 0.04 : 0.02,
        duration: IS_MOBILE ? 0.6 : 1
    },
    lines: {
        stagger: IS_MOBILE ? 0.08 : 0.15,
        duration: IS_MOBILE ? 0.7 : 1.2
    },
    words: {
        y: IS_MOBILE ? 20 : 30,
        stagger: IS_MOBILE ? 0.02 : 0.03,
        duration: IS_MOBILE ? 0.5 : 0.8
    },
    fade: {
        y: IS_MOBILE ? 25 : 40,
        duration: IS_MOBILE ? 0.6 : 1
    },
    hero: {
        y: IS_MOBILE ? 80 : 150,
        rotateX: IS_MOBILE ? 0 : -45,
        stagger: IS_MOBILE ? 0.04 : 0.03,
        duration: IS_MOBILE ? 0.8 : 1.2
    }
};

// ============================================
// IMAGE BLUR-UP LOADING
// ============================================
function initBlurUpImages() {
    const images = document.querySelectorAll('.work-card img, .modal-hero-img');

    images.forEach(img => {
        // Skip already-loaded images
        if (img.complete && img.naturalWidth > 0) {
            img.classList.add('img-loaded');
            return;
        }

        img.addEventListener('load', () => {
            // Smooth reveal: blur dissolves over 0.8s
            gsap.to(img, {
                filter: img.closest('.work-card.active')
                    ? 'grayscale(0%) brightness(1) blur(0px)'
                    : 'grayscale(100%) brightness(0.6) blur(0px)',
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => img.classList.add('img-loaded')
            });
        });

        img.addEventListener('error', () => {
            // Fallback: still remove blur on error
            img.classList.add('img-loaded');
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
    // Skip parallax on mobile for performance (scrub animations are expensive)
    if (!IS_MOBILE) {
        initParallax();
    }

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
            y: ANIM.chars.y,
            opacity: 0,
            rotateX: ANIM.chars.rotateX,
            stagger: ANIM.chars.stagger,
            duration: ANIM.chars.duration,
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
            stagger: ANIM.lines.stagger,
            duration: ANIM.lines.duration,
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
            y: ANIM.words.y,
            opacity: 0,
            stagger: ANIM.words.stagger,
            duration: ANIM.words.duration,
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
            y: ANIM.fade.y,
            opacity: 0,
            duration: ANIM.fade.duration,
            ease: 'power2.out'
        });
    });

    // Hero title special animation
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        gsap.set(heroTitle, { autoAlpha: 1 }); // Reveal container
        const heroSplit = new SplitType(heroTitle, { types: 'chars, lines' });

        gsap.from(heroSplit.chars, {
            y: ANIM.hero.y,
            opacity: 0,
            rotateX: ANIM.hero.rotateX,
            stagger: ANIM.hero.stagger,
            duration: ANIM.hero.duration,
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
// METHODOLOGY HEADER PINNING
// ============================================
const processSection = document.querySelector('.section-process');
const processHeader = document.querySelector('.section-process .section-header');
const processGrid = document.querySelector('.process-grid');

if (processSection && processHeader && processGrid) {
    // Pin the methodology header while scrolling through process steps
    ScrollTrigger.create({
        trigger: processGrid,
        start: 'top 15%',
        end: 'bottom center',
        pin: processHeader,
        pinSpacing: false
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
        stats: [
            { value: '340%', label: 'CONVERSION LIFT' },
            { value: '4.2M', label: 'UNIQUE VISITORS' },
            { value: '12s', label: 'AVG. SESSION TIME' }
        ],
        challenge: 'Aerospace Monolith needed to convey the precision engineering of their products in a digital space. Traditional e-commerce felt flat and generic — failing to communicate the weight, texture, and craftsmanship of titanium-forged components. Their existing conversion rate was below industry average at 0.8%.',
        approach: 'We built a WebGL-powered product configurator with real-time material rendering. Every product page became a cinematic experience — users could rotate, zoom, and inspect products in photorealistic 3D. The checkout flow was redesigned with micro-animations that reduced cognitive load and created a sense of ceremony around each purchase.',
        tech: ['Three.js', 'WebGL Shaders', 'GSAP', 'Shopify Hydrogen', 'React Three Fiber', 'Blender']
    },
    onyx: {
        title: 'ONYX ARCHIVES',
        category: 'ARCHIVAL SYSTEM',
        subtitle: 'A next-generation digital archive for one of the world\'s largest private art collections, built for preservation and discovery.',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200',
        stats: [
            { value: '50K+', label: 'ARTWORKS INDEXED' },
            { value: '99.9%', label: 'UPTIME SLA' },
            { value: '<200ms', label: 'SEARCH LATENCY' }
        ],
        challenge: 'The Onyx Foundation owned over 50,000 artworks spanning five centuries, but their cataloging system was fragmented across spreadsheets, legacy databases, and physical index cards. Researchers had no unified way to search, cross-reference, or discover connections between pieces.',
        approach: 'We designed a headless CMS architecture with a custom search engine powered by vector embeddings for semantic art discovery. The interface uses a masonry grid with infinite scroll, high-DPI zoom capabilities, and a timeline visualization that maps the entire collection chronologically. Every detail was crafted for art historians and curators.',
        tech: ['Next.js', 'Sanity CMS', 'Algolia', 'PostgreSQL', 'Cloudinary', 'Figma']
    },
    carbon: {
        title: 'CARBON FINANCE',
        category: 'FINTECH / IDENTITY',
        subtitle: 'Complete brand identity and product design for a carbon credit trading platform disrupting environmental finance.',
        image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1200',
        stats: [
            { value: '$180M', label: 'TRADING VOLUME' },
            { value: '28', label: 'COUNTRIES SERVED' },
            { value: '4.8★', label: 'APP STORE RATING' }
        ],
        challenge: 'Carbon Finance was entering a market dominated by institutional-grade tools that felt impenetrable to smaller businesses. They needed a brand and product experience that made carbon credit trading feel accessible, trustworthy, and even aspirational — without dumbing down the complexity.',
        approach: 'We developed a complete brand identity system — from logo to motion guidelines — rooted in the visual language of growth and transformation. The trading dashboard uses data visualization techniques borrowed from Bloomberg Terminal but reimagined with modern UI patterns. Real-time charts, portfolio analytics, and one-click trading create a premium experience.',
        tech: ['React', 'D3.js', 'Node.js', 'WebSocket', 'Stripe', 'AWS']
    },
    vanguard: {
        title: 'VANGUARD MUSEUM',
        category: 'EXPERIENTIAL',
        subtitle: 'An interactive virtual museum experience that blends physical exhibitions with immersive digital storytelling.',
        image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200',
        stats: [
            { value: '2.1M', label: 'VIRTUAL VISITORS' },
            { value: '8min', label: 'AVG. ENGAGEMENT' },
            { value: '15', label: 'EXHIBITIONS LIVE' }
        ],
        challenge: 'The Vanguard Museum wanted to extend their physical exhibitions into the digital realm — not as a flat website, but as a true spatial experience. Previous attempts at "virtual tours" felt like glorified slideshows. They needed something that captured the awe of walking through their galleries.',
        approach: 'We created a first-person navigable 3D environment using photogrammetry scans of actual gallery spaces. Visitors can walk through exhibitions, approach artworks for high-resolution detail views, and access curator commentary via spatial audio. The experience adapts between WebGL on desktop and AR on mobile devices.',
        tech: ['Three.js', 'Photogrammetry', 'Web Audio API', 'WebXR', 'GSAP', 'Cloudflare Workers']
    },
    noir: {
        title: 'NOIR HOSPITALITY',
        category: 'LUXURY / BOOKING',
        subtitle: 'A bespoke booking platform for an ultra-luxury boutique hotel chain, where every interaction feels like a concierge service.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
        stats: [
            { value: '67%', label: 'BOOKING INCREASE' },
            { value: '$1,200', label: 'AVG. BOOKING VALUE' },
            { value: '22s', label: 'TIME TO BOOK' }
        ],
        challenge: 'Noir Hospitality\'s properties charge $2,000+ per night, but their booking experience felt no different from a budget chain. High-net-worth guests were abandoning the site and calling concierge directly. The digital experience needed to match the physical luxury of their properties.',
        approach: 'We designed a booking flow that feels like a private concierge conversation. Instead of a calendar grid, guests describe their ideal stay and our AI-assisted system suggests dates, suites, and experiences. Cinematic video backgrounds, smooth page transitions, and a monochromatic palette create an atmosphere of understated elegance. The entire booking takes under 30 seconds.',
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

    // Build stats
    const statsContainer = document.getElementById('case-stats');
    statsContainer.innerHTML = data.stats.map(s =>
        `<div class="modal-stat"><span class="modal-stat-value">${s.value}</span><span class="modal-stat-label">${s.label}</span></div>`
    ).join('');

    // Build tech tags
    const techContainer = document.getElementById('case-tech');
    techContainer.innerHTML = data.tech.map(t =>
        `<span class="tech-tag">${t}</span>`
    ).join('');

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
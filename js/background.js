/**
 * TSROW Studio — Void Geometry Engine
 * A premium 3D background using Three.js with floating wireframe primitives.
 */

// Configuration
// Configuration
const CONFIG = {
    objectCount: 25, // Reduced for cleaner look
    fogDensity: 0.05,
    mouseSensitivity: 0.02, // 2.5x slower parallax
    scrollSensitivity: 0.005, // 10x less reactive to scroll
    baseSpeed: 0.0005 // Slower base rotation
};

// State
const state = {
    width: window.innerWidth,
    height: window.innerHeight,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    scrollVel: 0,
    targetScrollVel: 0,
    mood: 0.0, // 0 = Home/Calm, 1 = Work/Intense
    targetMood: 0.0
};

// Scene Setup
const canvas = document.getElementById('gl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0a, CONFIG.fogDensity);

const camera = new THREE.PerspectiveCamera(75, state.width / state.height, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true // Critical for clean wireframes
});
renderer.setSize(state.width, state.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Geometry Pool
const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.BoxGeometry(1, 1, 1)
];

const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(0x444444), // Dark Grey
    transparent: true,
    opacity: 0.3,
    linewidth: 1 // Note: Windows WebGL implementation often limits this to 1
});

// Mood color targets (interpolated in animate loop)
const MOOD_COLORS = {
    home:    new THREE.Color(0x444444), // Neutral grey
    work:    new THREE.Color(0x666688), // Slightly purple-blue tint
    contact: new THREE.Color(0x334444)  // Teal-dark
};

// Create Objects
const objects = [];
const group = new THREE.Group();
scene.add(group);

for (let i = 0; i < CONFIG.objectCount; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const wireframe = new THREE.WireframeGeometry(geo);
    const line = new THREE.LineSegments(wireframe, material);

    // Random Position in "Voice"
    line.position.x = (Math.random() - 0.5) * 20;
    line.position.y = (Math.random() - 0.5) * 20;
    line.position.z = (Math.random() - 0.5) * 10 - 5; // Depth spread

    // Random Scale
    const scale = Math.random() * 0.5 + 0.2;
    line.scale.set(scale, scale, scale);

    // Random Rotation Speed
    line.userData = {
        rotX: (Math.random() - 0.5) * 0.01,
        rotY: (Math.random() - 0.5) * 0.01,
        baseY: line.position.y,
        randomPhase: Math.random() * Math.PI * 2
    };

    group.add(line);
    objects.push(line);
}

// Handling Resize
window.addEventListener('resize', () => {
    state.width = window.innerWidth;
    state.height = window.innerHeight;

    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();

    renderer.setSize(state.width, state.height);
});

// Handling Mouse
window.addEventListener('mousemove', (e) => {
    state.targetMouseX = (e.clientX - state.width / 2) * 0.001;
    state.targetMouseY = (e.clientY - state.height / 2) * 0.001;
});

// Reduced Motion Support
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Physics Interpolation
    if (!prefersReducedMotion) {
        // Heavy Dampening (Cinema Smooth)
        state.mouseX += (state.targetMouseX - state.mouseX) * 0.02; // Very slow follow
        state.mouseY += (state.targetMouseY - state.mouseY) * 0.02;

        // Clamp & Dampen Scroll
        // We limit the "target" influence to avoid spikes
        const clampedTarget = Math.min(Math.max(state.targetScrollVel, -5), 5); // Tighter clamp
        state.scrollVel += (clampedTarget - state.scrollVel) * 0.02; // Very heavy inertia

        state.mood += (state.targetMood - state.mood) * 0.01; // Ultra slow mood shift

        // === MOOD-REACTIVE VISUALS ===
        // Map mood: -0.5 (contact/frozen) → 0 (home/calm) → 1 (work/intense)
        const moodNorm = (state.mood + 0.5) / 1.5; // Normalize to 0–1

        // Rotation speed scales with mood
        const moodRotationMultiplier = 0.5 + moodNorm * 1.5; // 0.5x (frozen) → 2x (intense)

        // Wireframe opacity reacts to mood
        const moodOpacity = 0.15 + moodNorm * 0.3; // 0.15 (frozen) → 0.45 (intense)
        material.opacity = moodOpacity;

        // Wireframe color interpolation
        let targetColor;
        if (state.mood > 0.3) {
            targetColor = MOOD_COLORS.work;
        } else if (state.mood < -0.2) {
            targetColor = MOOD_COLORS.contact;
        } else {
            targetColor = MOOD_COLORS.home;
        }
        material.color.lerp(targetColor, 0.005); // Ultra smooth color shift

        // Fog density reacts to mood (denser when frozen, clearer when intense)
        const moodFog = 0.06 - moodNorm * 0.03; // 0.06 (frozen) → 0.03 (intense)
        scene.fog.density += (moodFog - scene.fog.density) * 0.01;

        // Camera Parallax (Mouse) - Reduced Amplitude
        camera.position.x += (state.mouseX * 2 - camera.position.x) * 0.02;
        camera.position.y += (-state.mouseY * 2 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        // Group Rotation (CONSTANT SMOOTH ROTATION)
        // Decoupled from scroll delta to prevent jitter
        group.rotation.y += CONFIG.baseSpeed * moodRotationMultiplier;
        group.rotation.x += CONFIG.baseSpeed * 0.5 * moodRotationMultiplier;

        // Individual Object Animation
        objects.forEach((obj, i) => {
            // Self Rotation - Speed influenced by mood
            obj.rotation.x += obj.userData.rotX * moodRotationMultiplier;
            obj.rotation.y += obj.userData.rotY * moodRotationMultiplier;

            // Float / Breathe - Amplitude influenced by mood
            const time = Date.now() * 0.0002; // Extremely slow breathe
            const breatheAmplitude = 0.1 + moodNorm * 0.2; // 0.1 (frozen) → 0.3 (intense)

            // Positions float gently
            obj.position.y = obj.userData.baseY + Math.sin(time + obj.userData.randomPhase) * breatheAmplitude;

            // Scroll "Warp" effect - Z-axis ONLY
            // This is the only place scroll affects physics now (linear movement, no rotation)
            obj.position.z += state.scrollVel * 0.005;

            // Loop objects back
            if (obj.position.z > 5) {
                obj.position.z -= 15;
            } else if (obj.position.z < -10) {
                obj.position.z += 15;
            }
        });

    } else {
        // Reduced Motion
        camera.position.x = 0;
        camera.position.y = 0;
        camera.lookAt(scene.position);
        group.rotation.y += 0.0001;
    }

    renderer.render(scene, camera);
}

animate();

// Public API
window.BG_ENGINE = {
    setScrollVelocity: (v) => {
        state.targetScrollVel = v;
    },
    setMood: (moodName) => {
        if (moodName === 'work') state.targetMood = 1.0;     // Hectic, Fast
        else if (moodName === 'home') state.targetMood = 0.0; // Calm, Float
        else if (moodName === 'contact') state.targetMood = -0.5; // Frozen, Still
    },
    setMoodValue: (value) => {
        const clamped = Math.min(Math.max(value, -0.5), 1.0);
        state.targetMood = clamped;
    }
};

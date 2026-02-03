/**
 * TSROW Studio — WebGL Background Engine
 * Premium noise shader with mouse interaction
 */

const canvas = document.getElementById('gl-canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

let mouseX = 0.5;
let mouseY = 0.5;
let time = 0;

// Vertex Shader
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

// Fragment Shader - Noise Field
const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    
    // Simplex noise functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }
    
    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 mouse = u_mouse;
        
        // Create flowing noise
        float noise1 = snoise(uv * 3.0 + u_time * 0.1);
        float noise2 = snoise(uv * 5.0 - u_time * 0.15);
        float noise3 = snoise(uv * 8.0 + u_time * 0.05);
        
        // Combine noise layers
        float noise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
        
        // Mouse interaction - create distortion near cursor
        float dist = distance(uv, mouse);
        float mouseInfluence = smoothstep(0.4, 0.0, dist);
        noise += mouseInfluence * snoise(uv * 10.0 + u_time * 0.3) * 0.5;
        
        // Color output - subtle dark noise
        float brightness = 0.02 + noise * 0.03;
        brightness = clamp(brightness, 0.0, 0.1);
        
        // Add subtle grid lines
        vec2 grid = fract(uv * 50.0);
        float gridLine = step(0.98, grid.x) + step(0.98, grid.y);
        brightness += gridLine * 0.02;
        
        gl_FragColor = vec4(vec3(brightness), 1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

if (gl) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    if (program) {
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
        const timeLocation = gl.getUniformLocation(program, 'u_time');

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        window.addEventListener('resize', resize);
        resize();

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX / window.innerWidth;
            mouseY = 1.0 - (e.clientY / window.innerHeight);
        });

        function render() {
            time += 0.016;

            gl.useProgram(program);
            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform2f(mouseLocation, mouseX, mouseY);
            gl.uniform1f(timeLocation, time);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        }

        render();
    }
} else {
    // Fallback for no WebGL - simple CSS animation
    canvas.style.background = 'linear-gradient(135deg, #0a0a0a 0%, #151515 100%)';
}

# TSROW Studio — Digital Flagship Website

![TSROW Studio](https://img.shields.io/badge/TSROW-Studio-000000?style=for-the-badge&labelColor=c8ff00)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![WebGL](https://img.shields.io/badge/WebGL-990000?style=flat-square&logo=webgl&logoColor=white)

A premium, cinematic portfolio website built with vanilla technologies. Features WebGL shaders, GSAP animations, smooth scrolling, and luxury microinteractions. Now includes a dedicated "Selected Works" showcase with performance-optimized video previews.

---

## ✨ Features

### Core Experience

- **WebGL Shader Background** — Flowing simplex noise that reacts to cursor movement
- **Cinematic Preloader** — Character-by-character logo reveal with progress bar
- **Smooth Scrolling** — Lenis-powered inertia scrolling
- **Scene-Based Navigation** — 7 distinct content sections with live indicator
- **Selected Works Showcase** — Dedicated project gallery with high-performance video previews

### Typography & Animation

- **SplitType Integration** — Character, word, and line-level animations
- **Text Scramble Effect** — Hacker-style text resolution on hover
- **3D Character Reveals** — RotateX transforms for depth
- **Counter Animations** — Numbers animate up on scroll
- **Performance Optimized** — All GIF assets converted to efficient WebM video format

### Interactions

- **Magnetic Buttons** — Elements attract to cursor with elastic physics
- **Custom Cursor** — Context-aware labels and hover states
- **Floating Work Preview** — Grayscale images follow cursor on project hover
- **Velocity-Linked Marquee** — Speed increases with scroll velocity

---

## 🛠 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| HTML5 | Semantic structure |
| CSS3 | Custom properties, Grid, Flexbox, Clamp |
| Vanilla JavaScript | No frameworks, pure ES6+ |
| Three.js / WebGL | Shader-based background & effects |
| GSAP 3.12 | Animation engine |
| ScrollTrigger | Scroll-based animations |
| Lenis | Smooth scroll |
| SplitType | Text splitting for animations |

---

## 📁 Project Structure

```text
tsrow/
├── index.html          # Main entry point (7 sections)
├── works.html          # Selected works gallery page
├── css/
├── js/
│   ├── app.js          # Main application logic
│   └── background.js   # WebGL shader engine
├── assets/             # Images & optimized WebM videos
├── convert-gif-to-webm.ps1 # Optimization utility script
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🚀 Quick Start

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/tsrow.git
   cd tsrow
   ```

2. **Open in browser**

   Simply open `index.html` in your browser, or use a local server:

   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

3. **Visit** `http://localhost:8000`

### Deployment

This is a static site. Deploy to any static hosting:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop the folder
- **GitHub Pages**: Enable in repo settings

---

## 🎨 Customization

### Colors

Edit CSS custom properties in `styles.css`:

```css
:root {
    --black: #0a0a0a;
    --white: #f5f5f5;
    --accent: #c8ff00;  /* Change this for different accent */
}
```

### Typography

Fonts are loaded from Google Fonts. Swap in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap" rel="stylesheet">
```

### Content

All text content is in `index.html`. Replace placeholder copy with your own.

---

## 📱 Responsive

The site is fully responsive with:

- Fluid typography using `clamp()`
- Mobile-optimized navigation with hamburger menu
- Horizontal scrolling category bars for touch devices
- Touch-friendly interactions and reduced motion support

---

## 🔧 Browser Support

| Browser | Support |
| :--- | :--- |
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| IE11 | ❌ Not supported |

WebGL is required for the background shader. Falls back gracefully on unsupported devices.

---

## 📄 License

MIT License — feel free to use this for personal or commercial projects.

---

## 🙏 Credits

- **GSAP** by GreenSock
- **Lenis** by Studio Freight
- **SplitType** by Luke Peavey
- Placeholder images from Unsplash

---

<p align="center">
  <strong>TSROW STUDIO</strong><br>
  <em>Digital Reality Engineers</em>
</p>

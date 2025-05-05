import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Initialize the 3D scene
function initScene() {
  // Create the scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  // Create the camera
  const camera = new THREE.PerspectiveCamera(
    100, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
  );
  camera.position.z = 5;

  // Create the renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Add the renderer to the DOM
  const container = document.getElementById('scene-container');
  container.appendChild(renderer.domElement);

  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Add a second directional light from another angle
  const directionalLight2 = new THREE.DirectionalLight(0x3498db, 0.8);
  directionalLight2.position.set(-5, 3, -5);
  scene.add(directionalLight2);

  // Create a loading indicator
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = `
    <div class="loader-spinner"></div>
    <div>Loading 3D Scene...</div>
  `;
  document.body.appendChild(loader);

  // Create a loading manager to track when all assets are loaded
  const loadingManager = new THREE.LoadingManager(
    // onLoad callback
    () => {
      // Hide the loader when everything is loaded
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    },
    // onProgress callback
    (url, itemsLoaded, itemsTotal) => {
      // Update loader text with progress
      const progressPercent = Math.round((itemsLoaded / itemsTotal) * 100);
      loader.querySelector('div:last-child').textContent = `Loading 3D Scene... ${progressPercent}%`;
    },
    // onError callback
    (url) => {
      console.error(`Error loading ${url}`);
      loader.querySelector('div:last-child').textContent = 'Error loading 3D assets';
    }
  );

  // Create a temporary cube while the text is loading
  const tempGeometry = new THREE.BoxGeometry(1, 1, 1);
  const tempMaterial = new THREE.MeshNormalMaterial();
  const tempCube = new THREE.Mesh(tempGeometry, tempMaterial);
  scene.add(tempCube);

  // Create a group to hold the 3D text
  const textGroup = new THREE.Group();
  scene.add(textGroup);

  // Load the font
  const fontLoader = new FontLoader(loadingManager);
  fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
    (font) => {
      // Remove the temporary cube
      scene.remove(tempCube);

      // Create the main name text
      const textGeometry = new TextGeometry('Anirudh Vasudev', {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 4
      });

      // Center the text geometry
      textGeometry.computeBoundingBox();
      textGeometry.center();

      // Create material for the text
      const textMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.4
      });

      // Create the text mesh and add it to the group
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textGroup.add(textMesh);

      // Create the subtitle text
      const subtitleGeometry = new TextGeometry('CREATIVE DEVELOPER', {
        font: font,
        size: 0.15,
        height: 0.05,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3
      });

      // Center the subtitle geometry
      subtitleGeometry.computeBoundingBox();
      subtitleGeometry.center();

      // Create the subtitle mesh and position it below the main text
      const subtitleMesh = new THREE.Mesh(subtitleGeometry, textMaterial);
      subtitleMesh.position.y = -0.4;
      textGroup.add(subtitleMesh);
    }
  );

  // Create a particle system for background
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2000;
  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x3498db
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Rotate the text group if it exists
    if (textGroup) {
      textGroup.rotation.y += 0.005;

      // Add a subtle floating motion
      textGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }

    // Rotate the temporary cube if it exists
    if (tempCube && tempCube.parent === scene) {
      tempCube.rotation.x += 0.01;
      tempCube.rotation.y += 0.01;
    }

    // Rotate the particle system
    particlesMesh.rotation.y += 0.0005;

    // Update controls
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Start the animation loop
  animate();
}

// Initialize the 3D scene
initScene();

// Add scroll indicator
const scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-indicator';
scrollIndicator.innerHTML = `
  <div class="arrow">↓</div>
  <div class="text">Scroll to explore</div>
`;
document.body.appendChild(scrollIndicator);

// Add back to top button
const backToTopButton = document.createElement('div');
backToTopButton.className = 'back-to-top';
backToTopButton.innerHTML = '↑';
document.body.appendChild(backToTopButton);

// Scroll event handling
window.addEventListener('scroll', () => {
  // Show/hide back to top button based on scroll position
  if (window.scrollY > window.innerHeight / 2) {
    backToTopButton.classList.add('visible');
  } else {
    backToTopButton.classList.remove('visible');
  }
});

// Scroll indicator click handler
scrollIndicator.addEventListener('click', () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  });
});

// Back to top button click handler
backToTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Portfolio content
document.querySelector('#app').innerHTML = `
  <div class="resume-container">
    <header class="resume-header">
      <div class="profile-section">
        <h1 class="name">John Doe</h1>
        <h2 class="title">Creative Developer</h2>
      </div>
      <div class="contact-section">
        <p><i class="contact-icon">📧</i> john.doe@example.com</p>
        <p><i class="contact-icon">📱</i> (123) 456-7890</p>
        <p><i class="contact-icon">🔗</i> linkedin.com/in/johndoe</p>
        <p><i class="contact-icon">🌐</i> github.com/johndoe</p>
        <p><i class="contact-icon">📍</i> San Francisco, CA</p>
      </div>
    </header>

    <section class="resume-section">
      <h2 class="section-title">About Me</h2>
      <p class="summary-text">
        Creative developer with a passion for building immersive web experiences using 3D graphics and modern web technologies.
        Skilled in Three.js, WebGL, JavaScript, React, and Node.js. I combine technical expertise with creative vision
        to create engaging digital experiences that push the boundaries of what's possible on the web.
      </p>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Featured Projects</h2>

      <div class="project-item">
        <h3 class="project-title">Interactive 3D Product Configurator</h3>
        <p class="project-description">
          Developed a WebGL-based 3D product configurator that allows users to customize products in real-time.
          Implemented features like material changes, color selection, and realistic lighting using Three.js and GLSL shaders.
        </p>
      </div>

      <div class="project-item">
        <h3 class="project-title">Immersive Data Visualization</h3>
        <p class="project-description">
          Created a 3D data visualization platform that transforms complex datasets into interactive, explorable 3D environments.
          Used Three.js for rendering and D3.js for data processing, with custom shaders for visual effects.
        </p>
      </div>

      <div class="project-item">
        <h3 class="project-title">WebXR Virtual Gallery</h3>
        <p class="project-description">
          Built a virtual art gallery experience with WebXR support, allowing users to explore artwork in VR/AR.
          Implemented optimized 3D models, dynamic lighting, and interactive elements using Three.js and the WebXR API.
        </p>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Skills</h2>

      <div class="skills-container">
        <div class="skill-category">
          <h3 class="skill-category-title">3D & Graphics</h3>
          <ul class="skills-list">
            <li>Three.js</li>
            <li>WebGL</li>
            <li>GLSL Shaders</li>
            <li>Blender</li>
            <li>WebXR</li>
          </ul>
        </div>

        <div class="skill-category">
          <h3 class="skill-category-title">Web Development</h3>
          <ul class="skills-list">
            <li>JavaScript (ES6+)</li>
            <li>React</li>
            <li>Node.js</li>
            <li>TypeScript</li>
            <li>CSS/SCSS</li>
          </ul>
        </div>

        <div class="skill-category">
          <h3 class="skill-category-title">Tools & Technologies</h3>
          <ul class="skills-list">
            <li>Git</li>
            <li>Webpack</li>
            <li>Vite</li>
            <li>Figma</li>
            <li>AWS</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Experience</h2>

      <div class="experience-item">
        <div class="job-header">
          <h3 class="job-title">Creative Developer</h3>
          <p class="company">Interactive Studio Inc.</p>
          <p class="job-period">January 2020 - Present</p>
        </div>
        <ul class="job-description">
          <li>Develop immersive 3D web experiences for clients in retail, education, and entertainment</li>
          <li>Create optimized 3D models and implement WebGL rendering pipelines</li>
          <li>Collaborate with designers and 3D artists to bring creative concepts to life</li>
          <li>Lead technical implementation of interactive installations and web-based AR experiences</li>
        </ul>
      </div>

      <div class="experience-item">
        <div class="job-header">
          <h3 class="job-title">Frontend Developer</h3>
          <p class="company">Digital Experiences LLC</p>
          <p class="job-period">June 2017 - December 2019</p>
        </div>
        <ul class="job-description">
          <li>Built responsive web applications with React and modern JavaScript</li>
          <li>Implemented interactive data visualizations using D3.js and SVG</li>
          <li>Developed WebGL-based animations and visual effects</li>
          <li>Optimized web performance for complex interactive applications</li>
        </ul>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Education</h2>

      <div class="education-item">
        <h3 class="degree">Master of Fine Arts in Digital Media</h3>
        <p class="university">Rhode Island School of Design</p>
        <p class="education-period">2015 - 2017</p>
      </div>

      <div class="education-item">
        <h3 class="degree">Bachelor of Science in Computer Science</h3>
        <p class="university">University of California, Berkeley</p>
        <p class="education-period">2011 - 2015</p>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Testimonials</h2>

      <div class="testimonials-container">
        <div class="testimonial-item">
          <p class="testimonial-text">
            "John created an incredible 3D experience for our product showcase that increased user engagement by 40%. His technical skills and creative vision exceeded our expectations."
          </p>
          <div class="testimonial-author">
            <p class="author-name">Sarah Johnson</p>
            <p class="author-title">Marketing Director, TechBrand Inc.</p>
          </div>
        </div>

        <div class="testimonial-item">
          <p class="testimonial-text">
            "Working with John was a pleasure. He transformed our complex data into an intuitive and beautiful 3D visualization that helped our clients understand our research findings with ease."
          </p>
          <div class="testimonial-author">
            <p class="author-name">Michael Chen</p>
            <p class="author-title">Lead Researcher, Data Insights Lab</p>
          </div>
        </div>

        <div class="testimonial-item">
          <p class="testimonial-text">
            "John's expertise in WebXR and 3D web development helped us create an immersive virtual showroom that revolutionized how we present our products during the pandemic."
          </p>
          <div class="testimonial-author">
            <p class="author-name">Emily Rodriguez</p>
            <p class="author-title">CEO, Modern Furnishings</p>
          </div>
        </div>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Awards & Recognition</h2>

      <div class="awards-container">
        <div class="award-item">
          <h3 class="award-title">Awwwards Site of the Day</h3>
          <p class="award-description">Recognized for excellence in digital design and creativity for the Interactive Museum project.</p>
          <p class="award-date">2022</p>
        </div>

        <div class="award-item">
          <h3 class="award-title">FWA of the Month</h3>
          <p class="award-description">Awarded for innovation in WebGL and 3D web experiences for the Virtual Fashion Show project.</p>
          <p class="award-date">2021</p>
        </div>

        <div class="award-item">
          <h3 class="award-title">CSS Design Awards - Best UI Design</h3>
          <p class="award-description">Honored for outstanding user interface design in the Immersive Data Visualization project.</p>
          <p class="award-date">2020</p>
        </div>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Blog & Articles</h2>

      <div class="blog-container">
        <div class="blog-item">
          <h3 class="blog-title">Creating Performant 3D Web Experiences</h3>
          <p class="blog-excerpt">
            Exploring optimization techniques for Three.js applications to ensure smooth performance across devices.
          </p>
          <p class="blog-meta">Published in CSS-Tricks • June 2022</p>
          <a href="#" class="blog-link">Read Article →</a>
        </div>

        <div class="blog-item">
          <h3 class="blog-title">The Future of WebXR: Beyond Gaming</h3>
          <p class="blog-excerpt">
            How WebXR is transforming industries from education to healthcare through immersive experiences.
          </p>
          <p class="blog-meta">Published in Smashing Magazine • March 2022</p>
          <a href="#" class="blog-link">Read Article →</a>
        </div>

        <div class="blog-item">
          <h3 class="blog-title">GLSL Shaders for Web Developers</h3>
          <p class="blog-excerpt">
            A beginner-friendly introduction to writing GLSL shaders for creative web projects.
          </p>
          <p class="blog-meta">Self-published • November 2021</p>
          <a href="#" class="blog-link">Read Article →</a>
        </div>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Contact Me</h2>

      <div class="contact-container">
        <div class="contact-info">
          <p>I'm always interested in hearing about new projects and opportunities. Feel free to reach out through any of the following channels:</p>

          <div class="contact-methods">
            <div class="contact-method">
              <h3>Email</h3>
              <p><a href="mailto:john.doe@example.com">john.doe@example.com</a></p>
            </div>

            <div class="contact-method">
              <h3>Phone</h3>
              <p>(123) 456-7890</p>
            </div>

            <div class="contact-method">
              <h3>Location</h3>
              <p>San Francisco, CA</p>
            </div>
          </div>

          <div class="social-links">
            <a href="#" class="social-link">LinkedIn</a>
            <a href="#" class="social-link">GitHub</a>
            <a href="#" class="social-link">Twitter</a>
            <a href="#" class="social-link">Dribbble</a>
            <a href="#" class="social-link">Medium</a>
          </div>
        </div>
      </div>
    </section>
  </div>
`

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
      const subtitleGeometry = new TextGeometry('Creative Developer', {
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
        <h1 class="name">Anirudh Vasudev</h1>
        <h2 class="title">Full Stack Developer | React & Node.js | Backend Optimization</h2>
      </div>
      <div class="contact-section">
        <p><i class="contact-icon">📧</i> anirudh040799@gmail.com</p>
        <p><i class="contact-icon">📱</i> +49 176 86415467</p>
        <p><i class="contact-icon">🔗</i> linkedin.com/in/anirudh-vasudev/</p>
        <p><i class="contact-icon">🌐</i> github.com/AnirudhVasudev47</p>
        <p><i class="contact-icon">🌍</i> anirudhvasudev.online/</p>
        <p><i class="contact-icon">📍</i> Berlin</p>
      </div>
    </header>

    <section class="resume-section">
      <h2 class="section-title">Summary</h2>
      <p class="summary-text">
        A software development professional with over 4 years of experience in full stack development and backend optimization, expert in React and Node.js. Key achievements include leading the development of a payment module that contributed to generating ₹60 crore in revenue, and improving project alignment by ensuring 100% requirement accuracy at Deloitte.
      </p>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Projects</h2>

      <div class="project-item">
        <h3 class="project-title">anirudh-portfolio</h3>
        <p class="project-description">
          <a href="https://anirudhvasudev.online/" target="_blank">https://anirudhvasudev.online/</a>
          <br>Updated portfolio with new profile image and content modifications.
        </p>
      </div>

      <div class="project-item">
        <h3 class="project-title">hookha-island</h3>
        <p class="project-description">
          <a href="https://hookha-island.vercel.app/" target="_blank">https://hookha-island.vercel.app/</a>
          <br>Built a booking web application for a hookah lounge. Recently updated to remove the "reserve table" option.
        </p>
      </div>

      <div class="project-item">
        <h3 class="project-title">3d-resume</h3>
        <p class="project-description">
          <a href="https://3d-resume-nine.vercel.app/" target="_blank">https://3d-resume-nine.vercel.app/</a>
          <br>Interactive 3D resume showcasing experience and skills with Three.js and React Three Fiber.
        </p>
      </div>

      <div class="project-item">
        <h3 class="project-title">aapka-restaurant-sample</h3>
        <p class="project-description">
          <a href="https://aapka-restaurant-sample.vercel.app/" target="_blank">https://aapka-restaurant-sample.vercel.app/</a>
          <br>Sample restaurant app demonstrating online ordering UI. Updated README recently.
        </p>
      </div>

      <div class="project-item">
        <h3 class="project-title">sample-restraunt</h3>
        <p class="project-description">
          <a href="https://sample-restraunt.vercel.app/" target="_blank">https://sample-restraunt.vercel.app/</a>
          <br>A demo restaurant navigation and menu project with recent nav fixes.
        </p>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Skills</h2>

      <div class="skills-container">
        <div class="skill-category">
          <h3 class="skill-category-title"><i class="fas fa-laptop-code"></i> Front-end</h3>
          <ul class="skills-list">
            <li><i class="fab fa-react"></i> ReactJS</li>
            <li><i class="fab fa-react"></i> React Native</li>
            <li><i class="fab fa-html5"></i> HTML</li>
            <li><i class="fab fa-js"></i> Typescript</li>
            <li><i class="fab fa-js"></i> Javascript</li>
            <li><i class="fab fa-css3-alt"></i> CSS</li>
            <li><i class="fab fa-css3"></i> Tailwind</li>
            <li><i class="fab fa-bootstrap"></i> Bootstrap</li>
            <li><i class="fas fa-exchange-alt"></i> RESTful APIs</li>
            <li><i class="fab fa-git-alt"></i> Git</li>
            <li><i class="fab fa-github"></i> Github</li>
            <li><i class="fas fa-project-diagram"></i> Redux</li>
            <li><i class="fas fa-spa"></i> SPA</li>
          </ul>
        </div>

        <div class="skill-category">
          <h3 class="skill-category-title"><i class="fas fa-server"></i> Back-end</h3>
          <ul class="skills-list">
            <li><i class="fab fa-node-js"></i> Express</li>
            <li><i class="fab fa-js"></i> Typescript</li>
            <li><i class="fab fa-js"></i> Javascript</li>
            <li><i class="fas fa-database"></i> MySQL</li>
            <li><i class="fab fa-aws"></i> AWS (Amazon Web Services)</li>
            <li><i class="fas fa-database"></i> NoSQL</li>
            <li><i class="fas fa-fire"></i> Firebase</li>
            <li><i class="fas fa-cubes"></i> Microservices</li>
            <li><i class="fas fa-cloud"></i> Serverless</li>
            <li><i class="fab fa-laravel"></i> Laravel</li>
            <li><i class="fas fa-database"></i> PostgresSQL</li>
            <li><i class="fab fa-git-alt"></i> Git Version Control</li>
          </ul>
        </div>

        <div class="skill-category">
          <h3 class="skill-category-title"><i class="fas fa-paint-brush"></i> UI/UX</h3>
          <ul class="skills-list">
            <li><i class="fab fa-figma"></i> Figma</li>
          </ul>
        </div>

        <div class="skill-category">
          <h3 class="skill-category-title"><i class="fas fa-language"></i> Languages</h3>
          <ul class="skills-list">
            <li><i class="fas fa-flag-usa"></i> English – Native</li>
            <li><i class="fas fa-flag"></i> German – Beginner</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Experience</h2>

      <div class="experience-item">
        <div class="job-header">
          <h3 class="job-title">Consultant</h3>
          <p class="company">Deloitte, Bengaluru, Karnataka, India</p>
          <p class="job-period">Nov 2023 – Jul 2024</p>
        </div>
        <ul class="job-description">
          <li>Titan Project – Improved project alignment with client goals by ensuring 100% requirement accuracy during the discovery phase.</li>
          <li>VGuard Project – Designed and implemented core modules, APIs, including a real-time notification engine, attendance tracking system, and expense management feature, improving user experience and operational efficiency.</li>
        </ul>
      </div>

      <div class="experience-item">
        <div class="job-header">
          <h3 class="job-title">Full Stack Developer</h3>
          <p class="company">BHIVE Alts, Bengaluru, Karnataka, India</p>
          <p class="job-period">Jun 2022 – Nov 2023</p>
        </div>
        <ul class="job-description">
          <li>Developed BHIVE Alts App – Solely built and launched an investor-focused app, driving user engagement and supporting company growth.</li>
          <li>Project Lead for Payment Module – Led development of a payment module, contributing to combined revenue generation of ₹60 crore.</li>
          <li>Tech Stack Optimization – Introduced improvements to the tech stack, enhancing app performance and reliability.</li>
        </ul>
      </div>

      <div class="experience-item">
        <div class="job-header">
          <h3 class="job-title">Software Engineer</h3>
          <p class="company">Webbirth, Bangalore Urban, Karnataka, India</p>
          <p class="job-period">Sep 2021 – Jun 2022</p>
        </div>
        <ul class="job-description">
          <li>Built mobile applications for six projects using React Native and Flutter.</li>
          <li>Enhanced solution reliability by 25% through leading backend development with Node.js and Laravel.</li>
          <li>Worked across multiple technologies to meet varied client requirements in a dynamic startup environment.</li>
        </ul>
      </div>

      <div class="experience-item">
        <div class="job-header">
          <h3 class="job-title">Full Stack Developer</h3>
          <p class="company">Civil Engineering System, Bangalore Urban, Karnataka, India</p>
          <p class="job-period">Jun 2020 – Jul 2021</p>
        </div>
        <ul class="job-description">
          <li>Supported development and testing of in-house applications, focusing on PHP-based backend services and frontend development with React and theming using Bootstrap.</li>
          <li>Contributed to UI/UX design to improve the customer-facing platform.</li>
        </ul>
      </div>
    </section>

    <section class="resume-section">
      <h2 class="section-title">Education</h2>

      <div class="education-item">
        <h3 class="degree">Master's Degree, Data Science</h3>
        <p class="university">IU International University of Applied Sciences</p>
        <p class="education-period">Oct 2024 – Oct 2025</p>
      </div>

      <div class="education-item">
        <h3 class="degree">Bachelor of Technology - BTech, Computer Science</h3>
        <p class="university">Presidency University, Bangalore</p>
        <p class="education-period">Jan 2017 – Dec 2021</p>
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
              <p><a href="mailto:anirudh040799@gmail.com">anirudh040799@gmail.com</a></p>
            </div>

            <div class="contact-method">
              <h3>Phone</h3>
              <p>+49 176 86415467</p>
            </div>

            <div class="contact-method">
              <h3>Location</h3>
              <p>Berlin</p>
            </div>
          </div>

          <div class="social-links">
            <a href="https://www.linkedin.com/in/anirudh-vasudev/" target="_blank" class="social-link">LinkedIn</a>
            <a href="https://github.com/AnirudhVasudev47" target="_blank" class="social-link">GitHub</a>
            <a href="https://anirudhvasudev.online/" target="_blank" class="social-link">Portfolio</a>
          </div>
        </div>
      </div>
    </section>
  </div>
`

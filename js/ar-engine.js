/**
 * SoleFit WebAR Three.js Rendering Engine
 * Handles 3D footwear preview, materials, camera overlay projection, and foot position alignment.
 */

class AREngine {
  constructor() {
    this.pdpScene = null;
    this.pdpCamera = null;
    this.pdpRenderer = null;
    this.pdpShoeMesh = null;
    this.pdpAnimationFrame = null;

    this.arScene = null;
    this.arCamera = null;
    this.arRenderer = null;
    this.arShoeGroup = null;
    this.arAnimationFrame = null;

    this.currentProduct = null;
    this.currentColor = null;
    
    this.shoeRotation = { x: 0, y: 0.8, z: 0 };
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
  }

  /**
   * Initializes the interactive 3D shoe viewer on the Product Detail Page (PDP)
   */
  initPDPVisualizer(canvasElement, product) {
    if (!window.THREE) {
      console.error('Three.js library is required.');
      return;
    }

    this.currentProduct = product;
    this.currentColor = product.colors[0];

    const width = canvasElement.clientWidth || 500;
    const height = canvasElement.clientHeight || 380;

    // Scene setup
    this.pdpScene = new THREE.Scene();

    // Camera setup
    this.pdpCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.pdpCamera.position.set(0, 2.5, 6);
    this.pdpCamera.lookAt(0, 0, 0);

    // Renderer setup
    this.pdpRenderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, alpha: true });
    this.pdpRenderer.setSize(width, height);
    this.pdpRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.pdpRenderer.shadowMap.enabled = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.pdpScene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    this.pdpScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.4);
    dirLight2.position.set(-5, -2, -5);
    this.pdpScene.add(dirLight2);

    // Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1;
    shadowPlane.receiveShadow = true;
    this.pdpScene.add(shadowPlane);

    // Build 3D Shoe Model
    this.buildShoeMesh(product, this.currentColor, false);

    // Add mouse rotate listeners
    this.setupOrbitInteractions(canvasElement);

    // Start render loop
    this.animatePDP();
  }

  /**
   * Builds high-detail 3D procedural shoe geometry matching shoe type & colorway
   */
  buildShoeMesh(product, colorVariant, isARMode = false) {
    const targetScene = isARMode ? this.arScene : this.pdpScene;
    if (!targetScene) return;

    // Remove existing mesh if present
    if (isARMode && this.arShoeGroup) {
      targetScene.remove(this.arShoeGroup);
    } else if (!isARMode && this.pdpShoeMesh) {
      targetScene.remove(this.pdpShoeMesh);
    }

    const shoeGroup = new THREE.Group();

    // Color definitions
    const primaryHex = parseInt((colorVariant ? colorVariant.hex : product.colors[0].hex).replace('#', '0x'));
    const secondaryHex = parseInt((colorVariant ? colorVariant.secondary : product.colors[0].secondary).replace('#', '0x'));

    // Materials
    const soleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1
    });

    const upperMat = new THREE.MeshStandardMaterial({
      color: primaryHex,
      roughness: 0.5,
      metalness: 0.2
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: secondaryHex,
      roughness: 0.2,
      metalness: 0.8
    });

    const laceMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9
    });

    // 1. Sole / Midsole Base
    const soleShape = new THREE.BoxGeometry(1.6, 0.4, 3.2);
    const soleMesh = new THREE.Mesh(soleShape, soleMat);
    soleMesh.position.set(0, -0.6, 0);
    soleMesh.castShadow = true;
    soleMesh.receiveShadow = true;
    shoeGroup.add(soleMesh);

    // Cushioning Accent Line on Sole
    const cushionGeo = new THREE.BoxGeometry(1.65, 0.1, 3.0);
    const cushionMesh = new THREE.Mesh(cushionGeo, accentMat);
    cushionMesh.position.set(0, -0.5, 0);
    shoeGroup.add(cushionMesh);

    // 2. Main Shoe Upper Body
    const upperGeo = new THREE.SphereGeometry(1.1, 32, 16);
    upperGeo.scale(0.8, 0.7, 1.4);
    const upperMesh = new THREE.Mesh(upperGeo, upperMat);
    upperMesh.position.set(0, -0.1, -0.1);
    upperMesh.castShadow = true;
    shoeGroup.add(upperMesh);

    // Toe Box Guard
    const toeGeo = new THREE.SphereGeometry(0.85, 24, 16);
    toeGeo.scale(0.8, 0.5, 0.8);
    const toeMesh = new THREE.Mesh(toeGeo, accentMat);
    toeMesh.position.set(0, -0.3, 0.85);
    shoeGroup.add(toeMesh);

    // Heel Cap
    const heelGeo = new THREE.BoxGeometry(1.3, 0.9, 0.8);
    const heelMesh = new THREE.Mesh(heelGeo, accentMat);
    heelMesh.position.set(0, 0.1, -0.9);
    shoeGroup.add(heelMesh);

    // Laces / Tongue Detail
    for (let i = 0; i < 4; i++) {
      const laceGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0);
      laceGeo.rotateZ(Math.PI / 2);
      const laceMesh = new THREE.Mesh(laceGeo, laceMat);
      laceMesh.position.set(0, 0.2 + (i * 0.12), 0.3 - (i * 0.3));
      shoeGroup.add(laceMesh);
    }

    // High-top extension if applicable
    if (product.model3dSpecs && product.model3dSpecs.type === 'procedural-hightop') {
      const collarGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.9, 24);
      const collarMesh = new THREE.Mesh(collarGeo, upperMat);
      collarMesh.position.set(0, 0.6, -0.4);
      shoeGroup.add(collarMesh);
    }

    // Boot ankle support if applicable
    if (product.model3dSpecs && product.model3dSpecs.type === 'procedural-boot') {
      const bootCollarGeo = new THREE.CylinderGeometry(0.8, 0.85, 1.2, 24);
      const bootCollarMesh = new THREE.Mesh(bootCollarGeo, accentMat);
      bootCollarMesh.position.set(0, 0.8, -0.4);
      shoeGroup.add(bootCollarMesh);
    }

    // Set scales and initial positioning
    const scale = product.model3dSpecs ? product.model3dSpecs.scale : { x: 1, y: 1, z: 1 };
    shoeGroup.scale.set(scale.x * 0.95, scale.y * 0.95, scale.z * 0.95);

    if (isARMode) {
      this.arShoeGroup = shoeGroup;
      targetScene.add(this.arShoeGroup);
    } else {
      this.pdpShoeMesh = shoeGroup;
      this.pdpScene.add(this.pdpShoeMesh);
    }
  }

  /**
   * Sets up mouse drag/touch controls to rotate 3D shoe model
   */
  setupOrbitInteractions(canvasElement) {
    canvasElement.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvasElement.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.pdpShoeMesh) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.pdpShoeMesh.rotation.y += deltaX * 0.01;
      this.pdpShoeMesh.rotation.x += deltaY * 0.005;

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch support for mobile devices
    canvasElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    canvasElement.addEventListener('touchmove', (e) => {
      if (!this.isDragging || !this.pdpShoeMesh || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.pdpShoeMesh.rotation.y += deltaX * 0.01;
      this.pdpShoeMesh.rotation.x += deltaY * 0.005;

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    canvasElement.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  /**
   * Update shoe colorway on active 3D model
   */
  updateColor(colorVariant) {
    this.currentColor = colorVariant;
    if (this.currentProduct) {
      if (this.pdpScene) this.buildShoeMesh(this.currentProduct, colorVariant, false);
      if (this.arScene) this.buildShoeMesh(this.currentProduct, colorVariant, true);
    }
  }

  /**
   * PDP Render Loop with smooth idle floating motion
   */
  animatePDP() {
    this.pdpAnimationFrame = requestAnimationFrame(() => this.animatePDP());

    if (this.pdpShoeMesh && !this.isDragging) {
      this.pdpShoeMesh.rotation.y += 0.005; // Idle auto-rotation
      this.pdpShoeMesh.position.y = Math.sin(Date.now() * 0.002) * 0.08;
    }

    if (this.pdpRenderer && this.pdpScene && this.pdpCamera) {
      this.pdpRenderer.render(this.pdpScene, this.pdpCamera);
    }
  }

  /**
   * Initializes the WebAR Camera 3D Overlay Scene
   */
  initARVisualizer(canvasElement, product) {
    if (!window.THREE) return;

    this.currentProduct = product;
    const width = canvasElement.clientWidth || window.innerWidth;
    const height = canvasElement.clientHeight || window.innerHeight;

    this.arScene = new THREE.Scene();
    this.arCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.arCamera.position.set(0, 3, 5);
    this.arCamera.lookAt(0, 0, 0);

    this.arRenderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, alpha: true });
    this.arRenderer.setSize(width, height);
    this.arRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // WebAR Lighting (matches ambient environment)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.arScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(2, 6, 4);
    this.arScene.add(dirLight);

    this.buildShoeMesh(product, this.currentColor, true);

    this.animateAR();
  }

  /**
   * Updates 3D Shoe position & angle inside WebAR camera feed based on foot tracking anchor
   */
  updateARFootAnchor(anchorData) {
    if (!this.arShoeGroup) return;

    // Smooth lerp positioning
    const targetX = (anchorData.x - 0.5) * 4;
    const targetY = -(anchorData.y - 0.5) * 3;
    const targetScale = anchorData.scale || 1.0;

    this.arShoeGroup.position.x += (targetX - this.arShoeGroup.position.x) * 0.2;
    this.arShoeGroup.position.y += (targetY - this.arShoeGroup.position.y) * 0.2;
    
    this.arShoeGroup.scale.set(targetScale * 0.9, targetScale * 0.9, targetScale * 1.1);
    
    if (anchorData.angle !== undefined) {
      this.arShoeGroup.rotation.y = anchorData.angle;
    }
  }

  /**
   * WebAR Render Loop
   */
  animateAR() {
    this.arAnimationFrame = requestAnimationFrame(() => this.animateAR());

    if (this.arRenderer && this.arScene && this.arCamera) {
      this.arRenderer.render(this.arScene, this.arCamera);
    }
  }

  /**
   * Clean up scenes & animation loops
   */
  destroy() {
    if (this.pdpAnimationFrame) cancelAnimationFrame(this.pdpAnimationFrame);
    if (this.arAnimationFrame) cancelAnimationFrame(this.arAnimationFrame);
  }
}

window.AREngine = new AREngine();

/**
 * SoleFit Application Coordinator
 * Controls tab switching, WebAR camera modal lifecycle, interactions, and store events.
 */

class SoleFitApp {
  constructor() {
    this.currentProduct = null;
    this.selectedColor = null;
    this.selectedSize = null;
    this.mediaStream = null;
    this.isAROpen = false;
    this.isCameraActive = false;
    this.isSimulatedMode = false;
    this.arAnimLoop = null;
  }

  /**
   * Initializes application state and event listeners
   */
  init() {
    if (window.SoleFitCatalog && window.SoleFitCatalog.length > 0) {
      this.currentProduct = window.SoleFitCatalog[0];
      this.selectedColor = this.currentProduct.colors[0];
    }

    this.bindNavigation();
    this.renderPDP();
    this.bindARModalEvents();
    
    if (window.WidgetEmbed) window.WidgetEmbed.renderLivePreview();
    if (window.AnalyticsDashboard) window.AnalyticsDashboard.initCharts();
  }

  /**
   * Header Tab Navigation
   */
  bindNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = btn.getAttribute('data-view');
        
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.view-container').forEach(view => {
          view.classList.remove('active');
        });

        const targetContainer = document.getElementById(`${targetView}View`);
        if (targetContainer) {
          targetContainer.classList.add('active');
        }

        if (targetView === 'analytics' && window.AnalyticsDashboard) {
          window.AnalyticsDashboard.initCharts();
        }
      });
    });
  }

  /**
   * Renders the PDP layout with dynamic catalog data
   */
  renderPDP() {
    if (!this.currentProduct) return;

    const prod = this.currentProduct;
    
    document.getElementById('pdpCategory').textContent = prod.category;
    document.getElementById('pdpTitle').textContent = prod.name;
    document.getElementById('pdpPrice').textContent = `$${prod.price.toFixed(2)}`;
    document.getElementById('pdpRating').textContent = `★ ${prod.rating} (${prod.reviews} reviews)`;
    document.getElementById('pdpDesc').textContent = prod.description;

    // Render Color Options
    const colorContainer = document.getElementById('pdpColorOptions');
    colorContainer.innerHTML = '';
    prod.colors.forEach((col, idx) => {
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${idx === 0 ? 'active' : ''}`;
      swatch.style.background = col.hex;
      swatch.title = col.name;
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.selectedColor = col;
        if (window.AREngine) window.AREngine.updateColor(col);
      });
      colorContainer.appendChild(swatch);
    });

    // Render Size Chips
    const sizeContainer = document.getElementById('pdpSizeOptions');
    sizeContainer.innerHTML = '';
    prod.sizeChart.forEach(size => {
      const chip = document.createElement('div');
      chip.className = 'size-chip';
      chip.textContent = `US ${size.US}`;
      chip.setAttribute('data-size', size.US);
      chip.addEventListener('click', () => {
        document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedSize = size;
      });
      sizeContainer.appendChild(chip);
    });

    // Init 3D Viewport
    const pdpCanvas = document.getElementById('pdp3dCanvas');
    if (pdpCanvas && window.AREngine) {
      window.AREngine.initPDPVisualizer(pdpCanvas, prod);
    }
  }

  /**
   * WebAR Modal Opening & Camera Lifecycle
   */
  openARModal() {
    const modal = document.getElementById('arModal');
    if (!modal) return;

    modal.classList.add('open');
    this.isAROpen = true;

    // Initialize WebAR 3D Canvas
    const arCanvas = document.getElementById('arThreeCanvas');
    if (arCanvas && window.AREngine) {
      window.AREngine.initARVisualizer(arCanvas, this.currentProduct);
    }

    // Attempt webcam access
    this.startCamera();
  }

  closeARModal() {
    const modal = document.getElementById('arModal');
    if (!modal) return;

    modal.classList.remove('open');
    this.isAROpen = false;

    this.stopCamera();

    if (this.arAnimLoop) {
      cancelAnimationFrame(this.arAnimLoop);
      this.arAnimLoop = null;
    }
  }

  /**
   * Requests User WebCam via getUserMedia with fallback to simulated scan
   */
  async startCamera() {
    const video = document.getElementById('arVideoFeed');
    const statusDot = document.getElementById('arStatusDot');
    const statusText = document.getElementById('arStatusText');

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        video.srcObject = this.mediaStream;
        await video.play();
        this.isCameraActive = true;
        this.isSimulatedMode = false;
        
        if (statusText) statusText.textContent = 'Live WebAR Stream Active';
        if (statusDot) statusDot.style.background = '#10b981';
      } else {
        throw new Error('Camera access not supported');
      }
    } catch (err) {
      console.warn('Camera access unavailable or denied. Entering AR Simulation Mode.', err);
      this.enableSimulatedARMode();
    }

    this.startARCalibrationLoop();
  }

  enableSimulatedARMode() {
    this.isSimulatedMode = true;
    this.isCameraActive = false;

    const statusDot = document.getElementById('arStatusDot');
    const statusText = document.getElementById('arStatusText');

    if (statusText) statusText.textContent = 'WebAR Demo Simulation Active';
    if (statusDot) statusDot.style.background = '#06b6d4';

    this.showToast('Using Interactive WebAR Scan Simulator (Camera stream offline)');
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isCameraActive = false;
  }

  /**
   * Continuous WebAR calibration & 3D shoe anchor overlay loop
   */
  startARCalibrationLoop() {
    const overlayCanvas = document.getElementById('arCanvasOverlay');
    if (!overlayCanvas) return;

    const ctx = overlayCanvas.getContext('2d');

    const loop = () => {
      if (!this.isAROpen) return;

      overlayCanvas.width = overlayCanvas.clientWidth;
      overlayCanvas.height = overlayCanvas.clientHeight;

      // 1. Process scan metrics
      let metrics = null;
      if (window.SizeCalibrator) {
        window.SizeCalibrator.isScanning = true;
        metrics = window.SizeCalibrator.processCameraFrame(
          ctx, 
          overlayCanvas.width, 
          overlayCanvas.height, 
          this.isSimulatedMode
        );

        // Perform best size chart matching
        window.SizeCalibrator.calculateBestSize(this.currentProduct, metrics.lengthCm, metrics.widthCm);

        // Render Computer Vision overlay bounds
        window.SizeCalibrator.renderTrackingOverlay(ctx, overlayCanvas.width, overlayCanvas.height, true);

        // Update UI fit metrics panel
        this.updateARMetricsUI(metrics);
      }

      // 2. Update 3D Shoe position on canvas
      if (window.AREngine) {
        window.AREngine.updateARFootAnchor({
          x: 0.5,
          y: 0.5,
          scale: 1.0,
          angle: Math.sin(Date.now() * 0.001) * 0.15
        });
      }

      this.arAnimLoop = requestAnimationFrame(loop);
    };

    loop();
  }

  /**
   * Updates side panel recommendation numbers & heatmap bars
   */
  updateARMetricsUI(metrics) {
    if (!metrics || !metrics.recommendedSize) return;

    const rec = metrics.recommendedSize;
    
    document.getElementById('arRecSize').textContent = `US ${rec.US}`;
    document.getElementById('arEuSize').textContent = `EU ${rec.EU} / UK ${rec.UK}`;
    document.getElementById('arFootLength').textContent = `${metrics.lengthCm} cm`;
    document.getElementById('arFootWidth').textContent = `${metrics.widthCm} cm`;
    document.getElementById('arWidthProfile').textContent = metrics.widthProfile;
    document.getElementById('arFitConfidence').textContent = `${metrics.confidence}%`;

    // Heatmap bar updates
    const toeFill = document.getElementById('heatToeFill');
    const instepFill = document.getElementById('heatInstepFill');
    const heelFill = document.getElementById('heatHeelFill');

    if (toeFill) toeFill.style.width = `${metrics.heatmap.toeBox}%`;
    if (instepFill) instepFill.style.width = `${metrics.heatmap.instep}%`;
    if (heelFill) heelFill.style.width = `${metrics.heatmap.heel}%`;

    // Highlight size chip on PDP
    this.highlightRecommendedSizePDP(rec.US);
  }

  /**
   * Auto-selects and highlights the calibrated size on PDP
   */
  highlightRecommendedSizePDP(recommendedUS) {
    const chips = document.querySelectorAll('.size-chip');
    chips.forEach(chip => {
      chip.classList.remove('recommended');
      if (parseFloat(chip.getAttribute('data-size')) === recommendedUS) {
        chip.classList.add('recommended', 'active');
      }
    });
  }

  /**
   * AR Modal UI Button Bindings
   */
  bindARModalEvents() {
    const closeBtn = document.getElementById('arCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeARModal());

    const toggleDemoBtn = document.getElementById('toggleDemoBtn');
    if (toggleDemoBtn) {
      toggleDemoBtn.addEventListener('click', () => {
        if (this.isSimulatedMode) {
          this.startCamera();
        } else {
          this.stopCamera();
          this.enableSimulatedARMode();
        }
      });
    }

    const applySizeBtn = document.getElementById('arApplySizeBtn');
    if (applySizeBtn) {
      applySizeBtn.addEventListener('click', () => {
        const sizeText = document.getElementById('arRecSize').textContent;
        this.showToast(`Calibrated ${sizeText} applied to your cart selection!`);
        this.closeARModal();
      });
    }
  }

  /**
   * Toast notification system
   */
  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7"/>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Global initialization on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.SoleFitApp = new SoleFitApp();
  window.SoleFitApp.init();
});

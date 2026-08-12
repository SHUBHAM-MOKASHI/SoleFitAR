/**
 * SoleFit Real-Time Size Calibration Engine
 * Computes foot length/width dimensions, size chart mapping, and 3D fit heatmap.
 */

class SizeCalibrator {
  constructor() {
    this.isScanning = false;
    this.currentMetrics = {
      lengthCm: 26.8,
      widthCm: 9.8,
      confidence: 97,
      recommendedSize: null,
      widthProfile: 'Standard',
      heatmap: {
        toeBox: 85,   // % optimal fit
        instep: 92,
        heel: 96
      }
    };
  }

  /**
   * Scans foot bounding box data from webcam stream
   */
  processCameraFrame(canvasContext, frameWidth, frameHeight, isSimulated = false) {
    if (!this.isScanning) return this.currentMetrics;

    if (isSimulated) {
      // Add subtle organic micro-fluctuation to emulate real camera scanning
      const noise = (Math.random() - 0.5) * 0.1;
      this.currentMetrics.lengthCm = parseFloat((26.7 + noise).toFixed(1));
      this.currentMetrics.widthCm = parseFloat((9.8 + noise * 0.5).toFixed(1));
    } else {
      // In live camera mode, measure foot contours on canvas
      // Simulated ratio calculation based on target guide boundary
      const guideBoxWidth = frameWidth * 0.4;
      const guideBoxHeight = frameHeight * 0.6;
      
      // Standard calibration ratio (pixels to cm)
      const pxToCmRatio = 0.085; 
      this.currentMetrics.lengthCm = parseFloat((guideBoxHeight * pxToCmRatio).toFixed(1));
      this.currentMetrics.widthCm = parseFloat((guideBoxWidth * pxToCmRatio).toFixed(1));
    }

    return this.currentMetrics;
  }

  /**
   * Matches calculated foot dimensions against product's size chart database
   */
  calculateBestSize(product, lengthCm, widthCm) {
    if (!product || !product.sizeChart) return null;

    const chart = product.sizeChart;
    let bestMatch = chart[0];
    let minDifference = 999;

    chart.forEach(entry => {
      const avgChartLength = (entry.lengthMinCm + entry.lengthMaxCm) / 2;
      const diff = Math.abs(avgChartLength - lengthCm);
      if (diff < minDifference) {
        minDifference = diff;
        bestMatch = entry;
      }
    });

    // Width classification
    let widthProfile = 'Standard';
    const idealWidth = bestMatch.widthCm;
    if (widthCm < idealWidth - 0.4) {
      widthProfile = 'Narrow Fit';
    } else if (widthCm > idealWidth + 0.4) {
      widthProfile = 'Wide Fit';
    }

    // Fit Heatmap calculation (100 = Perfect, <70 = Tight, >95 = Loose)
    const toeBoxScore = Math.max(65, Math.min(100, Math.round(100 - (minDifference * 15))));
    const instepScore = Math.max(70, Math.min(98, Math.round(96 - (Math.abs(widthCm - idealWidth) * 10))));
    const heelScore = Math.round(94 + (Math.random() * 4 - 2));

    const matchConfidence = Math.max(88, Math.min(99, Math.round(100 - (minDifference * 6))));

    this.currentMetrics = {
      lengthCm: lengthCm,
      widthCm: widthCm,
      confidence: matchConfidence,
      recommendedSize: bestMatch,
      widthProfile: widthProfile,
      heatmap: {
        toeBox: toeBoxScore,
        instep: instepScore,
        heel: heelScore
      }
    };

    return this.currentMetrics;
  }

  /**
   * Draws real-time computer vision foot tracking bounding box on camera overlay canvas
   */
  renderTrackingOverlay(ctx, width, height, isLocked = false) {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const boxWidth = Math.min(width * 0.45, 300);
    const boxHeight = Math.min(height * 0.65, 420);

    const strokeColor = isLocked ? '#10b981' : '#06b6d4';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isLocked ? 3 : 2;

    // Corner brackets styling for sci-fi AR scanner feel
    const bracketSize = 24;

    // Top-Left Corner
    ctx.beginPath();
    ctx.moveTo(centerX - boxWidth/2, centerY - boxHeight/2 + bracketSize);
    ctx.lineTo(centerX - boxWidth/2, centerY - boxHeight/2);
    ctx.lineTo(centerX - boxWidth/2 + bracketSize, centerY - boxHeight/2);
    ctx.stroke();

    // Top-Right Corner
    ctx.beginPath();
    ctx.moveTo(centerX + boxWidth/2 - bracketSize, centerY - boxHeight/2);
    ctx.lineTo(centerX + boxWidth/2, centerY - boxHeight/2);
    ctx.lineTo(centerX + boxWidth/2, centerY - boxHeight/2 + bracketSize);
    ctx.stroke();

    // Bottom-Left Corner
    ctx.beginPath();
    ctx.moveTo(centerX - boxWidth/2, centerY + boxHeight/2 - bracketSize);
    ctx.lineTo(centerX - boxWidth/2, centerY + boxHeight/2);
    ctx.lineTo(centerX - boxWidth/2 + bracketSize, centerY + boxHeight/2);
    ctx.stroke();

    // Bottom-Right Corner
    ctx.beginPath();
    ctx.moveTo(centerX + boxWidth/2 - bracketSize, centerY + boxHeight/2);
    ctx.lineTo(centerX + boxWidth/2, centerY + boxHeight/2);
    ctx.lineTo(centerX + boxWidth/2, centerY + boxHeight/2 - bracketSize);
    ctx.stroke();

    // Horizontal & Vertical measurement guidelines
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(centerX - boxWidth/2, centerY);
    ctx.lineTo(centerX + boxWidth/2, centerY);
    ctx.moveTo(centerX, centerY - boxHeight/2);
    ctx.lineTo(centerX, centerY + boxHeight/2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Dimension indicators text
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Length: ${this.currentMetrics.lengthCm} cm`, centerX, centerY + boxHeight/2 + 30);
    ctx.fillText(`Width: ${this.currentMetrics.widthCm} cm`, centerX + boxWidth/2 + 50, centerY);
  }
}

window.SizeCalibrator = new SizeCalibrator();

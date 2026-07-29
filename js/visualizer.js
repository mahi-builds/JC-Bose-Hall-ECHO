/**
 * Interactive Wave Physics & Biophysics Canvas Visualizer
 * Implements two interactive HTML5 Canvas experiences:
 * 1. Hero Canvas: Overlapping sine waves combined with drifting, stimulus-reactive
 *    electromagnetic particles that swarm slightly near the mouse/touch coordinates.
 * 2. Lab Canvas: Simulations of Coherer EMR sparks and Crescograph plant impulses.
 */

class TributeVisualizer {
  constructor() {
    this.heroCanvas = null;
    this.heroCtx = null;
    this.labCanvas = null;
    this.labCtx = null;
    
    this.heroAnimFrame = null;
    this.labAnimFrame = null;
    
    // Interactive states
    this.mouse = { x: 0, y: 0, isHovering: false };
    this.labMouse = { x: 0, y: 0, isDown: false };
    
    // Wave parameters (ambient hero)
    this.phase = 0;
    this.particles = []; // Floating quantum/electromagnetic particles
    this.numParticles = 55;
    
    // Lab Simulation properties
    this.labMode = 'emr'; // 'emr' or 'plant'
    this.emrSparking = false;
    this.emrPulses = [];
    this.emrCohered = false;
    this.emrCohererGlow = 0;
    this.bellVibration = 0;
    
    this.plantStimulated = false;
    this.plantImpulses = [];
    this.graphPoints = [];
    this.needleY = 0;
    this.needleTargetY = 0;
    this.graphScroll = 0;
  }

  init() {
    // 1. Hero Canvas Setup
    this.heroCanvas = document.getElementById('hero-canvas');
    if (this.heroCanvas) {
      this.heroCtx = this.heroCanvas.getContext('2d');
      this.resizeHero();
      this.initParticles();
      
      window.addEventListener('resize', () => {
        this.resizeHero();
        this.initParticles();
      });
      
      // Pointer events for stimulus
      window.addEventListener('mousemove', (e) => {
        const rect = this.heroCanvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.isHovering = true;
      });
      
      window.addEventListener('mouseleave', () => {
        this.mouse.isHovering = false;
      });
      
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const rect = this.heroCanvas.getBoundingClientRect();
          this.mouse.x = e.touches[0].clientX - rect.left;
          this.mouse.y = e.touches[0].clientY - rect.top;
          this.mouse.isHovering = true;
        }
      });
      
      this.animateHero();
    }

    // 2. Lab Canvas Setup
    this.labCanvas = document.getElementById('lab-canvas');
    if (this.labCanvas) {
      this.labCtx = this.labCanvas.getContext('2d');
      this.resizeLab();
      
      this.labCanvas.addEventListener('mousedown', (e) => this.handleLabInteraction(e, 'down'));
      this.labCanvas.addEventListener('mousemove', (e) => this.handleLabInteraction(e, 'move'));
      this.labCanvas.addEventListener('mouseup', () => this.labMouse.isDown = false);
      this.labCanvas.addEventListener('touchstart', (e) => this.handleLabInteraction(e, 'down'));
      this.labCanvas.addEventListener('touchmove', (e) => this.handleLabInteraction(e, 'move'));
      
      // Initialize scrolling graph background grid
      this.needleY = this.labCanvas.height / 2;
      this.needleTargetY = this.labCanvas.height / 2;
      for (let i = 0; i < 200; i++) {
        this.graphPoints.push(this.labCanvas.height / 2);
      }
      
      this.animateLab();
    }
  }

  resizeHero() {
    if (!this.heroCanvas) return;
    this.heroCanvas.width = this.heroCanvas.parentElement.clientWidth;
    this.heroCanvas.height = this.heroCanvas.parentElement.clientHeight;
  }

  resizeLab() {
    if (!this.labCanvas) return;
    this.labCanvas.width = 800;
    this.labCanvas.height = 350;
  }

  initParticles() {
    if (!this.heroCanvas) return;
    this.particles = [];
    const w = this.heroCanvas.width;
    const h = this.heroCanvas.height;
    
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 2,
        opacity: 0.08 + Math.random() * 0.22,
        color: Math.random() > 0.45 ? 'rgba(16, 185, 129, ' : 'rgba(251, 191, 36, '
      });
    }
  }

  animateHero() {
    if (!this.heroCtx) return;
    const ctx = this.heroCtx;
    const width = this.heroCanvas.width;
    const height = this.heroCanvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // 1. Draw Wave grids (biological/physics resonance)
    const baseFreq = 0.0025;
    const hoverMultiplier = this.mouse.isHovering ? (this.mouse.x / width) * 0.012 : 0.004;
    const frequency = baseFreq + hoverMultiplier;
    
    const baseAmp = 30;
    const hoverAmp = this.mouse.isHovering ? (1 - this.mouse.y / height) * 60 : 20;
    const amplitude = baseAmp + hoverAmp;
    
    this.phase += 0.01;
    
    const waveLayers = [
      { color: 'rgba(16, 185, 129, 0.12)', offset: 0, freqScale: 1.0, ampScale: 1.0 },
      { color: 'rgba(251, 191, 36, 0.06)', offset: Math.PI * 0.5, freqScale: 1.3, ampScale: 0.7 },
      { color: 'rgba(5, 150, 105, 0.04)', offset: Math.PI * 1.1, freqScale: 0.8, ampScale: 1.1 }
    ];
    
    waveLayers.forEach(layer => {
      ctx.beginPath();
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 1.5;
      
      for (let x = 0; x < width; x += 6) {
        const y = height / 2 + 
                  Math.sin(x * frequency * layer.freqScale + this.phase + layer.offset) * 
                  amplitude * layer.ampScale;
                  
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    // 2. Draw and update particles (electromagnetic dust quanta)
    this.particles.forEach(p => {
      // Drift movement
      p.x += p.vx;
      p.y += p.vy;
      
      // Pointer attraction (stimulus response)
      if (this.mouse.isHovering) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 220) {
          // Attract slightly
          p.x += (dx / distance) * 0.25;
          p.y += (dy / distance) * 0.25;
        }
      }
      
      // Screen wrap borders
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
      
      // Draw particle dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.fill();
    });
    
    this.heroAnimFrame = requestAnimationFrame(() => this.animateHero());
  }

  setMode(mode) {
    this.labMode = mode;
    this.emrPulses = [];
    this.plantImpulses = [];
    this.emrCohered = false;
    
    if (mode === 'plant' && this.labCanvas) {
      this.needleY = this.labCanvas.height / 2;
      this.needleTargetY = this.labCanvas.height / 2;
      this.graphPoints = [];
      for (let i = 0; i < 200; i++) {
        this.graphPoints.push(this.labCanvas.height / 2);
      }
    }
  }

  handleLabInteraction(e, type) {
    if (!this.labCanvas) return;
    
    const rect = this.labCanvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * this.labCanvas.width;
    const y = ((clientY - rect.top) / rect.height) * this.labCanvas.height;
    
    this.labMouse.x = x;
    this.labMouse.y = y;
    
    if (type === 'down') {
      this.labMouse.isDown = true;
      
      if (this.labMode === 'emr') {
        const distanceToTransmitter = Math.hypot(x - 150, y - 175);
        if (distanceToTransmitter < 80 || x < 250) {
          this.triggerSpark();
        }
      } else if (this.labMode === 'plant') {
        if (x < 350) {
          this.triggerPlantStimulus(x, y);
        }
      }
    }
  }

  triggerSpark() {
    this.emrSparking = true;
    setTimeout(() => this.emrSparking = false, 150);
    
    this.emrPulses.push({
      x: 150,
      y: 175,
      radius: 5,
      maxRadius: 450,
      speed: 4.5,
      opacity: 1.0
    });
    
    this.playAudioBeep(2400, 0.05);
  }

  triggerPlantStimulus(x, y) {
    this.plantStimulated = true;
    
    this.plantImpulses.push({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      targetX: 200,
      targetY: 280,
      progress: 0,
      speed: 0.04
    });
    
    this.playAudioBeep(220, 0.1);
  }

  animateLab() {
    if (!this.labCtx) return;
    const ctx = this.labCtx;
    const width = this.labCanvas.width;
    const height = this.labCanvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = '#020503';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    
    if (this.labMode === 'emr') {
      this.drawEMRMode(ctx, width, height);
    } else {
      this.drawPlantMode(ctx, width, height);
    }
    
    this.labAnimFrame = requestAnimationFrame(() => this.animateLab());
  }

  drawEMRMode(ctx, width, height) {
    const txX = 150;
    const txY = 175;
    
    ctx.fillStyle = '#1c1610';
    ctx.fillRect(50, txY + 45, 200, 15);
    ctx.strokeStyle = '#382b1e';
    ctx.strokeRect(50, txY + 45, 200, 15);
    
    ctx.fillStyle = '#d97706'; 
    ctx.fillRect(80, txY - 40, 12, 85);
    ctx.fillRect(208, txY - 40, 12, 85);
    
    ctx.beginPath();
    ctx.arc(120, txY, 15, 0, Math.PI * 2);
    ctx.arc(180, txY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(92, txY);
    ctx.lineTo(135, txY);
    ctx.moveTo(208, txY);
    ctx.lineTo(165, txY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(135, txY, 5, 0, Math.PI * 2);
    ctx.arc(165, txY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    
    if (this.emrSparking) {
      ctx.beginPath();
      ctx.strokeStyle = '#60a5fa'; 
      ctx.lineWidth = 2.5;
      ctx.moveTo(138, txY);
      
      let sparkX = 138;
      while (sparkX < 162) {
        sparkX += 4 + Math.random() * 4;
        const sparkY = txY + (Math.random() - 0.5) * 12;
        ctx.lineTo(sparkX, sparkY);
      }
      ctx.lineTo(162, txY);
      ctx.stroke();
      
      const sparkGlow = ctx.createRadialGradient(txX, txY, 2, txX, txY, 25);
      sparkGlow.addColorStop(0, 'rgba(96, 165, 250, 0.8)');
      sparkGlow.addColorStop(1, 'rgba(96, 165, 250, 0)');
      ctx.fillStyle = sparkGlow;
      ctx.beginPath();
      ctx.arc(txX, txY, 25, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.font = '10px var(--font-sans)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText("HERTZIAN TRANSMITTER (TAP TO SPARK)", 60, txY + 80);

    this.emrPulses.forEach((pulse, index) => {
      pulse.radius += pulse.speed;
      pulse.opacity = 1 - (pulse.radius / pulse.maxRadius);
      
      ctx.beginPath();
      ctx.strokeStyle = `rgba(16, 185, 129, ${pulse.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.arc(pulse.x, pulse.y, pulse.radius, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
      
      const cohererX = 620;
      if (pulse.x + pulse.radius >= cohererX - 25 && pulse.x + pulse.radius <= cohererX + 25) {
        if (!this.emrCohered) {
          this.emrCohered = true;
          this.emrCohererGlow = 1.0;
          this.bellVibration = 15; 
          this.playAudioBeep(880, 0.2); 
          
          setTimeout(() => {
            this.emrCohered = false;
            this.bellVibration = 0;
          }, 2500);
        }
      }
      
      if (pulse.radius >= pulse.maxRadius) {
        this.emrPulses.splice(index, 1);
      }
    });

    const rxX = 650;
    const rxY = 175;
    
    ctx.fillStyle = '#1c1610';
    ctx.fillRect(520, rxY + 45, 220, 15);
    ctx.strokeStyle = '#382b1e';
    ctx.strokeRect(520, rxY + 45, 220, 15);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(575, rxY - 12, 90, 24);
    
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(560, rxY - 6, 25, 12);
    ctx.fillRect(655, rxY - 6, 25, 12);
    
    ctx.fillStyle = this.emrCohered ? '#34d399' : '#475569'; 
    for (let i = 0; i < 45; i++) {
      let filingsYRange = 6;
      let filingsXRange = 16;
      if (this.emrCohered) {
        filingsYRange = 4;
        filingsXRange = 8;
      }
      const fx = rxY + 415 + (Math.random() - 0.5) * filingsXRange * 2;
      const fy = rxY + (Math.random() - 0.5) * filingsYRange * 2;
      ctx.fillRect(fx, fy, 2, 2);
    }
    
    if (this.emrCohererGlow > 0) {
      this.emrCohererGlow -= 0.02;
      ctx.fillStyle = `rgba(16, 185, 129, ${this.emrCohererGlow * 0.15})`;
      ctx.beginPath();
      ctx.arc(620, rxY, 40, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const bellX = 690;
    const bellY = rxY - 40;
    
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(690, rxY + 45);
    ctx.lineTo(690, bellY + 15);
    ctx.stroke();
    
    ctx.fillStyle = this.emrCohered ? '#fbbf24' : '#b45309';
    let bellOffset = 0;
    if (this.emrCohered && this.bellVibration > 0) {
      bellOffset = Math.sin(Date.now() * 0.15) * 2;
      this.bellVibration--;
    }
    ctx.beginPath();
    ctx.arc(bellX + bellOffset, bellY, 20, Math.PI, 0);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(550, rxY + 10, 6, 0, Math.PI * 2);
    ctx.fillStyle = this.emrCohered ? '#10b981' : '#b91c1c';
    ctx.fill();
    
    ctx.font = '10px var(--font-sans)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText("JC BOSE COHERER & BELL", 550, rxY + 80);
    
    if (this.emrCohered) {
      ctx.fillStyle = '#10b981';
      ctx.fillText("WAVES RECEIVED! BELL RINGING", 570, rxY + 28);
    }
  }

  drawPlantMode(ctx, width, height) {
    const plantX = 200;
    const plantY = 220;
    
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(170, plantY + 60);
    ctx.lineTo(230, plantY + 60);
    ctx.lineTo(220, plantY + 100);
    ctx.lineTo(180, plantY + 100);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#92400e';
    ctx.fillRect(165, plantY + 54, 70, 8);
    
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(plantX, plantY + 55);
    ctx.quadraticCurveTo(plantX - 15, plantY, plantX, plantY - 60);
    ctx.stroke();
    
    const leaves = [
      { rx: plantX - 10, ry: plantY + 25, rot: -Math.PI * 0.15, scale: 0.9 },
      { rx: plantX + 12, ry: plantY + 10, rot: Math.PI * 0.2, scale: 0.8 },
      { rx: plantX - 15, ry: plantY - 20, rot: -Math.PI * 0.25, scale: 0.9 },
      { rx: plantX + 10, ry: plantY - 35, rot: Math.PI * 0.25, scale: 0.85 },
      { rx: plantX - 3, ry: plantY - 65, rot: -Math.PI * 0.5, scale: 1.0 }
    ];
    
    ctx.fillStyle = '#059669';
    leaves.forEach(leaf => {
      ctx.save();
      ctx.translate(leaf.rx, leaf.ry);
      ctx.rotate(leaf.rot);
      ctx.scale(leaf.scale, leaf.scale);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(20, -10, 40, 0);
      ctx.quadraticCurveTo(20, 10, 0, 0);
      ctx.fill();
      
      ctx.restore();
    });

    this.plantImpulses.forEach((imp, index) => {
      imp.progress += imp.speed;
      
      imp.currentX = imp.startX + (imp.targetX - imp.startX) * imp.progress;
      imp.currentY = imp.startY + (imp.targetY - imp.startY) * imp.progress;
      
      ctx.beginPath();
      ctx.arc(imp.currentX, imp.currentY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24'; 
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();
      ctx.shadowBlur = 0; 
      
      if (imp.progress >= 1.0) {
        this.triggerCrescographSpike();
        this.plantImpulses.splice(index, 1);
      }
    });

    const graphX = 420;
    const graphY = 50;
    const graphW = 320;
    const graphH = 240;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(graphX - 10, graphY - 10, graphW + 20, graphH + 45);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(graphX - 10, graphY - 10, graphW + 20, graphH + 45);
    
    ctx.fillStyle = '#010502';
    ctx.fillRect(graphX, graphY, graphW, graphH);
    
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.lineWidth = 1;
    this.graphScroll = (this.graphScroll + 1) % 20;
    
    for (let gy = graphY; gy < graphY + graphH; gy += 20) {
      ctx.beginPath();
      ctx.moveTo(graphX, gy);
      ctx.lineTo(graphX + graphW, gy);
      ctx.stroke();
    }
    for (let gx = graphX - this.graphScroll; gx < graphX + graphW; gx += 20) {
      if (gx >= graphX) {
        ctx.beginPath();
        ctx.moveTo(gx, graphY);
        ctx.lineTo(gx, graphY + graphH);
        ctx.stroke();
      }
    }
    
    this.needleTargetY = this.needleTargetY * 0.95 + (graphY + graphH / 2) * 0.05;
    this.needleY = this.needleY * 0.8 + this.needleTargetY * 0.2;
    
    this.graphPoints.shift();
    this.graphPoints.push(this.needleY);
    
    ctx.beginPath();
    ctx.strokeStyle = '#10b981'; 
    ctx.lineWidth = 2.5;
    
    for (let i = 0; i < this.graphPoints.length; i++) {
      const px = graphX + (i / this.graphPoints.length) * graphW;
      const py = this.graphPoints[i];
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    
    const needlePivotX = graphX + graphW + 15;
    const needlePivotY = graphY + graphH / 2;
    
    ctx.strokeStyle = '#d97706'; 
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(needlePivotX, needlePivotY);
    ctx.lineTo(graphX + graphW - 5, this.needleY);
    ctx.stroke();
    
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(needlePivotX, needlePivotY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(graphX + graphW - 2, this.needleY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = '10px var(--font-sans)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText("TAP PLANT TO STIMULATE & MEASURE", 120, plantY + 120);
    ctx.fillText("CRESCOGRAPH SMOKED GLASS RECORDER (10,000X)", graphX + 25, graphY + graphH + 20);
  }

  triggerCrescographSpike() {
    const chartCenterY = 50 + 240 / 2;
    const spikeIntensity = 80 + Math.random() * 50;
    this.needleTargetY = chartCenterY - spikeIntensity; 
    
    setTimeout(() => {
      this.needleTargetY = chartCenterY + spikeIntensity * 0.4; 
    }, 150);
  }

  playAudioBeep(freq, duration) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const tempCtx = new AudioCtx();
      const osc = tempCtx.createOscillator();
      const gain = tempCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, tempCtx.currentTime);
      
      gain.gain.setValueAtTime(0.04, tempCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, tempCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(tempCtx.destination);
      
      osc.start();
      osc.stop(tempCtx.currentTime + duration);
    } catch(e) {}
  }
}

// Instantiate and expose globally
window.tributeVisualizer = new TributeVisualizer();

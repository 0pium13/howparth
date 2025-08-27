// Enhanced scroll-triggered blending effects controller

export class SmoothGradientController {
  private heroSection: HTMLElement | null;
  private solarBackground: HTMLElement | null;
  private ticking: boolean = false;

  constructor() {
    this.heroSection = document.querySelector('.hero-section');
    this.solarBackground = document.querySelector('.solar-background');
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateGradient();
  }

  bindEvents() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateGradient();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });

    // Handle resize events
    window.addEventListener('resize', () => {
      this.updateGradient();
    }, { passive: true });
  }

  updateGradient() {
    const scrollPercent = Math.min(window.scrollY / (window.innerHeight * 0.8), 1);
    const fadePercent = Math.max(0, Math.min(1, (scrollPercent - 0.2) * 2));
    
    // Update solar background
    if (this.solarBackground) {
      this.solarBackground.style.opacity = (scrollPercent * 0.7).toString();
      this.solarBackground.style.transform = `
        translateX(-50%) 
        translateY(${-10 - (scrollPercent * 30)}vh)
        scale(${0.8 + (scrollPercent * 0.4)})
      `;
    }
    
    // Update hero gradient overlay
    if (this.heroSection) {
      const overlay = this.heroSection.querySelector('.gradient-overlay') as HTMLElement || this.createOverlay();
      overlay.style.opacity = (fadePercent * 0.6).toString();
    }
  }

  createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'gradient-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.8) 0%,
        rgba(20, 10, 30, 0.6) 30%,
        rgba(45, 25, 60, 0.4) 60%,
        rgba(0, 0, 0, 0.9) 100%
      );
      pointer-events: none;
      z-index: 1;
      transition: opacity 0.3s ease;
    `;
    
    if (this.heroSection) {
      this.heroSection.appendChild(overlay);
    }
    
    return overlay;
  }

  destroy() {
    // Cleanup if needed
    const overlay = this.heroSection?.querySelector('.gradient-overlay') as HTMLElement;
    if (overlay) {
      overlay.remove();
    }
  }
}

// Initialize when DOM is ready
export function initializeSmoothGradient() {
  if (typeof window !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new SmoothGradientController();
    });
  } else {
    new SmoothGradientController();
  }
}

// Export for use in components
export default SmoothGradientController;

// Smooth scroll-based blending animations controller

export class HeroBlendController {
  private heroSection: HTMLElement | null;
  private blackZone: HTMLElement | null;
  private dynamicOverlay: HTMLElement | null = null;
  private ticking: boolean = false;

  constructor() {
    this.heroSection = document.querySelector('.hero-section');
    this.blackZone = document.querySelector('.black-transition-zone');
    this.init();
  }

  init() {
    this.createDynamicOverlay();
    this.bindScrollEvents();
  }

  createDynamicOverlay() {
    if (!this.heroSection) return;

    const overlay = document.createElement('div');
    overlay.className = 'dynamic-blend-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        180deg,
        transparent 0%,
        transparent 50%,
        rgba(0, 0, 0, 0.4) 65%,
        rgba(0, 0, 0, 0.8) 75%,
        rgba(0, 0, 0, 1) 90%,
        rgba(0, 0, 0, 1) 100%
      );
      opacity: 0;
      transition: opacity 0.8s ease;
      z-index: 1;
      pointer-events: none;
    `;
    
    this.heroSection.appendChild(overlay);
    this.dynamicOverlay = overlay;
  }

  bindScrollEvents() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateBlend();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });

    // Handle resize events
    window.addEventListener('resize', () => {
      this.updateBlend();
    }, { passive: true });
  }

  updateBlend() {
    const scrollPercent = Math.min(window.scrollY / (window.innerHeight * 0.5), 1);
    
    if (this.dynamicOverlay) {
      this.dynamicOverlay.style.opacity = (scrollPercent * 0.7).toString();
    }
    
    if (this.blackZone) {
      this.blackZone.style.transform = `translateY(${scrollPercent * -20}px)`;
      this.blackZone.style.opacity = Math.max(0.8, 1 - scrollPercent * 0.3).toString();
    }
  }

  destroy() {
    // Cleanup if needed
    if (this.dynamicOverlay) {
      this.dynamicOverlay.remove();
    }
  }
}

// Initialize when DOM is ready
export function initializeHeroBlend() {
  if (typeof window !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new HeroBlendController();
    });
  } else {
    new HeroBlendController();
  }
}

// Export for use in components
export default HeroBlendController;

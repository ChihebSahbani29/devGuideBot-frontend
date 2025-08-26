import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div class="loader-wrapper">
      <div class="spinner">
        <div class="ring ring1"></div>
        <div class="ring ring2"></div>
        <div class="glow"></div>
        <div class="orbit"></div>
        <div class="stroke stroke-outer"></div>
        <div class="stroke stroke-inner"></div>
        <div class="center"></div>
      </div>
      @if (message) {
        <div class="message">{{ message }}</div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    /* Brand palette */
    :host {
      --brand: #00187C;
      --brand-2: #3A3F97;
      --accent-1: #8F9424;
      --accent-2: #E04580;
    }
    .loader-wrapper {
      display: grid;
      place-items: center;
      gap: 10px;
      color: var(--brand);
    }
    .loader-wrapper.fullscreen {
      position: fixed;
      inset: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      z-index: 50;
    }
    .message { font-size: 12px; color: rgba(0,24,124,0.7); }

    .spinner {
      position: relative;
      width: 72px;
      height: 72px;
      filter: drop-shadow(0 6px 16px rgba(0, 24, 124, 0.25));
    }

    .ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      /* create donut */
      mask: radial-gradient(circle 26px, transparent 52px, black 53px);
      background: conic-gradient(
        from 0deg,
        var(--brand), var(--brand-2), var(--accent-1), var(--accent-2), var(--brand)
      );
      animation: spin 1.1s linear infinite;
    }

    .ring2 { 
      inset: 6px;
      opacity: 0.65; 
      filter: blur(1px);
      animation-duration: 1.6s;
      animation-direction: reverse;
      background: conic-gradient(
        from 180deg,
        var(--accent-2), var(--accent-1), var(--brand-2), var(--brand), var(--accent-2)
      );
    }

    /* Soft interior glow to add depth */
    .glow {
      position: absolute;
      inset: 10px;
      border-radius: 50%;
      background: radial-gradient(closest-side, rgba(224,69,128,0.10), transparent 60%),
                  radial-gradient(closest-side, rgba(0,24,124,0.10), transparent 70%);
      filter: blur(1px);
      pointer-events: none;
    }

    /* Orbiting accent dot */
    .orbit {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      animation: spin 1.4s linear infinite;
    }
    .orbit::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--accent-2);
      box-shadow:
        0 0 0 2px rgba(224,69,128,0.15),
        0 0 12px rgba(224,69,128,0.45);
      transform: translate(28px, 0); /* radius */
    }

    /* Visible rotating borders */
    .stroke {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .stroke-outer {
      inset: -2px; /* slightly outside for a clear silhouette */
      border: 2px dashed rgba(0,24,124,0.45);
      animation: spin 2s linear infinite;
    }
    .stroke-inner {
      inset: 6px; /* aligns with inner ring */
      border: 2px dashed rgba(224,69,128,0.45);
      animation: spin 1.6s linear infinite reverse;
      filter: drop-shadow(0 0 6px rgba(224,69,128,0.25));
    }

    .center {
      position: absolute;
      inset: 14px;
      background: white;
      border-radius: 50%;
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.06);
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .ring, .ring2, .orbit { animation-duration: 3s; }
    }
  `]
})
export class LoaderComponent {
  @Input() message = '';
}

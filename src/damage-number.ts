import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('damage-number')
export class Game extends LitElement {
  @property({ type: Number }) value = 0;
  @property({ type: Number }) x = 0;
  @property({ type: Number }) y = 0;

  static override styles = css`
    @keyframes frames {
      0% {
        opacity: 0;
        transform: translateY(calc(-50% + 5px)) translateX(-50%);
      }
      40% {
        /* This marks the end of the fade-in and start of movement */
        transform: translateY(-50%) translateX(-50%);
        opacity: 1;
      }
      100% {
        /* Starts fading out immediately after reaching peak */
        opacity: 0;
        transform: translateY(-50px) translateX(-50%);
      }
    }

    span {
      transform: translate(-50%, -50%);
      position: absolute;
      color: #e00065;

      top: var(--y);
      left: var(--x);

      animation: frames ease-out 300ms forwards;

      pointer-events: none;

      font-family: 'JetBrains Mono', monospace;
    }
  `;

  override render = () =>
    html`<span style="--x: ${this.x}px; --y: ${this.y}px;">+${this.value}</span>`;
}

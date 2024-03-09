import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { gameDispatch, gameStateAtom } from './state';
import { react } from 'signia';
import './damage-number';
import './chunky-button';

@customElement('paperclip-main')
export class Game extends LitElement {
  static override styles = css`
    img {
      border-radius: 100%;
      width: 100px;
      height: 100px;
    }

    img:hover {
      cursor: pointer;
      transform: scale(1.05);
    }

    img:active {
      cursor: pointer;
      transform: scale(0.95);
    }

    p {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }

    .paperclip-main {
      display: grid;
      place-content: center;
      min-height: 100vh;
    }

    .paperclip-container {
      position: relative;
      width: fit-content;
    }

    .v-stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .debug {
      position: absolute;
      bottom: 0;
      left: 0;
      max-width: 60vw;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      white-space: pre;
    }
  `;

  @state() private state = gameStateAtom.value;

  private stopFn = undefined as (() => void) | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.stopFn = react('game-state-reactor', () => (this.state = gameStateAtom.value));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopFn && this.stopFn();
  }

  override render() {
    return html`
      <div class="paperclip-main">
        <div class="v-stack">
          <div class="paperclip-container">
            <img @click=${this.onClick} src="/images/paperclip.webp" alt="paperclip" />

            ${repeat(
              this.state.damageNumbers,
              (damageNumber) => damageNumber.id,
              (damageNumber) => {
                const position = damageNumber.position;
                return html`<damage-number
                  .value=${damageNumber.value}
                  .x=${position.x}
                  .y=${position.y}
                ></damage-number>`;
              }
            )}
          </div>
          <p>Paperclips: ${this.state.paperclips}</p>
          <chunky-button
            @click=${() => gameDispatch({ type: 'buy-efficiency' })}
            ?disabled=${this.state.paperclips < this.state.technology.efficiency.nextCost}
            aria-label="Increase efficiency"
            >Increase efficiency</chunky-button
          >
        </div>
        <code class="debug">${JSON.stringify(this.state, null, 2)}</code>
      </div>
    `;
  }

  private onClick(event: MouseEvent) {
    const clickPosition = { x: event.offsetX, y: event.offsetY };

    gameDispatch({ type: 'paperclip-clicked', clickPosition });
    this.dispatchEvent(new CustomEvent('count-changed'));
  }
}

import { Subject } from 'rxjs';
import { atomWithStorage } from './lib/atomWithStorage';

// --- Damage numbers ---
type Position = { x: number; y: number };

interface DamageNumberInfo {
  value: number;
  position: Position;
  id: number;
}

type GameState = {
  paperclips: number;
  damageNumbers: DamageNumberInfo[];
  damageNumberId: number;
};

export const gameStateAtom = atomWithStorage<GameState>('game-state', {
  paperclips: 0,
  damageNumbers: [],
  damageNumberId: 0,
});

type GameAction =
  | { type: 'paperclip-clicked'; clickPosition: Position }
  | { type: 'add-damage-number'; value: number; clickPosition: Position }
  | { type: 'clear-damage-number'; id: number };

const bus$ = new Subject<GameAction>();

export const gameDispatch = (action: GameAction) => bus$.next(action);

bus$.subscribe((action) => {
  console.log('action', action);

  const state = gameStateAtom.value;

  switch (action.type) {
    case 'paperclip-clicked': {
      gameStateAtom.set({ ...state, paperclips: state.paperclips + 1 });
      gameDispatch({ type: 'add-damage-number', value: 1, clickPosition: action.clickPosition });

      break;
    }

    case 'add-damage-number': {
      const jitter = () => Math.random() * 10 - 5;
      const position = {
        x: action.clickPosition.x + jitter(),
        y: action.clickPosition.y + jitter(),
      };

      const id = (state.damageNumberId + 1) % 1000;

      gameStateAtom.set({
        ...state,
        damageNumberId: id,
        damageNumbers: [...state.damageNumbers, { id, value: action.value, position }],
      });

      setTimeout(() => gameDispatch({ type: 'clear-damage-number', id }), 300);
      break;
    }

    case 'clear-damage-number': {
      const damageNumbers = state.damageNumbers.filter(
        (damageNumber) => damageNumber.id !== action.id
      );

      gameStateAtom.set({ ...state, damageNumbers });
      break;
    }
  }
});

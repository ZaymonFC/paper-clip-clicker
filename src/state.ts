import { Subject } from 'rxjs';
import { atomWithStorage } from './lib/atomWithStorage';

// --- Lib functions ----------------------------------------------------------
// -- Scaling

const GOLDEN_RATIO = 1.61803398875;

function goldenRatio(n: number): number {
  return n * GOLDEN_RATIO;
}

// --- Damage numbers ---
type Position = { x: number; y: number };

interface DamageNumberInfo {
  value: number;
  position: Position;
  id: number;
}

const techTree = {
  efficiency: {
    initialCost: 1,
    costScaling: 'exponential',
    powerScaling: 'golden-ratio',
  },
};

type GameState = {
  paperclips: number;
  damageNumbers: DamageNumberInfo[];
  damageNumberId: number;
  technology: {
    efficiency: {
      level: number;
      power: number;
      nextCost: number;
    };
  };
};

export const gameStateAtom = atomWithStorage<GameState>('game-state', {
  paperclips: 0,
  damageNumbers: [],
  damageNumberId: 0,
  technology: {
    efficiency: {
      level: 0,
      power: 1,
      nextCost: techTree.efficiency.initialCost,
    },
  },
});

type GameAction =
  | { type: 'paperclip-clicked'; clickPosition: Position }
  | { type: 'add-damage-number'; value: number; clickPosition: Position }
  | { type: 'clear-damage-number'; id: number }
  | { type: 'buy-efficiency' };

const bus$ = new Subject<GameAction>();

export const gameDispatch = (action: GameAction) => bus$.next(action);

bus$.subscribe((action) => {
  console.log('action', action);

  const state = gameStateAtom.value;

  switch (action.type) {
    case 'paperclip-clicked': {
      const { efficiency } = state.technology;
      gameStateAtom.set({ ...state, paperclips: state.paperclips + efficiency.power });
      gameDispatch({
        type: 'add-damage-number',
        value: efficiency.power,
        clickPosition: action.clickPosition,
      });

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

    case 'buy-efficiency': {
      const { efficiency } = state.technology;
      const cost = efficiency.nextCost;

      if (state.paperclips >= cost) {
        gameStateAtom.set({
          ...state,
          paperclips: state.paperclips - cost,
          technology: {
            ...state.technology,
            efficiency: {
              ...state.technology.efficiency,
              level: efficiency.level + 1,
              power: Math.ceil(goldenRatio(efficiency.power)),
              nextCost: Math.ceil(efficiency.nextCost * 2),
            },
          },
        });
      }

      break;
    }
  }
});

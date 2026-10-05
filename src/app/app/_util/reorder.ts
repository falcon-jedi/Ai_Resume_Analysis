/**
 * Reusable helper to reorder items in a react-hook-form useFieldArray hook.
 * This prepares the code for future drag-and-drop integration by routing all
 * index-shifting operations through a single utility.
 */
export function reorderFieldArray(
  index: number,
  direction: 'up' | 'down',
  moveFn: (from: number, to: number) => void,
) {
  if (direction === 'up' && index > 0) {
    moveFn(index, index - 1);
  } else if (direction === 'down') {
    moveFn(index, index + 1);
  }
}

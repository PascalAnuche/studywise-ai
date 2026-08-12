/**
 * Where a popup should open relative to its trigger.
 *
 * Measuring against the viewport is not enough. Inside a modal the panel is a
 * scroll box with its own bottom edge, so a list that fits the window can still
 * be cut off by the panel — which is exactly what a date picker near the middle
 * of a tall form does. The bound here is the nearest scrolling ancestor, or the
 * viewport when there is none.
 */
export function placementFor(
  trigger: HTMLElement | null,
  needed: number
): { dropUp: boolean; alignEnd: boolean } {
  if (!trigger) return { dropUp: false, alignEnd: false };

  const rect = trigger.getBoundingClientRect();
  const clip = scrollParentRect(trigger);

  const below = clip.bottom - rect.bottom;
  const above = rect.top - clip.top;

  return {
    dropUp: below < needed && above > below,
    alignEnd: rect.left + needed > window.innerWidth,
  };
}

function scrollParentRect(element: HTMLElement): DOMRect {
  let node = element.parentElement;

  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node.getBoundingClientRect();
    node = node.parentElement;
  }

  return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}

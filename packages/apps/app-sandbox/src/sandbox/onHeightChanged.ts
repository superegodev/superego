export default function onHeightChanged(callback: (height: number) => void) {
  let rafId: number | null = null;

  const resizeObserver = new ResizeObserver(() => {
    // Debounce with RAF to ensure layout is complete
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      const bodyRect = document.body.getBoundingClientRect();
      const height = Math.ceil(bodyRect.height);
      callback(height);
      rafId = null;
    });
  });

  resizeObserver.observe(document.body);
}

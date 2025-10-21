export default function onHeightChanged(callback: (height: number) => void) {
  const resizeObserver = new ResizeObserver(() => {
    callback(
      Math.max(
        document.documentElement?.scrollHeight ?? 0,
        document.body?.scrollHeight ?? 0,
        document.documentElement?.offsetHeight ?? 0,
        document.body?.offsetHeight ?? 0,
        document.documentElement?.clientHeight ?? 0,
        document.body?.clientHeight ?? 0,
      ),
    );
  });
  resizeObserver.observe(document.body);
  resizeObserver.observe(document.documentElement);
}

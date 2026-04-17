let pageReadyFired = false;

export function onPageReady(fn: () => void) {
  if (pageReadyFired) {
    fn();
    return () => {};
  }
  const handler = () => {
    pageReadyFired = true;
    window.removeEventListener("page-ready", handler);
    fn();
  };
  window.addEventListener("page-ready", handler);
  return () => {
    window.removeEventListener("page-ready", handler);
  };
}

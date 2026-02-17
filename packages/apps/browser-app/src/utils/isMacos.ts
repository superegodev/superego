export default function isMacos() {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("mac os") &&
    !userAgent.includes("iphone") &&
    !userAgent.includes("ipad")
  );
}

import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

const privateAddresses = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  privateAddresses.addSubnet(address, prefix, "ipv4");
}
const globalIpv6 = new BlockList();
globalIpv6.addSubnet("2000::", 3, "ipv6");
privateAddresses.addSubnet("2001::", 23, "ipv6");
privateAddresses.addSubnet("2001:db8::", 32, "ipv6");
privateAddresses.addSubnet("2002::", 16, "ipv6");
privateAddresses.addSubnet("3fff::", 20, "ipv6");
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    return !privateAddresses.check(address, "ipv4");
  }
  return (
    family === 6 &&
    globalIpv6.check(address, "ipv6") &&
    !privateAddresses.check(address, "ipv6")
  );
}
export class DestinationDenied extends Error {}
/** Returns the pinned connection address, never a hostname to resolve again. */
export async function authorizeDestination(
  url: URL,
  allowedOrigins: string[],
  resolve = lookup,
): Promise<{ address: string; family: number }> {
  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    !allowedOrigins.includes(url.origin)
  ) {
    throw new DestinationDenied();
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const family = isIP(hostname);
  if (family) {
    return { address: hostname, family };
  }
  const addresses = await resolve(hostname, { all: true, verbatim: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => !isPublicAddress(address))
  ) {
    throw new DestinationDenied();
  }
  return addresses[0]!;
}

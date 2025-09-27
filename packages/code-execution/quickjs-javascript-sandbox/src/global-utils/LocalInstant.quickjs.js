// Source file evaluated in the QuickJS context, setting the global class
// `LocalInstant`. The class is a proxy to the "real" `LocalInstant` class that
// runs in the host.
//
// This proxy class implements the same chainable, immutable API for the
// `startOf`, `endOf`, `plus`, `minus`, and `set` methods. Calling those
// doesn't do anything though: they just queue more operations to be applied
// later. Then, when the `to*` methods are called, those actually do something,
// delegating to the `HostLocalInstant.to*` functions that apply the operations
// and return the result. Those functions are injected by the host, and their
// logic runs in the host.
//
// This implementation is certainly convoluted, but it is so because of
// limitations of the QuickJS sandbox:
// - No Intl support, so it's not possible to use the Luxon library.
// - Limit (seems to be 2^16) to the number of functions that can be injected
//   from the host into the context, which makes it not feasible to "inject the
//   chainable API". (An earlier implementation tried to do this, and the limit
//   was being hit after invoking `LocalInstant.*` a mere ~10k times.)
class LocalInstant {
  constructor(iso, operations) {
    this.iso = iso;
    this.operations = operations;
  }

  startOf(timeUnit) {
    return new LocalInstant(this.iso, [
      ...this.operations,
      { name: "startOf", arguments: [timeUnit] },
    ]);
  }

  endOf(timeUnit) {
    return new LocalInstant(this.iso, [
      ...this.operations,
      { name: "endOf", arguments: [timeUnit] },
    ]);
  }

  plus(duration) {
    return new LocalInstant(this.iso, [
      ...this.operations,
      { name: "plus", arguments: [duration] },
    ]);
  }

  minus(duration) {
    return new LocalInstant(this.iso, [
      ...this.operations,
      { name: "minus", arguments: [duration] },
    ]);
  }

  set(dateUnits) {
    return new LocalInstant(this.iso, [
      ...this.operations,
      { name: "set", arguments: [dateUnits] },
    ]);
  }

  toISO() {
    return HostLocalInstant.toISO(this.iso, this.operations);
  }

  toJSDate() {
    return new Date(HostLocalInstant.toISO(this.iso, this.operations));
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") {
      return this.toJSDate().getTime();
    }
    if (hint === "string") {
      return this.toISO();
    }
    return null;
  }
}

LocalInstant.fromISO = (iso) =>
  new LocalInstant(HostLocalInstant.fromISO(iso), []);

LocalInstant.fromInstant = (instant) =>
  new LocalInstant(HostLocalInstant.fromInstant(instant), []);

LocalInstant.fromPlainDate = (plainDate) =>
  new LocalInstant(HostLocalInstant.fromPlainDate(plainDate), []);

LocalInstant.now = () => new LocalInstant(new Date().toISOString(), []);

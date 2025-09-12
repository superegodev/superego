// Source file evaluated in the QuickJS context, setting the global class
// `LocalInstant`. The class is a proxy to the "real" `LocalInstant` class that
// runs in the host.
//
// This proxy class implements the same chainable, immutable API for the
// `startOf`, `endOf`, `add`, `subtract`, and `set` methods. Calling those
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
  constructor(instant, operations) {
    this.instant = instant;
    this.operations = operations;
  }

  startOf(timeUnit) {
    return new LocalInstant(this.instant, [
      ...this.operations,
      { name: "startOf", arguments: [timeUnit] },
    ]);
  }

  endOf(timeUnit) {
    return new LocalInstant(this.instant, [
      ...this.operations,
      { name: "endOf", arguments: [timeUnit] },
    ]);
  }

  add(duration) {
    return new LocalInstant(this.instant, [
      ...this.operations,
      { name: "add", arguments: [duration] },
    ]);
  }

  subtract(duration) {
    return new LocalInstant(this.instant, [
      ...this.operations,
      { name: "subtract", arguments: [duration] },
    ]);
  }

  set(dateUnits) {
    return new LocalInstant(this.instant, [
      ...this.operations,
      { name: "set", arguments: [dateUnits] },
    ]);
  }

  toUtcIso() {
    return HostLocalInstant.toUtcIso(this.instant, this.operations);
  }

  toJsDate() {
    return new Date(HostLocalInstant.toUtcIso(this.instant, this.operations));
  }

  toFormat(options = {}) {
    return HostLocalInstant.toFormat(this.instant, this.operations, options);
  }
}

LocalInstant.fromIso = (instant) => new LocalInstant(instant, []);

LocalInstant.now = () => new LocalInstant(new Date().toISOString(), []);

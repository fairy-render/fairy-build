declare module "@fairy/solid-server" {
  import type { RequestEvent } from "solid-js";
  // using global on a symbol for locating it later and detaching for environments that don't support it.
  export function provideRequestEvent<T extends RequestEvent, U>(
    init: T,
    cb: () => U,
  ): U;
}

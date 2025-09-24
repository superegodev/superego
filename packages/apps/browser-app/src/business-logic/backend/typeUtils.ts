import type { Backend } from "@superego/backend";

export type BackendMethod<
  Entity extends keyof Backend,
  Method extends keyof Backend[Entity],
> = Backend[Entity][Method] extends (...args: any[]) => any
  ? Backend[Entity][Method]
  : never;

export type ArgsOf<
  Entity extends keyof Backend,
  Method extends keyof Backend[Entity],
> = Parameters<BackendMethod<Entity, Method>>;

export type ResultOf<
  Entity extends keyof Backend,
  Method extends keyof Backend[Entity],
> = Awaited<ReturnType<BackendMethod<Entity, Method>>>;

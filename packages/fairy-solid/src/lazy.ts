import type { Component, ComponentProps } from "solid-js";
import { lazy as solidLazy } from "solid-js";
import { isServer } from "solid-js/web";

export function lazy<T extends Component>(
  fn: () => Promise<{
    default: T;
  }>,
): T & {
  preload: () => Promise<{
    default: T;
  }>;
} {
  if (isServer) {
    return serverLazy(fn);
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return solidLazy(fn);
  }
}

function serverLazy<T extends Component>(
  fn: () => Promise<{
    default: T;
  }>,
): T & {
  preload: () => Promise<{
    default: T;
  }>;
} {
  let key: string | undefined;
  const orgWrap = solidLazy(async () => {
    const ret = (await Promise.resolve(fn())) as unknown as {
      default: T;
      __fairy_key: string;
    };

    key = ret.__fairy_key;
    return ret;
  });

  const wrap = (props: ComponentProps<T>) => {
    const ret = orgWrap(props);
    if (key) (globalThis as any).Fairy.pushFile(key);
    return ret;
  };

  wrap.preload = orgWrap.preload;

  return wrap as T & {
    preload: () => Promise<{
      default: T;
    }>;
  };
}

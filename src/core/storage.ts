/**
 * Where the kit keeps the reader's choices in localStorage (theme, density, panel width, column picks and widths,
 * page order, recent ⌘K items): every key is `<prefix>.<name>`. The default prefix is "mds-ui"; an app that already has
 * saved choices under another prefix sets it once, before the first render:
 *
 *   configureStorage({ prefix: "my-app.ui" });
 */
let prefix = "mds-ui";

export function configureStorage(opts: { prefix: string }) {
  prefix = opts.prefix.replace(/\.+$/, "");
}

/** the localStorage key for one of the kit's saved choices */
export const storageKey = (name: string) => `${prefix}.${name}`;

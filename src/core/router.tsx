/**
 * The router adapter: the kit never imports a router. An app hands its own through `RouterProvider`; without one the
 * kit uses the browser's History API. TanStack Router:
 *
 *   const navigate = useNavigate();
 *   const value: KitRouter = {
 *     pathname: useLocation({ select: (l) => l.pathname }),
 *     navigate: (to) => void navigate({ href: to }), // `href`, so a recent item's "?search" survives
 *     Link: ({ to, ...p }) => <Link to={to as never} {...p} />, // forwards `activeOptions`, so `exact` holds
 *   };
 *   <RouterProvider value={value}>…</RouterProvider>
 */
import { type AnchorHTMLAttributes, type ComponentType, createContext, type MouseEvent, type ReactNode, useContext, useSyncExternalStore } from "react";

export type KitLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  to: string;
  className?: string;
  title?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
  "aria-current"?: AnchorHTMLAttributes<HTMLAnchorElement>["aria-current"];
  /** TanStack's own prop name, so its Link marks the same links active as the kit does; the default link drops it */
  activeOptions?: { exact?: boolean };
};
export type KitRouter = { pathname: string; navigate: (to: string) => void; Link: ComponentType<KitLinkProps> };

/** A link is lit on its own path and, unless `exact`, below it (segment-wise, as TanStack's default). */
export const isActivePath = (pathname: string, to: string, exact?: boolean) => {
  const p = pathname.replace(/\/+$/, "") || "/";
  const t = to.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return p === t || (!exact && t !== "/" && p.startsWith(t + "/"));
};

const subscribe = (fn: () => void) => (window.addEventListener("popstate", fn), () => window.removeEventListener("popstate", fn));
const browserNavigate = (to: string) => {
  history.pushState(null, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
};
function BrowserLink({ to, onClick, activeOptions: _a, ...rest }: KitLinkProps) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target) return;
    e.preventDefault();
    browserNavigate(to);
  };
  return <a href={to} onClick={go} {...rest} />;
}

const Ctx = createContext<KitRouter | null>(null);
export function RouterProvider({ value, children }: { value: KitRouter; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useKitRouter(): KitRouter {
  const given = useContext(Ctx);
  const pathname = useSyncExternalStore(subscribe, () => location.pathname, () => "/");
  return given ?? { pathname, navigate: browserNavigate, Link: BrowserLink };
}

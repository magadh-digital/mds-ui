/**
 * Every service's pages, for the command palette: each app shell registers the pages it owns at module load, and the
 * palette lists the pages of the services the reader is *not* in under "Other services", so ⌘K reaches any page of
 * the console from anywhere.
 *
 * Only what is static: the page, its label, its service. Permissions of another service are not known here, so
 * these entries are not gated — the page itself still gates on arrival.
 */
import type { LucideIcon } from "lucide-react";

export type ServicePage = { to: string; label: string; icon?: LucideIcon; keywords?: string };
type Service = { id: string; label: string; prefix: string; pages: Array<ServicePage> };

const services = new Map<string, Service>();

/** `prefix` is the path the service owns ('/' for the root app, '/orders', …). Registering again replaces. */
export const registerServicePages = (id: string, label: string, prefix: string, pages: Array<ServicePage>) => {
  services.set(id, { id, label, prefix, pages });
};

const owns = (prefix: string, pathname: string) => prefix === "/" || pathname === prefix || pathname.startsWith(prefix + "/");

/** the service the pathname belongs to: the longest owning prefix ('/' owns everything, so it comes last) */
export const currentService = (pathname: string): Service | undefined =>
  [...services.values()].filter((s) => owns(s.prefix, pathname)).sort((a, b) => b.prefix.length - a.prefix.length)[0];

/** the pages of every other service, each with its service's name as the hint */
export const otherServicePages = (pathname: string): Array<ServicePage & { service: string }> => {
  const here = currentService(pathname)?.id;
  return [...services.values()].filter((s) => s.id !== here).flatMap((s) => s.pages.map((p) => ({ ...p, service: s.label })));
};

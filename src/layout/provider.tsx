/**
 * One wrapper for the whole app: everything the kit's components rely on, in the right order.
 *
 *   <UIProvider router={router} glossary={{ lookup, label }} storagePrefix="my-app.ui">
 *     <App />
 *   </UIProvider>
 *
 * - Appearance (theme, density, panel width, detail view; AppShell and the appearance controls need it).
 * - The slide-over stack (several panels open at once close and layer in order).
 * - The glossary for header hovers (optional), the app's router for the shell and ⌘K (optional; browser history
 *   otherwise), the localStorage prefix for saved choices (optional; "mds-ui" otherwise).
 * - The toast host, mounted once (`toaster={false}` when the app mounts its own <Toaster />).
 *
 * Each piece is also exported on its own (AppearanceProvider, PanelStackProvider, TermsProvider, RouterProvider,
 * Toaster, configureStorage) for apps that want only one.
 */
import type { ReactNode } from "react";
import { RouterProvider, type KitRouter } from "../core/router";
import { configureStorage } from "../core/storage";
import { TermsProvider, type Glossary } from "../display/term";
import { Toaster } from "../overlay/toast";
import { AppearanceProvider } from "./appearance";
import { PanelStackProvider } from "./panel";

export function UIProvider({
  children,
  router,
  glossary,
  storagePrefix,
  toaster = true,
}: {
  children: ReactNode;
  /** the app's router ({ pathname, navigate, Link }); without it the shell and ⌘K use the browser's history */
  router?: KitRouter;
  /** header hovers: the meaning of a label */
  glossary?: Glossary;
  /** where saved choices live in localStorage (`<prefix>.theme`, …); "mds-ui" by default */
  storagePrefix?: string;
  /** mount the toast host (default); turn off when the app renders its own <Toaster /> */
  toaster?: boolean;
}) {
  // before the providers below read the saved choices on their first render
  if (storagePrefix) configureStorage({ prefix: storagePrefix });
  const body = (
    <AppearanceProvider>
      <PanelStackProvider>
        <TermsProvider glossary={glossary}>
          {children}
          {toaster && <Toaster />}
        </TermsProvider>
      </PanelStackProvider>
    </AppearanceProvider>
  );
  return router ? <RouterProvider value={router}>{body}</RouterProvider> : body;
}

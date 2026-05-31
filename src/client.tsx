import { initClient, initClientNavigation, navigate } from "rwsdk/client";

// RedwoodSDK uses RSC RPC to emulate client side navigation.
// https://docs.rwsdk.com/guides/frontend/client-side-nav/
const { handleResponse, onHydrated } = initClientNavigation();
initClient({ handleResponse, onHydrated });

// Wrap internal navigations in a View Transition (where supported) so pages
// animate between each other. We intercept the click in the capture phase —
// ahead of rwsdk's own bubble-phase handler — and run rwsdk's `navigate()`
// inside `document.startViewTransition`, then stop the event so rwsdk doesn't
// navigate a second time.
const startViewTransition = (
  document as Document & {
    startViewTransition?: (cb: () => void | Promise<void>) => void;
  }
).startViewTransition?.bind(document);

if (startViewTransition) {
  document.addEventListener(
    "click",
    (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (
        !anchor ||
        !href ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(href, window.location.href);
      // Only animate internal navigations to a different page.
      if (
        url.origin !== window.location.origin ||
        url.pathname === window.location.pathname
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      startViewTransition(() => navigate(href));
    },
    true,
  );
}

import React from "react";

export function useNavbarTheme() {
  const [isLight, setIsLight] = React.useState(false);

  React.useEffect(() => {
    let intersectionObserver: IntersectionObserver | null = null;

    const setupIntersectionObserver = () => {
      const sections = document.querySelectorAll<HTMLElement>(
        "[data-navbar-theme]",
      );
      if (!sections.length) return false;

      intersectionObserver?.disconnect();

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const theme = (entry.target as HTMLElement).dataset.navbarTheme;
              setIsLight(theme === "light");
            }
          });
        },
        {
          rootMargin: "0px 0px -95% 0px",
          threshold: 0,
        },
      );

      sections.forEach((section) => intersectionObserver!.observe(section));
      return true;
    };

    const found = setupIntersectionObserver();

    if (!found) {
      const mutationObserver = new MutationObserver(() => {
        const success = setupIntersectionObserver();
        if (success) mutationObserver.disconnect();
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        mutationObserver.disconnect();
        intersectionObserver?.disconnect();
      };
    }

    return () => intersectionObserver?.disconnect();
  }, []);

  return { isLight };
}

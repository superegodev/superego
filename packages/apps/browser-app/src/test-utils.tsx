import { type RenderOptions, render } from "@testing-library/react";
import type React from "react";
import type { ReactElement } from "react";
import { useLocale } from "react-aria-components";
import { IntlProvider } from "react-intl";
import messages from "./translations/compiled/en.json" with { type: "json" };

function Wrapper({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  return (
    <IntlProvider messages={messages} locale={locale} defaultLocale="en">
      {children}
    </IntlProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: Wrapper, ...options });

export * from "@testing-library/react";
export { customRender as render };

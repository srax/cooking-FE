import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(en)/:path*"],
};

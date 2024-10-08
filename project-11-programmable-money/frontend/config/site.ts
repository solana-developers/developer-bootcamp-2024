export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "StableCoin",
  mainNav: [
    {
      title: "Deposit/Withdraw",
      href: "/",
    },
    {
      title: "Liquidate",
      href: "/liquidate",
    },
    {
      title: "Config",
      href: "/config",
    },
  ],
};

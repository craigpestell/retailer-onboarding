import { captureStep } from "../lib.mjs";

const GST =
  "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses.html";

await captureStep("on", "04-hst", [
  {
    n: 1,
    alt: "CRA GST/HST for businesses page with the Who needs to register section highlighted",
    caption:
      "Check Who needs to register for GST/HST. Most businesses must register once taxable sales pass $30,000 in four consecutive calendar quarters.",
    setup: async (page) => {
      await page.goto(GST);
      await page
        .getByRole("link", { name: "Who needs to register for GST/HST" })
        .first()
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    },
    highlight: (page) => [
      page.getByRole("link", { name: "Who needs to register for GST/HST" }).first(),
    ],
  },
  {
    n: 2,
    alt: "CRA GST/HST for businesses page with the Get a GST/HST number and manage your account section highlighted",
    caption:
      "When you're ready, open Get a GST/HST number and manage your account. Registration is done in Business Registration Online, signed in with your CRA account.",
    setup: async (page) => {
      await page.goto(GST);
      await page
        .getByRole("link", { name: "Get a GST/HST number and manage your account" })
        .first()
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    },
    highlight: (page) => [
      page.getByRole("link", { name: "Get a GST/HST number and manage your account" }).first(),
    ],
  },
]);

import { captureStep } from "../lib.mjs";

const BN = "https://www.canada.ca/en/services/taxes/business-registration.html";

await captureStep("on", "03-business-number", [
  {
    n: 1,
    alt: "CRA business registration page with the Register with Business Registration Online link highlighted",
    caption:
      "On the CRA business registration page, choose Register with Business Registration Online (BRO).",
    setup: async (page) => {
      await page.goto(BN);
      await page
        .getByRole("link", { name: /Register with Business Registration Online/ })
        .first()
        .scrollIntoViewIfNeeded();
    },
    highlight: (page) => [
      page.getByRole("link", { name: /Register with Business Registration Online/ }).first(),
    ],
  },
  {
    n: 2,
    alt: "CRA page listing ways to register for a business number and program accounts",
    caption:
      "This section explains what a business number covers and which program accounts (like GST/HST) you can add to it.",
    setup: async (page) => {
      await page.goto(BN);
      await page
        .getByRole("heading", { name: "Register for a BN and program accounts" })
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    },
    highlight: (page) => [
      page.getByRole("heading", { name: "Register for a BN and program accounts" }),
    ],
  },
]);

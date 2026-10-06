import { captureStep } from "../lib.mjs";

const REGISTER = "https://www.ontario.ca/page/business/start/register-your-business-online";
const COST =
  "https://www.ontario.ca/page/cost-time-required-to-register-change-search-for-business-name-corporation-not-for-profit";

await captureStep("on", "02-register-business", [
  {
    n: 1,
    alt: "Ontario register your business online page with the email and card requirement and the sole proprietorship fee highlighted",
    caption:
      "Check what you need before you start: a working email address and a debit or credit card. You create an Ontario.ca Login and an Ontario Business Account during set-up, and a sole proprietorship costs $60.",
    setup: async (page) => {
      await page.goto(REGISTER);
      await page
        .getByText(/working email address/)
        .first()
        .evaluate((el) => el.scrollIntoView({ block: "start" }));
      await page.mouse.wheel(0, -120);
    },
    highlight: (page) => [
      page.getByText(/working email address/).first(),
      page.getByText(/Sole Proprietorship - \$60/).first(),
    ],
  },
  {
    n: 2,
    alt: "Ontario page listing registration fees with the sole proprietorship new registration fee highlighted",
    caption:
      "Registering a sole proprietorship online costs $60 and takes effect immediately. Renewing it every five years costs the same $60.",
    setup: async (page) => {
      await page.goto(COST);
      await page
        .getByRole("heading", { name: /^Sole Proprietorship, General Partnership/ })
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    },
    highlight: (page) => [
      page
        .getByRole("heading", { name: /^Sole Proprietorship, General Partnership/ })
        .locator("xpath=following-sibling::table[1]")
        .getByRole("row", { name: /New Registration/ }),
    ],
  },
]);

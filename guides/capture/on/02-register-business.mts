import { captureStep } from "../lib.mjs";

const REGISTER = "https://www.ontario.ca/page/business/start/register-your-business-online";
const COST =
  "https://www.ontario.ca/page/cost-time-required-to-register-change-search-for-business-name-corporation-not-for-profit";

await captureStep("on", "02-register-business", [
  {
    n: 1,
    alt: "Ontario register your business online page with the list of what you need highlighted",
    caption:
      "Check what you need before you start: an email address, a debit or credit card, an Ontario.ca Login and an Ontario Business Account.",
    setup: async (page) => {
      await page.goto(REGISTER);
      await page
        .getByRole("heading", { name: /what you need/i })
        .first()
        .scrollIntoViewIfNeeded();
    },
    highlight: (page) => [
      page.getByRole("heading", { name: /what you need/i }).first(),
    ],
  },
  {
    n: 2,
    alt: "Ontario page listing registration fees with the sole proprietorship fee highlighted",
    caption:
      "Registering a sole proprietorship online costs $60 and lasts five years. Online registration takes effect right away.",
    setup: async (page) => {
      await page.goto(COST);
      await page
        .getByText(/sole proprietorship/i)
        .first()
        .scrollIntoViewIfNeeded();
    },
    highlight: (page) => [page.getByText(/sole proprietorship/i).first()],
  },
]);

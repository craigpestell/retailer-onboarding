import { captureStep } from "../lib.mjs";

const STRUCTURE = "https://www.ontario.ca/page/business/start/decide-ownership-structure";
const OBR = "https://www.ontario.ca/page/ontario-business-registry";

await captureStep("on", "01-structure-and-name", [
  {
    n: 1,
    alt: "Ontario page on choosing an ownership structure with the sole proprietorship section highlighted",
    caption:
      "Read Ontario's guide to ownership structures. A sole proprietorship is the simplest way to start, but you are personally liable for the business.",
    setup: async (page) => {
      await page.goto(STRUCTURE);
      await page
        .getByRole("heading", { name: /sole proprietorship/i })
        .first()
        .scrollIntoViewIfNeeded();
    },
    highlight: (page) => [
      page.getByRole("heading", { name: /sole proprietorship/i }).first(),
    ],
  },
  {
    n: 2,
    alt: "Ontario Business Registry page with the search link highlighted",
    caption:
      "Search the Ontario Business Registry to check that no one else is already using the name you want.",
    setup: async (page) => {
      await page.goto(OBR);
      await page
        .getByRole("link", { name: /search/i })
        .first()
        .scrollIntoViewIfNeeded();
    },
    highlight: (page) => [page.getByRole("link", { name: /search/i }).first()],
  },
]);

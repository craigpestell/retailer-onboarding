import { captureStep } from "../lib.mjs";

const NAMES = "https://www.alberta.ca/register-business-name";

await captureStep("ab", "01-structure-and-name", [
  {
    n: 1,
    alt: "Alberta register a business name page with the Types of business names section and the trade name description highlighted",
    caption:
      "Read Alberta's Types of business names. A trade name is what you register when you do business under a name other than your own personal name.",
    setup: async (page) => {
      await page.goto(NAMES);
      await page
        .getByRole("heading", { name: /Types of business names/i })
        .first()
        .evaluate((el) => el.scrollIntoView({ block: "start" }));
      await page.mouse.wheel(0, -80);
    },
    highlight: (page) => [
      page.getByRole("heading", { name: /Types of business names/i }).first(),
      page.getByText(/trade name is used when an individual/i).first(),
    ],
  },
  {
    n: 2,
    alt: "Alberta register a business name page with the step about getting a Business Name Report from NUANS highlighted",
    caption:
      "Before you register, consider a NUANS Business Name Report. Alberta recommends one to find similar names, but it is optional and NUANS members charge for it.",
    setup: async (page) => {
      await page.goto(NAMES);
      await page
        .getByText(/Business Name Report/)
        .first()
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    },
    highlight: (page) => [page.getByText(/Business Name Report/).first()],
  },
]);

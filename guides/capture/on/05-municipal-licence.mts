import { captureStep } from "../lib.mjs";

const TORONTO =
  "https://www.toronto.ca/business-economy/new-businesses-startups/business-regulations/";
const OTTAWA =
  "https://ottawa.ca/en/business/permits-and-licences/business-licences/apply-municipal-business-licence";

await captureStep("on", "05-municipal-licence", [
  {
    n: 1,
    alt: "City of Toronto business regulations page with the note on retail stores highlighted",
    caption:
      "Each city sets its own rules. Toronto, for example, says retail stores selling new, non-food items do not need a municipal operating licence.",
    setup: async (page) => {
      await page.goto(TORONTO);
      await page
        .getByText(/retail/i)
        .first()
        .scrollIntoViewIfNeeded();
    },
    highlight: (page) => [page.getByText(/retail/i).first()],
  },
  {
    n: 2,
    alt: "City of Ottawa page on applying for a municipal business licence",
    caption:
      "Ottawa licenses some businesses but not others. Look up your own city or town's licensing page in the same way.",
    setup: (page) => page.goto(OTTAWA).then(() => undefined),
    highlight: (page) => [page.getByRole("heading", { level: 1 }).first()],
  },
]);

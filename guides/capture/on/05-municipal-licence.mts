import { captureStep } from "../lib.mjs";

const TORONTO =
  "https://www.toronto.ca/business-economy/new-businesses-startups/business-regulations/";

// Ottawa's licensing pages sit behind bot protection that blocks automated
// browsers, so this step only shows Toronto.
await captureStep("on", "05-municipal-licence", [
  {
    n: 1,
    alt: "City of Toronto business regulations page with the list of businesses that do not need a licence open and the retail stores item highlighted",
    caption:
      "Each city sets its own rules. Toronto, for example, says retail stores selling new, non-food items do not need a municipal operating licence. Look up your own city or town's licensing page in the same way.",
    setup: async (page) => {
      await page.goto(TORONTO);
      await page
        .getByRole("button", { name: /Businesses That Do Not Require a Municipal Operating Licence/ })
        .click();
      const retail = page.getByText(/retail and products stores that do not sell food/);
      await retail.waitFor();
      // Let the accordion finish opening before measuring scroll position.
      await page.waitForTimeout(1000);
      // Keep the open accordion header and the retail item in one shot.
      await page
        .getByRole("button", { name: /Businesses That Do Not Require a Municipal Operating Licence/ })
        .evaluate((el) => el.scrollIntoView({ block: "start" }));
      await page.mouse.wheel(0, -60);
    },
    highlight: (page) => [
      page.getByRole("button", { name: /Businesses That Do Not Require a Municipal Operating Licence/ }),
      page.getByText(/retail and products stores that do not sell food/),
    ],
  },
]);

import { captureStep } from "../lib.mjs";

const CALGARY = "https://www.calgary.ca/for-business/licences/retail.html";

// Edmonton's home-based business page has no single list to point at, so this
// step only shows Calgary.
await captureStep("ab", "05-municipal-licence", [
  {
    n: 1,
    alt: "City of Calgary open a retail business page with online or phone sales and home-based retail sales highlighted in the list of businesses that need a licence",
    caption:
      "Each municipality sets its own rules. Calgary, for example, lists online or phone sales and home-based retail sales among the businesses that need a licence. Look up your own city or town in the same way.",
    setup: async (page) => {
      await page.goto(CALGARY);
      await page
        .getByText(/Online or phone sales/i)
        .first()
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    },
    highlight: (page) => [
      page.getByText(/Online or phone sales/i).first(),
      page.getByText(/Home-based retail sales/i).first(),
    ],
  },
]);

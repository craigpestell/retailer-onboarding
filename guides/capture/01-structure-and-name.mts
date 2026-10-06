import { captureStep } from "./lib.mjs";

const NAMES = "https://www.names.bcregistry.gov.bc.ca/";

await captureStep("01-structure-and-name", [
  {
    n: 1,
    alt: "Name Request page with the action selector for starting a new business name",
    caption:
      "Open Name Request and choose the action that matches what you're doing. For a new business, pick the option to get a business name.",
    setup: (page) => page.goto(NAMES).then(() => undefined),
    highlight: (page) => [page.getByText("Select an action first").first()],
  },
  {
    n: 2,
    alt: "Name Request page with the How to Build Your Name guidance",
    caption:
      "Read How to Build Your Name before you type anything. A name needs a distinctive part and a description, and it must not clash with an existing name.",
    setup: async (page) => {
      await page.goto(NAMES);
      await page
        .getByText("How to Build Your Name")
        .first()
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    },
    highlight: (page) => [
      page.getByText("Check the name has the correct components"),
    ],
  },
]);

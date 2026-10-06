import { captureStep } from "../lib.mjs";

await captureStep("bc", "05-pst", [
  {
    n: 1,
    alt: "eTaxBC log on page with the Enrol now option highlighted",
    caption:
      "On the eTaxBC home page, use Enrol now to create an eTaxBC profile. You'll register for PST from inside your profile.",
    setup: async (page) => {
      await page.goto("https://www.etax.gov.bc.ca/btp/eservices/_/");
      await page
        .getByText("Enrol now to create an eTaxBC profile")
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    },
    highlight: (page) => [page.getByText("Enrol now to create an eTaxBC profile")],
  },
]);

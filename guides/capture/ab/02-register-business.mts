import { captureStep } from "../lib.mjs";

const NAMES = "https://www.alberta.ca/register-business-name";
const AGENTS = "https://www.alberta.ca/find-business-registry";

await captureStep("ab", "02-register-business", [
  {
    n: 1,
    alt: "Alberta register a business name page with the Declaration of Trade Name form link highlighted",
    caption:
      "Fill in the Declaration of Trade Name form before you visit a registry agent. Partnerships use a different form.",
    setup: async (page) => {
      await page.goto(NAMES);
      await page
        .getByRole("link", { name: /Declaration of Trade Name/i })
        .first()
        .evaluate((el) => el.scrollIntoView({ block: "center" }));
    },
    highlight: (page) => [page.getByRole("link", { name: /Declaration of Trade Name/i }).first()],
  },
  {
    n: 2,
    alt: "Alberta find a business registry page with the level 1 basic registrations list and the note that service fees vary highlighted",
    caption:
      "Find a registry agent that handles basic registrations, which include trade names. Service fees are not regulated and vary between agents, so ask for the total before you go.",
    setup: async (page) => {
      await page.goto(AGENTS);
      await page
        .getByText(/Level 1/)
        .first()
        .evaluate((el) => el.scrollIntoView({ block: "start" }));
      await page.mouse.wheel(0, -200);
    },
    highlight: (page) => [
      page.getByText(/Service fees are not regulated/).first(),
      page.getByText(/Level 1/).first(),
    ],
  },
]);

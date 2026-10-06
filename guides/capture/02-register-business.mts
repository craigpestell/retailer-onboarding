import { captureStep } from "./lib.mjs";

await captureStep("02-register-business", [
  {
    n: 1,
    alt: "BC Registries and Online Services home page with the Create Account button highlighted",
    caption: "Start at the BC Registries home page and choose Create Account.",
    setup: (page) =>
      page
        .goto("https://www.bcregistry.gov.bc.ca/en-CA")
        .then(() => undefined),
    highlight: (page) => [page.getByRole("link", { name: "Create Account" }).first()],
  },
  {
    n: 2,
    alt: "Create account page offering sign-in with BC Services Card",
    caption:
      "Accounts are created with a BC Services Card. Have it set up before you start.",
    setup: (page) =>
      page
        .goto("https://www.account.bcregistry.gov.bc.ca/choose-authentication-method")
        .then(() => undefined),
    highlight: (page) => [page.getByRole("button", { name: "Create", exact: true })],
  },
  {
    n: 3,
    alt: "Name Request page with the action selector",
    caption:
      "Check and reserve your business name with Name Request before registering.",
    setup: (page) =>
      page.goto("https://www.names.bcregistry.gov.bc.ca/").then(() => undefined),
  },
]);

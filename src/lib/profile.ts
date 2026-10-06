/**
 * Business profile: the details users collect while working through the steps.
 * One definition drives the form, the API validation and the export, so a new
 * field only needs adding here. Sections are keyed by step slug.
 */

export type ProfileField = {
  key: string;
  label: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
};

export type ProfileSection = {
  step: string;
  title: string;
  /** Text for the link on the step page: "Save your {linkText}". */
  linkText: string;
  fields: ProfileField[];
};

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    step: "structure-and-name",
    title: "Business name",
    linkText: "business name",
    fields: [
      { key: "businessName", label: "Business name", autoComplete: "organization" },
    ],
  },
  {
    step: "register-business",
    title: "Owner and address",
    linkText: "owner and address",
    fields: [
      { key: "ownerName", label: "Owner's legal name", autoComplete: "name" },
      { key: "email", label: "Business email", autoComplete: "email" },
      { key: "phone", label: "Business phone", autoComplete: "tel" },
      { key: "street", label: "Street address", autoComplete: "street-address" },
      { key: "city", label: "City", autoComplete: "address-level2" },
      { key: "province", label: "Province", placeholder: "BC", autoComplete: "address-level1" },
      { key: "postalCode", label: "Postal code", autoComplete: "postal-code" },
      {
        key: "bcRegistryNumber",
        label: "BC Registry number",
        hint: "From your registration confirmation.",
      },
    ],
  },
  {
    step: "business-number",
    title: "Business Number",
    linkText: "Business Number",
    fields: [
      {
        key: "businessNumber",
        label: "Business Number (BN)",
        hint: "Nine digits.",
        placeholder: "123456789",
      },
    ],
  },
  {
    step: "gst",
    title: "GST account",
    linkText: "GST number",
    fields: [
      {
        key: "gstNumber",
        label: "GST/HST account number",
        hint: "Your Business Number followed by RT and four digits.",
        placeholder: "123456789RT0001",
      },
    ],
  },
  {
    step: "pst",
    title: "PST account",
    linkText: "PST number",
    fields: [
      {
        key: "pstNumber",
        label: "PST number",
        hint: "From your eTaxBC account.",
        placeholder: "PST-1234-5678",
      },
    ],
  },
  {
    step: "municipal-licence",
    title: "Municipal business licence",
    linkText: "licence details",
    fields: [
      { key: "licenceMunicipality", label: "Municipality" },
      { key: "licenceNumber", label: "Licence number" },
    ],
  },
];

export type Profile = Record<string, string>;

export const MAX_VALUE_LENGTH = 200;

const KNOWN_KEYS = new Set(
  PROFILE_SECTIONS.flatMap((s) => s.fields.map((f) => f.key)),
);

export function getSection(step: string): ProfileSection | undefined {
  return PROFILE_SECTIONS.find((s) => s.step === step);
}

/** Returns a clean profile, or null if the input isn't an object of short strings with known keys. */
export function parseProfile(input: unknown): Profile | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  const out: Profile = {};
  for (const [key, value] of Object.entries(input)) {
    if (!KNOWN_KEYS.has(key) || typeof value !== "string") return null;
    const trimmed = value.trim();
    if (trimmed.length > MAX_VALUE_LENGTH) return null;
    if (trimmed) out[key] = trimmed;
  }
  return out;
}

/** The portable format the store tool will import. Bump `version` on breaking changes. */
export function toExport(profile: Profile) {
  return {
    schema: "business-profile",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
  };
}

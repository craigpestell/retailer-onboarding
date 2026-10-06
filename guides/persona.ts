// Fictional persona used for every guide screenshot. Obviously fake on purpose:
// never use real personal details, and never submit anything on a live site.
export const persona = {
  firstName: "Alex",
  lastName: "Sample",
  email: "alex.sample@example.com",
  phone: "250-555-0142",
  address: {
    street: "123 Example Street",
    city: "Victoria",
    province: "BC",
    postalCode: "V8W 1A1",
  },
  business: {
    type: "Sole proprietorship",
    name: "Sample Goods",
    nameDescriptor: "Goods",
    description: "Online store selling handmade home goods",
    startDate: "2026-01-01",
  },
} as const;

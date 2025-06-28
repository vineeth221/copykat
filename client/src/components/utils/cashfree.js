import { load } from "@cashfreepayments/cashfree-js";

let cashfreeInstance;

const initializeCashfree = async () => {
  if (!cashfreeInstance) {
    cashfreeInstance = await load({ mode: "sandbox" }); // Change to "production" for live payments
  }
  return cashfreeInstance;
};

export { initializeCashfree };

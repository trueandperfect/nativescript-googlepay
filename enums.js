export var GooglePayAuthMethods;
(function (GooglePayAuthMethods) {
    /**
     * This authentication method is associated with payment cards stored on file with the user's Google Account.
     * Returned payment data includes personal account number (PAN) with the expiration month and the expiration year.
     */
    GooglePayAuthMethods["PAN_ONLY"] = "PAN_ONLY";
    /**
     * This authentication method is associated with cards stored as Android device tokens.
     * Returned payment data includes a 3-D Secure (3DS) cryptogram generated on the device.
     */
    GooglePayAuthMethods["CRYPTOGRAM_3DS"] = "CRYPTOGRAM_3DS";
})(GooglePayAuthMethods || (GooglePayAuthMethods = {}));
export var GooglePayCardNetworks;
(function (GooglePayCardNetworks) {
    GooglePayCardNetworks["AMEX"] = "AMEX";
    GooglePayCardNetworks["DISCOVER"] = "DISCOVER";
    GooglePayCardNetworks["INTERAC"] = "INTERAC";
    GooglePayCardNetworks["JCB"] = "JCB";
    GooglePayCardNetworks["MASTERCARD"] = "MASTERCARD";
    GooglePayCardNetworks["VISA"] = "VISA";
})(GooglePayCardNetworks || (GooglePayCardNetworks = {}));
export var GooglePayEvents;
(function (GooglePayEvents) {
    GooglePayEvents["PaymentCancelled"] = "PaymentCancelled";
    GooglePayEvents["PaymentError"] = "PaymentError";
    GooglePayEvents["PaymentSuccess"] = "PaymentSuccess";
})(GooglePayEvents || (GooglePayEvents = {}));
/**
 * A payment method tokenization type is supported for the given PaymentMethod.
 * For CARD payment method, use PAYMENT_GATEWAY or DIRECT.
 * For PAYPAL PaymentMethod, use DIRECT with no parameter.
 * @link - https://developers.google.com/pay/api/android/reference/request-objects#gateway
 */
export var TokenizationSpecificationType;
(function (TokenizationSpecificationType) {
    /**
     * To retrieve payment and customer information from a payment gateway that's supported by the Google Pay API, set type to PAYMENT_GATEWAY
     */
    TokenizationSpecificationType["PAYMENT_GATEWAY"] = "PAYMENT_GATEWAY";
    /**
     * The Direct integration allows merchants to decrypt the Google Pay response on their servers.
     * To qualify, you must be Payments Card Industry (PCI) Data Security Standard (DSS) Level 1 compliant.
     * Your servers also need to have the required infrastructure to securely handle users' payment credentials.
     */
    TokenizationSpecificationType["DIRECT"] = "DIRECT";
})(TokenizationSpecificationType || (TokenizationSpecificationType = {}));
/**
 * Billing address format required to complete the transaction.
 */
export var BillingAddressParametersFormat;
(function (BillingAddressParametersFormat) {
    /**
     * Name, country code, and postal code (default).
     */
    BillingAddressParametersFormat["MIN"] = "MIN";
    /**
     * Name, street address, locality, region, country code, and postal code.
     */
    BillingAddressParametersFormat["FULL"] = "FULL";
})(BillingAddressParametersFormat || (BillingAddressParametersFormat = {}));
/**
 * A short identifier for the supported payment method.
 */
export var AllowedPaymentMethodsType;
(function (AllowedPaymentMethodsType) {
    AllowedPaymentMethodsType["CARD"] = "CARD";
})(AllowedPaymentMethodsType || (AllowedPaymentMethodsType = {}));
export var TotalPriceStatusValue;
(function (TotalPriceStatusValue) {
    /**
     * Used for a capability check. Do not use this property if the transaction is processed in an EEA country.
     */
    TotalPriceStatusValue["NOT_CURRENTLY_KNOWN"] = "NOT_CURRENTLY_KNOWN";
    /**
     * Total price may adjust based on the details of the response, such as sales tax collected based on a billing address.
     */
    TotalPriceStatusValue["ESTIMATED"] = "ESTIMATED";
    /**
     * Total price doesn't change from the amount presented to the shopper.
     */
    TotalPriceStatusValue["FINAL"] = "FINAL";
})(TotalPriceStatusValue || (TotalPriceStatusValue = {}));
/**
 * Affects the submit button text displayed in the Google Pay payment sheet.
 */
export var CheckoutOptionValue;
(function (CheckoutOptionValue) {
    /**
     * Standard text applies for the given totalPriceStatus (default).
     */
    CheckoutOptionValue["DEFAULT"] = "DEFAULT";
    /**
     * The selected payment method is charged immediately after the payer confirms their selections. This option is only available when totalPriceStatus is set to FINAL.
     */
    CheckoutOptionValue["COMPLETE_IMMEDITATE_PURCHASE"] = "COMPLETE_IMMEDIATE_PURCHASE";
})(CheckoutOptionValue || (CheckoutOptionValue = {}));
export var GooglePayButtonType;
(function (GooglePayButtonType) {
    GooglePayButtonType["PAY_WHITE"] = "PAY_WHITE";
    GooglePayButtonType["PAY_WHITE_NO_SHADOW"] = "PAY_WHITE_NO_SHADOW";
    GooglePayButtonType["BUY_WHITE"] = "BUY_WHITE";
    GooglePayButtonType["BUY_WHITE_NO_SHADOW"] = "BUY_WHITE_NO_SHADOW";
    // Black Buttons
    GooglePayButtonType["PAY_BLACK"] = "PAY_BLACK";
    GooglePayButtonType["BUY_BLACK"] = "BUY_BLACK";
    GooglePayButtonType["DONATE_BLACK"] = "DONATE_BLACK";
})(GooglePayButtonType || (GooglePayButtonType = {}));
//# sourceMappingURL=enums.js.map
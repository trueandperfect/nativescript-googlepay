/**
 * Contains helper static methods for dealing with the Payments API.
 *
 * <p>Many of the parameters used in the code are optional and are set here merely to call out their
 * existence. Please consult the documentation to learn more and feel free to remove ones not
 * relevant to your implementation.
 */
export declare class PaymentsUtil {
    static CENTS_IN_A_UNIT: java.math.BigDecimal;
    /**
     * Creates an instance of {@link PaymentsClient} for use in an {@link Activity} using the
     * environment and theme set in {@link Constants}.
     */
    static createPaymentsClient(environment: any, theme: any): com.google.android.gms.wallet.PaymentsClient;
    /**
     * Converts cents to a string format accepted by {@link PaymentsUtil#getPaymentDataRequest}.
     *
     * @param cents value of the price in cents.
     */
    static centsToString(cents: any): string;
}

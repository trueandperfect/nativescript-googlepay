import { AndroidApplication, Application, Property, Utils, View } from '@nativescript/core';
import { GooglePayButtonType, GooglePayEvents } from './enums';
import { PaymentsUtil } from './payment-utils.android';
export * from './enums';
export * from './interfaces';
export class GooglePayBtn extends View {
    constructor() {
        super(...arguments);
        this._cardNetworks = [];
        this._authMethods = [];
        this._onActivityResult = (args) => {
            if (args.requestCode === GooglePayBtn.LOAD_PAYMENT_DATA_REQUEST_CODE) {
                // value passed in AutoResolveHelper
                switch (args.resultCode) {
                    case android.app.Activity.RESULT_OK:
                        {
                            const paymentData = com.google.android.gms.wallet.PaymentData.getFromIntent(args.intent);
                            // Token will be null if PaymentDataRequest was not constructed using fromJson(String).
                            const paymentInfo = paymentData.toJson();
                            if (paymentInfo === null) {
                                return null;
                            }
                            const x = JSON.parse(paymentInfo);
                            const apiVersion = x.apiVersion;
                            const apiVersionMinor = x.apiVersionMinor;
                            const email = x.email;
                            // https://developers.google.com/pay/api/web/reference/response-objects#Address
                            const shippingAddress = x.shippingAddress;
                            // https://developers.google.com/pay/api/web/reference/response-objects#PaymentMethodData
                            const paymentMethodData = x.paymentMethodData;
                            const type = paymentMethodData.type;
                            const description = paymentMethodData.description;
                            const info = paymentMethodData.info;
                            // https://developers.google.com/pay/api/web/reference/response-objects#PaymentMethodTokenizationData
                            const tokenizationData = paymentMethodData.tokenizationData;
                            const tokenType = tokenizationData.type;
                            // https://developers.google.com/pay/api/web/guides/resources/payment-data-cryptography#payment-method-token-structure
                            const token = tokenizationData.token;
                            let protocolVersion;
                            let signature;
                            let signedMessage;
                            try {
                                // need it as JSON Object to grab the values
                                const tokenAsObject = JSON.parse(token);
                                protocolVersion = tokenAsObject.protocolVersion;
                                signature = tokenAsObject.signature;
                                signedMessage = tokenAsObject.signedMessage;
                            }
                            catch (error) {
                                // May not be able to parse the token OK if not
                                console.log('Unable to parse token:', error);
                            }
                            // https://developers.google.com/pay/api/web/reference/response-objects
                            this.notify({
                                eventName: GooglePayEvents.PaymentSuccess,
                                object: this,
                                data: {
                                    apiVersion,
                                    apiVersionMinor,
                                    paymentMethodData: {
                                        type,
                                        description,
                                        info,
                                        tokenizationData: {
                                            type: tokenType,
                                            token: {
                                                protocolVersion,
                                                signature,
                                                signedMessage,
                                                rawToken: token
                                            }
                                        }
                                    },
                                    email,
                                    shippingAddress
                                }
                            });
                        }
                        break;
                    case android.app.Activity.RESULT_CANCELED:
                        // The user cancelled the payment attempt
                        this.notify({
                            eventName: GooglePayEvents.PaymentCancelled,
                            object: this
                        });
                        break;
                    case com.google.android.gms.wallet.AutoResolveHelper.RESULT_ERROR:
                        {
                            const status = com.google.android.gms.wallet.AutoResolveHelper.getStatusFromIntent(args.intent);
                            this.notify({
                                eventName: GooglePayEvents.PaymentError,
                                object: this,
                                data: {
                                    isCanceled: status.isCanceled(),
                                    isInterrupted: status.isInterrupted(),
                                    isSuccess: status.isSuccess(),
                                    status: status.getStatus(),
                                    statusCode: status.getStatusCode(),
                                    statusMessage: status.getStatusMessage()
                                }
                            });
                        }
                        break;
                }
                // Re-enables the Google Pay payment button.
                // this._nativeBtn.setClickable(true);
                Application.android.off('activityResult', this._onActivityResult);
            }
        };
    }
    // Here we create a basic FrameLayout because we have to perform a check if the device can support the payment networks/methods needed
    // so during the initNativeView we will perform the check and
    // if the device supports it, we create the native button and add it to the
    // framelayout, if not we remove the FrameLayout by setting visibility to GONE.
    createNativeView() {
        this._android = new android.widget.FrameLayout(Utils.android.getApplicationContext());
        this._android.setVisibility(android.view.View.GONE);
        return this._android;
    }
    initNativeView() {
        this._androidViewId = android.view.View.generateViewId();
        this.nativeView.setId(this._androidViewId);
        // need to see if the app can use google pay APIs
        // if they can then we create the correct button
        // if they can't just return an empty FrameLayout
        // convert the string values for the card networks and auth methods into their JsonArrays
        // always using TEST environment here because we're only using this client to test if the device works with Google Pay
        this._paymentsClient = PaymentsUtil.createPaymentsClient(3, 1);
        // Card Network handling
        if (!this.cardNetworks) {
            console.log(`${GooglePayBtn.TAG} Error: cardNetworks need to be set in order to confirm that Google supports the device payments.`);
            return null;
        }
        const networkJSArray = this.cardNetworks.split(',');
        for (let i = 0; i < networkJSArray.length; i++) {
            const el = networkJSArray[i];
            this._cardNetworks.push(el.trim());
        }
        // Auth Methods handling
        if (!this.authMethods) {
            console.log(`${GooglePayBtn.TAG} Error: authMethods need to be set in order to confirm that Google supports the device payments.`);
            return null;
        }
        const authMethodsJSArray = this.authMethods.split(',');
        for (let i = 0; i < authMethodsJSArray.length; i++) {
            const el = authMethodsJSArray[i];
            this._authMethods.push(el.trim());
        }
        const isReadyToPayJson = GooglePayBtn._getIsReadyToPayRequest(this._cardNetworks, this._authMethods);
        // not able to use google pay if this happens
        if (!isReadyToPayJson) {
            return;
        }
        // The call to isReadyToPay is asynchronous and returns a Task. We need to provide an
        // OnCompleteListener to be triggered when the result of the call is known.
        const request = com.google.android.gms.wallet.IsReadyToPayRequest.fromJson(JSON.stringify(isReadyToPayJson));
        const task = this._paymentsClient.isReadyToPay(request); // Task<Boolean>
        const listener = new com.google.android.gms.tasks.OnCompleteListener({
            onComplete: args => {
                if (args.isSuccessful()) {
                    // set the click listener for the native button
                    const clickListener = new ClickListenerImpl(new WeakRef(this));
                    // handle button style/theme
                    const ctx = Utils.android.getApplicationContext();
                    const buttonType = this._mapButtonTypeToNativeValue(this.buttonType);
                    let layoutId; // using if the first attempt fails
                    layoutId = ctx.getResources().getIdentifier(buttonType, 'layout', ctx.getPackageName());
                    if (!layoutId) {
                        // now try the other approach to get the layout
                        layoutId = this._getButtonLayoutId(ctx, buttonType);
                    }
                    if (!layoutId) {
                        // this is bad and should not happen, but it is better to have a safeguard than weirdness in the app
                        console.log('Error trying to find the correct Google Pay Button layout resource.');
                        this._android.setVisibility(android.view.View.GONE);
                        return;
                    }
                    // inflate the Google Pay Button layout from the google docs/guidelines
                    const view = android.view.LayoutInflater.from(ctx).inflate(layoutId, null, false);
                    if (!view) {
                        // this is bad and should not happen, but it is better to have a safeguard than weirdness in the app
                        this._android.setVisibility(android.view.View.GONE);
                        return;
                    }
                    view.setId(android.view.View.generateViewId());
                    view.setOnClickListener(clickListener);
                    this._android.addView(view);
                    this._android.setVisibility(android.view.View.VISIBLE);
                }
                else {
                    console.log('Google Pay is not supported on this device.', args.getException());
                    this._android.setVisibility(android.view.View.GONE);
                }
            }
        });
        task.addOnCompleteListener(Application.android.startActivity || Application.android.foregroundActivity, listener);
    }
    createPaymentRequest(args) {
        return new Promise((resolve, reject) => {
            try {
                const paymentDataRequest = {
                    apiVersion: 2,
                    apiVersionMinor: 0
                };
                // paymentDataRequest['environment'] = 'TEST'
                if (args.merchantInfo?.merchantName) {
                    paymentDataRequest['merchantInfo'] = {
                        merchantName: args.merchantInfo.merchantName
                    };
                }
                if (args.emailRequired) {
                    paymentDataRequest['emailRequired'] = args.emailRequired;
                }
                if (args.shippingAddressRequired) {
                    paymentDataRequest['shippingAddressRequired'] = true;
                    const countryCodesArray = args.shippingAddressParameters.allowedCountryCodes ?? [];
                    paymentDataRequest['shippingAddressParameters'] = {
                        allowedCountryCodes: countryCodesArray,
                        phoneNumberRequired: args.shippingAddressParameters.phoneNumberRequired
                    };
                }
                // create the payment method
                // payment method array https://developers.google.com/pay/api/android/reference/request-objects#PaymentMethod
                const paymentMethod = { type: args.allowedPaymentMethods.type };
                // https://developers.google.com/pay/api/android/reference/request-objects#CardParameters
                const parameters = { allowedAuthMethods: this._authMethods, allowedCardNetworks: this._cardNetworks };
                if (args.allowedPaymentMethods.parameters.allowPrepaidCards) {
                    parameters['allowPrepaidCards'] = args.allowedPaymentMethods.parameters.allowPrepaidCards;
                }
                if (args.allowedPaymentMethods.parameters.allowCreditCards) {
                    parameters['allowCreditCards'] = args.allowedPaymentMethods.parameters.allowCreditCards;
                }
                if (args.allowedPaymentMethods.parameters.assuranceDetailsRequired) {
                    parameters['assuranceDetailsRequired'] = args.allowedPaymentMethods.parameters.assuranceDetailsRequired;
                }
                // Optionally, you can add billing address/phone number associated with a CARD payment method.
                if (args.allowedPaymentMethods.parameters.billingAddressRequired) {
                    parameters['billingAddressRequired'] = true;
                    const billingAddressParameters = {};
                    if (args.allowedPaymentMethods.parameters.billingAddressParameters.format) {
                        billingAddressParameters['format'] = args.allowedPaymentMethods.parameters.billingAddressParameters.format;
                    }
                    if (args.allowedPaymentMethods.parameters.billingAddressParameters.phoneNumberRequired) {
                        billingAddressParameters['phoneNumberRequired'] = args.allowedPaymentMethods.parameters.billingAddressParameters.phoneNumberRequired;
                    }
                    parameters['billingAddressParameters'] = billingAddressParameters;
                }
                if (args.allowedPaymentMethods.tokenizationSpecification) {
                    const tokenSpecification = { type: args.allowedPaymentMethods.tokenizationSpecification.type, 
                        parameters: { 
                            gateway: args.allowedPaymentMethods.tokenizationSpecification.parameters.gateway, 
                            gatewayMerchantId: args.allowedPaymentMethods.tokenizationSpecification.parameters.gatewayMerchantId, 
                            'stripe:version': args.allowedPaymentMethods.tokenizationSpecification.parameters.version, 
                            'stripe:publishableKey': args.allowedPaymentMethods.tokenizationSpecification.parameters.gatewayMerchantId 
                        } 
                    };
                    paymentMethod['tokenizationSpecification'] = tokenSpecification;
                }
                paymentMethod['parameters'] = parameters;
                paymentDataRequest['allowedPaymentMethods'] = [paymentMethod];
                paymentDataRequest['transactionInfo'] = this._getTransactionInfo(args);
                const request = com.google.android.gms.wallet.PaymentDataRequest.fromJson(JSON.stringify(paymentDataRequest));
                Application.android.on(AndroidApplication.activityResultEvent, this._onActivityResult);
                // Since loadPaymentData may show the UI asking the user to select a payment method, we use
                // AutoResolveHelper to wait for the user interacting with it. Once completed,
                // onActivityResult will be called with the result.
                // need to get the native CONST values for the values from the public user API
                // now we create the payment client for the actual payment processing
                const env = args.environment === 'development' ? 3 : 1;
                const theme = args.theme === 'light' ? 1 : 0;
                const client = PaymentsUtil.createPaymentsClient(env, theme);
                if (request !== null) {
                    com.google.android.gms.wallet.AutoResolveHelper.resolveTask(client.loadPaymentData(request), Application.android.startActivity || Application.android.foregroundActivity, GooglePayBtn.LOAD_PAYMENT_DATA_REQUEST_CODE);
                }
                resolve(null);
            }
            catch (error) {
                // Re-enables the Google Pay payment button.
                // this._nativeBtn.setClickable(true);
                reject(error);
            }
        });
    }
    static _getIsReadyToPayRequest(networks, authMethods) {
        try {
            const cardPaymentMethod = { type: 'CARD' };
            const parameters = {
                allowedAuthMethods: authMethods,
                allowedCardNetworks: networks,
                // Optionally, you can add billing address/phone number associated with a CARD payment method.
                billingAddressRequired: true
            };
            const billingAddressParameters = { format: 'FULL' };
            parameters['billingAddressParameters'] = billingAddressParameters;
            cardPaymentMethod['parameters'] = parameters;
            const isReadyToPayRequest = {
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [cardPaymentMethod]
            };
            return isReadyToPayRequest;
        }
        catch (ex) {
            console.log(ex);
            return null;
        }
    }
    _getTransactionInfo(args) {
        const transactionInfo = {
            currencyCode: args.transactionInfo.currencyCode,
            totalPriceStatus: args.transactionInfo.totalPriceStatus
        };
        const displayItemsArray = [];
        // displayItems may not be supported on the GooglePay Android API anymore
        // https://developers.google.com/pay/api/android/reference/request-objects#TransactionInfo
        // it is not listed in the object anymore
        if (args.transactionInfo?.displayItems?.length >= 1) {
            args.transactionInfo.displayItems.forEach(el => {
                const item = {
                    label: el.label,
                    type: el.type,
                    price: el.price
                };
                displayItemsArray.push(item);
            });
            transactionInfo['displayItems'] = displayItemsArray;
        }
        if (args.transactionInfo.countryCode) {
            transactionInfo['countryCode'] = args.transactionInfo.countryCode;
        }
        if (args.transactionInfo.transactionId) {
            transactionInfo['transactionId'] = args.transactionInfo.transactionId;
        }
        if (args.transactionInfo.totalPrice) {
            transactionInfo['totalPrice'] = args.transactionInfo.totalPrice;
        }
        if (args.transactionInfo.totalPriceLabel) {
            transactionInfo['totalPriceLabel'] = args.transactionInfo.totalPriceLabel;
        }
        if (args.transactionInfo.checkoutOption) {
            transactionInfo['checkoutOption'] = args.transactionInfo.checkoutOption;
        }
        return transactionInfo;
    }
    _getButtonLayoutId(ctx, buttonType) {
        try {
            const nstudioClassLayout = java.lang.Class.forName(`io.nstudio.googlepay.R$layout`);
            const value = parseInt(String(nstudioClassLayout.getDeclaredField(buttonType).get(null)));
            return value;
        }
        catch (e) {
            console.log('Error getting the google payment button layout from the app resources.', e);
            return null;
        }
    }
    _mapButtonTypeToNativeValue(type) {
        const value = type.toLowerCase();
        switch (value) {
            case GooglePayButtonType.PAY_WHITE.toLowerCase():
                return 'googlepay_white_button';
            case GooglePayButtonType.PAY_WHITE_NO_SHADOW.toLowerCase():
                return 'googlepay_white_button_no_shadow';
            case GooglePayButtonType.BUY_WHITE.toLowerCase():
                return 'buy_with_googlepay_white_button';
            case GooglePayButtonType.BUY_WHITE_NO_SHADOW.toLowerCase():
                return 'buy_with_googlepay_white_button_no_shadow';
            case GooglePayButtonType.PAY_BLACK.toLowerCase():
                return 'googlepay_black_button';
            case GooglePayButtonType.BUY_BLACK.toLowerCase():
                return 'buy_with_googlepay_black_button';
            case GooglePayButtonType.DONATE_BLACK.toLowerCase():
                return 'donate_with_googlepay_black_button';
            default:
                return 'buy_with_googlepay_black_button';
        }
    }
}
GooglePayBtn.tapEvent = 'tap';
GooglePayBtn.TAG = 'GooglePayBtn -';
GooglePayBtn.LOAD_PAYMENT_DATA_REQUEST_CODE = 991;
export const cardNetworksProperty = new Property({
    name: 'cardNetworks',
    defaultValue: '',
    affectsLayout: false
});
cardNetworksProperty.register(GooglePayBtn);
export const authMethodsProperty = new Property({
    name: 'authMethods',
    defaultValue: '',
    affectsLayout: false
});
authMethodsProperty.register(GooglePayBtn);
export const buttonType = new Property({
    name: 'buttonType',
    defaultValue: 'light',
    affectsLayout: false
});
buttonType.register(GooglePayBtn);
var ClickListenerImpl = /** @class */ (function (_super) {
    __extends(ClickListenerImpl, _super);
    function ClickListenerImpl(owner) {
        var _this = _super.call(this) || this;
        _this.owner = owner;
        return global.__native(_this);
    }
    ClickListenerImpl.prototype.onClick = function (v) {
        var _a, _b;
        // Disable the Google Pay payment button.
        // v.setClickable(false);
        (_b = (_a = this.owner) === null || _a === void 0 ? void 0 : _a.get()) === null || _b === void 0 ? void 0 : _b._emit('tap');
    };
    var _a;
    ClickListenerImpl = __decorate([
        Interfaces([android.view.View.OnClickListener]),
        __metadata("design:paramtypes", [typeof (_a = typeof WeakRef !== "undefined" && WeakRef) === "function" ? _a : Object])
    ], ClickListenerImpl);
    return ClickListenerImpl;
}(java.lang.Object));
//# sourceMappingURL=index.android.js.map
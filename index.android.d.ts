import { Property, View } from '@nativescript/core';
import { GooglePayButtonType } from './enums';
import { GooglePayRequest } from './interfaces';
export * from './enums';
export * from './interfaces';
export declare class GooglePayBtn extends View {
    cardNetworks: string;
    authMethods: string;
    buttonType: GooglePayButtonType;
    static tapEvent: string;
    private _android;
    private _androidViewId;
    private _paymentsClient;
    private _nativeBtn;
    private _cardNetworks;
    private _authMethods;
    private static TAG;
    private static LOAD_PAYMENT_DATA_REQUEST_CODE;
    createNativeView(): globalAndroid.widget.FrameLayout;
    initNativeView(): any;
    createPaymentRequest(args: GooglePayRequest): Promise<unknown>;
    private _onActivityResult;
    private static _getIsReadyToPayRequest;
    private _getTransactionInfo;
    private _getButtonLayoutId;
    private _mapButtonTypeToNativeValue;
}
export declare const cardNetworksProperty: Property<GooglePayBtn, string>;
export declare const authMethodsProperty: Property<GooglePayBtn, string>;
export declare const buttonType: Property<GooglePayBtn, string>;

declare const unsigner: (hexUnverifiedTransaction: string) => {
    transaction: any;
    signature: any;
    crypto: any;
    publicKey: any;
    address: any;
};
export default unsigner;

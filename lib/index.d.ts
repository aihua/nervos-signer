declare const sign: ({ privateKey, data, nonce, quota, validUntilBlock, value, version, chainId, to, }: {
    privateKey: string;
    data?: string | undefined;
    nonce: string;
    quota: number;
    validUntilBlock: string | number;
    value?: string | undefined;
    version?: number | undefined;
    chainId: number;
    to?: string | undefined;
}) => any;
export default sign;

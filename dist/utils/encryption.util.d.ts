export declare class EncryptionUtil {
    encrypt(plainTXt: string, saltRounds?: number): Promise<string>;
    compare(plainTXt: string, hash: string): Promise<boolean>;
}

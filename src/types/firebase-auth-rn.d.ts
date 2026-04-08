/**
 * Metro resolves `@firebase/auth` to the RN bundle at runtime; TypeScript does not
 * expose `getReactNativePersistence` on the main entry. This shim types the helper.
 */
declare module '@firebase/auth/dist/rn/index.js' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): any;
}

const globalStore = global as typeof global & {
    emailCodeStore: Map<string, {code: string; expiresAt: number}>
};

if (!globalStore.emailCodeStore) {
    globalStore.emailCodeStore = new Map();
}

export const saveCode = (email: string, code: string) => {
    const expiresAt = Date.now() + 5*60*1000;
    globalStore.emailCodeStore.set(email, {code, expiresAt})
};

export const getCode = (email: string) => globalStore.emailCodeStore.get(email);
export const deleteCode = (email: string) => globalStore.emailCodeStore.delete(email);
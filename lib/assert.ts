function assert(message: string, truthy: any) {
    if (!truthy) {
        throw new Error(message);
    }
}

export default assert;
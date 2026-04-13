export const toTwoDigitHex = (n: number): string => {
    if (!Number.isInteger(n))
        throw new TypeError("Expected an integer");
    if (n < 0 || n > 255)
        throw new RangeError("Number must be between 0 and 255 inclusive");
    return n.toString(16).padStart(2, '0').toLocaleUpperCase();
} 
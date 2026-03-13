export const trimUTC = (dateString: string): Date => {
    return new Date(dateString.slice(0, 23));
} 
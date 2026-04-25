export const generateRandomChatColor = (): string => {
    const possibleColors = [
        "text-timesynq-red",
        "text-timesynq-green",
        "text-timesynq-blue",
    ]
    const randomIndex: number = Math.floor(Math.random() * (possibleColors.length));
    return possibleColors[randomIndex];
}
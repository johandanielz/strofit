export function esUrlYoutubeValida(url: string): boolean {
    const patrones = [
        /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
        /^https?:\/\/youtu\.be\/[\w-]+/,
    ];

    return patrones.some((patron) => patron.test(url));
}
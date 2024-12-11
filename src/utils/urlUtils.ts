export const extractDomain = (url: string): string => {
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
    } catch {
        return '';
    }
};

export const getClearbitLogoUrl = (url: string): string => {
    const domain = extractDomain(url);
    return domain ? `https://logo.clearbit.com/${domain}` : '';
}; 

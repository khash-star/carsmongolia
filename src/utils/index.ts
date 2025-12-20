

export function createPageUrl(pageName: string) {
    // If pageName already contains query parameters (e.g., "CarDetails?id=123"), preserve them
    if (pageName.includes('?')) {
        const [path, query] = pageName.split('?');
        return '/' + path.replace(/ /g, '-') + '?' + query;
    }
    return '/' + pageName.replace(/ /g, '-');
}
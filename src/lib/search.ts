/// Finds up to `max` matching substrings and returns their starting indices
export function findIndices(pat: string, str: string, max: number = 0): number[] {
    let matches: number[] = [], i;

    while((i = str.indexOf(pat, i)) != -1) {
        matches.push(i);
        if(max && matches.length == max) break;
        i += pat.length;
    }

    return matches;
}
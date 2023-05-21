let patterns = require('./data/pywhat_regexes.json');
let fs = require('fs');

patterns = patterns.filter(ident => {
    if(/public\s+key/i.test(ident.Name)) {
        return false;
    }

    if(/(private|secret)(\s+access)?\s+key/i.test(ident.Name)) {
        return true;
    }

    for(let tag of ident.Tags) {
        if(/credentials/i.test(tag) && ident.Rarity > 0.2) {
            return true;
        }

        if(/key|bounty/i.test(tag)) {
            return true;
        }
    }

    return false;
});

let linear_mistakes = [];

for(let mistake of patterns) {
    let re = mistake.Regex.replace(/\^|\$/g, '\\b').replace(/\(\?P(<\w+>)/ig, '(?$1');

    try {
        test_re(re);
    } catch {
        console.log("Error with", mistake.Name);
        continue;
    }

    linear_mistakes.push(mistake.Name, re);
}

fs.writeFileSync("./src/lib/mistakes.json", JSON.stringify(linear_mistakes, null, 4));

function test_re(re) {
    let flags = '';
    if(re.startsWith('(?i)')) {
        flags = 'i';
        re = re.slice('(?i)'.length);
    }

    new RegExp(re, flags);
}
const PASSWORDS = require("./passwords.json");
const { CuckooFilter } = require("bloom-filters");

const fs = require('fs');

const filter = CuckooFilter.from(PASSWORDS, 0.07);

let exported = filter.saveAsJSON();

let fingerprint_length = exported._fingerprintLength;
let size = exported._filter[0]._size;
exported._element_size = size;
for(let e of exported._filter) {
    if(e._size != size) {
        console.error("INVALID ENCODING");
        process.exit(1);
    }

    for(let f of e._elements) {
        if(f && f.length !== fingerprint_length) {
            console.error("INVALID FINGERPRINT LENGTH");
            process.exit(1);
        }
    }
}

let null_fill = '.'.repeat(fingerprint_length);

exported._filter = exported._filter.map((e) => e._elements.map(x => x !== null ? x : null_fill).join('')).join('');

console.log(exported._filter.length);

fs.writeFileSync("filter.json", JSON.stringify(exported));
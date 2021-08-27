import visit from "unist-util-visit";
import { Node } from "unist";
import { findAndReplace } from 'mdast-util-find-and-replace'

const SPOILER_REGEX = /\|\|(.*?)\|\|/g;


// export default function() {
//     return (tree: Node) => {
//         visit(tree, 'paragraph', node => {
//             console.log(node);
//             return;
//
//             /*
//             if(typeof node.value !== 'string') return;
//             if(!SPOILER_REGEX.test(node.value)) return;
//
//             node.type = 'html';
//
//             console.log(node);
//
//             node.value = node.value.replace(SPOILER_REGEX, (_match, p1) => {
//                 return `<span class="spoiler">${p1}</span>`;
//             });
// */
//             //return node as any;
//         });
//
//         return tree;
//     }
// }

function clickSpoiler(e: any) {
    e.preventDefault();
    e.target.classList.add('visible');
    e.target.removeAttribute('title');
    return false;
}

/*
export default function() {
    return (tree: Node) => {
        findAndReplace(tree as any, SPOILER_REGEX, (match: string) => {
            console.log(typeof match, `"${match}"`);

            let replacement = match.slice(2, match.length - 2);

            return {
                type: 'text',
                value: replacement,
                data: {
                    hName: 'span',
                    hProperties: {
                        className: 'spoiler',
                        title: "Spoilered text",
                        onclick: clickSpoiler,
                    },
                    hChildren: [{ type: 'text', value: replacement }]
                }
            }
        });

        return tree;
    }
}
*/
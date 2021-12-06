export interface TrieItem {
    id: number,
    prefix: string,
}

interface TrieNode<T extends TrieItem> {
    matching: Map<number, T>,
    children: Map<string, TrieNode<T>>,
}

const EMPTY = new Map();

export class Trie<T extends TrieItem> {
    root: TrieNode<T> = {
        matching: new Map(),
        children: new Map(),
    };

    insert(item: T) {
        this._insert_on(this.root, item.prefix, item);
    }

    _insert_on(node: TrieNode<T>, suffix: string, item: T) {
        node.matching.set(item.id, item);
        if(suffix.length) {
            let prefix = suffix[0],
                child = node.children.get(prefix);

            if(!child) {
                node.children.set(prefix, child = {
                    matching: new Map(),
                    children: new Map(),
                });
            }

            this._insert_on(child, suffix.slice(1), item);
        }
    }

    find(prefix: string): Map<number, T> {
        return this._find_on(this.root, prefix);
    }

    _find_on(node: TrieNode<T>, suffix: string): Map<number, T> {
        if(suffix) {
            let prefix = suffix[0],
                child = node.children.get(prefix);

            return child ? this._find_on(child, suffix.slice(1)) : EMPTY;
        } else {
            return node.matching;
        }
    }

    delete(item: Pick<T, 'id' | 'prefix'>) {

    }

    num_nodes(): number {
        return this._count_nodes(this.root);
    }

    _count_nodes(node: TrieNode<T>): number {
        let sum = 1;
        for(let child of node.children.values()) {
            sum += this._count_nodes(child);
        }
        return sum;
    }
}
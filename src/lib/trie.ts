import { toCodePoints } from "./unicode";

export interface TrieItem {
    id: number,
}

interface TrieNode<T extends TrieItem> {
    matching: Set<number>,
    children: Map<number, TrieNode<T>>,
}

const EMPTY = new Set<number>();

export class TrieMap<T extends TrieItem> {
    root: TrieNode<T> = {
        matching: new Set(),
        children: new Map(),
    };

    items: Map<number, T> = new Map();

    /// Gets a mapped item by its id number
    get(id: number): T | undefined {
        return this.items.get(id);
    }

    /// Insert all possible suffixes of a prefix, i.e. "cat", "at", "t"
    insert_all_suffixes(prefix: string, item: T) {
        // avoid recomputing these for every character
        let p = toCodePoints(prefix);
        while(p.length) {
            this._insert_on(this.root, p, item);
            p = p.slice(1);
        }
    }

    insert(prefix: string, item: T) {
        this.items.set(item.id, item);

        this._insert_on(this.root, toCodePoints(prefix), item);
    }

    private _insert_on(node: TrieNode<T>, suffix: number[], item: T) {
        node.matching.add(item.id);
        if(suffix.length) {
            let [prefix, ...rest] = suffix,
                child = node.children.get(prefix);

            if(!child) {
                node.children.set(prefix, child = {
                    matching: new Set(),
                    children: new Map(),
                });
            }

            this._insert_on(child, rest, item);
        }
    }

    /// Finds elements with the given prefix and gets their values
    find_items(prefix: string): Array<T> {
        return Array.from(this.find(prefix), id => this.get(id)!);

        //let results = [];
        //for(let id of this.find(prefix)) {
        //    results.push(this.get(id)!);
        //}
        //return results;
    }

    /// Finds elements with the given prefix
    find(prefix: string): Set<number> {
        return this._find_on(this.root, toCodePoints(prefix));
    }

    private _find_on(node: TrieNode<T>, suffix: number[]): Set<number> {
        if(suffix.length) {
            let [prefix, ...rest] = suffix,
                child = node.children.get(prefix);

            return child ? this._find_on(child, rest) : EMPTY;
        } else {
            return node.matching;
        }
    }

    delete(id: number) {
        this._delete_on(this.root, id);
        this.items.delete(id);
    }

    private _delete_on(node: TrieNode<T>, id: number) {
        if(node.matching.has(id)) {
            let cleared: number[] = [];


            for(let [prefix, child] of node.children.entries()) {
                this._delete_on(child, id);

                if(child.matching.size == 0) {
                    cleared.push(prefix);
                }
            }

            node.matching.delete(id);

            if(cleared.length) {
                for(let prefix of cleared) {
                    node.children.delete(prefix);
                }
            }
        }
    }

    size(): number {
        return this._count_nodes(this.root);
    }

    private _count_nodes(node: TrieNode<T>): number {
        let sum = 1; // includes self
        for(let child of node.children.values()) {
            sum += this._count_nodes(child);
        }
        return sum;
    }
}

/*

interface RadixTreeNode<T extends TrieItem> {
    matching: Set<number>,
    children: Map<string, RadixTreeNode<T>>,
}

interface RadixTreeShortNode<T extends TrieItem> {
    prefix: string,
    matching: Set<number>,
}

export class RadixTree<T extends TrieItem> {
    radix: number;

    constructor(radix: number = 4) {
        this.radix = radix;
    }

    root: RadixTreeNode<T> = {
        matching: new Set(),
        children: new Map(),
    };

    short: Array<RadixTreeShortNode<T>> = [];
    sorted: boolean = false;

    items: Map<number, T> = new Map();

    get(id: number): T | undefined {
        return this.items.get(id);
    }

    insert_all_suffixes(prefix: string, item: T) {
        while(prefix) {
            this.insert(prefix, item);
            prefix = prefix.slice(1);
        }
    }

    insert(prefix: string, item: T) {
        this.items.set(item.id, item);
        this._insert_on(this.root, prefix, item);

        if(prefix.length < this.radix) {
            let short = this._find_short(prefix);
            if(!short) {
                this.short.push(short = {
                    prefix,
                    matching: new Set(),
                });
            }

            short.matching.add(item.id);

            this.sorted = false;
        }
    }

    private _insert_on(node: RadixTreeNode<T>, suffix: string, item: T) {
        node.matching.add(item.id);

        if(suffix.length) {
            let prefix = suffix.slice(0, this.radix),
                child = node.children.get(prefix);

            if(!child) {
                node.children.set(prefix, child = {
                    matching: new Set(),
                    children: new Map(),
                });
            }

            this._insert_on(child, suffix.slice(this.radix), item);
        }
    }

    optimize() {
        this.short.sort();
        this.sorted = true;
    }

    find(prefix: string): Set<number> {
        if(prefix.length >= this.radix) {
            return this._find_on(this.root, prefix);
        } else {
            let short = this._find_short(prefix);
            return short ? short.matching : EMPTY;
        }
    }

    private _find_short(prefix: string): undefined | RadixTreeShortNode<T> {
        if(this.sorted) {
            let { idx, found } = binarySearch(this.short, (x) => str_order(prefix, x.prefix));
            return found ? this.short[idx] : undefined;
        } else {
            return this.short.find(x => x.prefix == prefix);
        }
    }

    private _find_on(node: RadixTreeNode<T>, suffix: string): Set<number> {
        if(suffix.length) {
            if(suffix.length < this.radix) {
                let matches: Set<number> = new Set();
                for(let [prefix, child] of node.children.entries()) {
                    if(prefix.startsWith(suffix)) {
                        // merge sets
                        for(let value of child.matching.values()) {
                            matches.add(value);
                        }
                    }
                }

                return matches;
            } else {

                let prefix = suffix.slice(0, this.radix),
                    child = node.children.get(prefix);

                return child ? this._find_on(child, suffix.slice(this.radix)) : EMPTY;

            }
        } else {
            return node.matching;
        }
    }

    size(): number {
        return this._count_nodes(this.root);
    }

    private _count_nodes(node: RadixTreeNode<T>): number {
        let sum = 1; // includes self
        for(let child of node.children.values()) {
            sum += this._count_nodes(child);
        }
        return sum;
    }
}
*/
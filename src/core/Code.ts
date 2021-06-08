export type BlockType = string;

/**
 * Must be a plain JSON serializable object, and can be deep copied!
 */
export interface Block {
    type: BlockType,
    children?: { [name: string]: Block },
    data?: any,
}

const INVALID: Block = {
    children: {},
    type: '__INVALID__'
}


export class LiveBlock {
    parent?: LiveBlock
    data: Block = INVALID;
    children: { [name: string]: LiveBlock } = {}
    onChanged: (() => void)[] = []

    constructor(data: Block, parent?: LiveBlock) {
        this.parent = parent;
        this.setData(data)
    }

    setData(data: Block) {
        if (data === INVALID)
            throw "failed";

        const newChildren: { [name: string]: LiveBlock } = {};

        //diff children
        if (data.children) {
            const oldChildren=this.data.children??{};
            for (const [name, block] of Object.entries(data.children)) {
                if (oldChildren[name] === block) {
                    //reference didn't change, reuse old child
                    newChildren[name] = this.children[name];
                } else {
                    //reference changed, recreate subtree
                    const newChild = new LiveBlock(block, this);

                    //when the child changes, we need to update self as well
                    newChild.onChanged.push(() => {
                        if (this.data === INVALID)
                            throw "failed";

                        this.setData({
                            ...this.data,
                            children: {
                                ...this.data.children,
                                [name]: newChild.data,
                            }
                        })
                    })

                    newChildren[name] = newChild;
                }
            }

            this.children = newChildren;
        }
        this.data = data;
        for (const listener of this.onChanged) {
            listener();
        }
    }


}

export class File {
    root: LiveBlock
    onChange: ((root: Block) => void)[] = []

    constructor(root: Block) {
        this.root = new LiveBlock(root)
        this.root.onChanged.push(() => {
            const data = this.root.data;
            if (data === INVALID)
                throw "failed";
            for (const listener of this.onChange) {
                listener(data);
            }
        })
    }
}

export interface Language {
    root(): Block

    toCode(file: File): string;

    suggestChildren(block: LiveBlock, child: string): Block[]
}
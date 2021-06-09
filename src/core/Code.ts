export type BlockType = string;

/**
 * Must be a plain JSON serializable object, and can be deep copied!
 */
export interface Block {
    type?: BlockType,
    children?: { [name: string]: Block },
    data?: any,
}


export class LiveBlock {
    parent?: LiveBlock
    block: Block = {};
    children: { [name: string]: LiveBlock } = {}
    onChanged: (() => void)[] = []
    file?: LiveFile

    /**
     * Sets the data in this block. Does not call update/setData for children (not deep)
     * Calls update for all ancestors (ensures references are updated)
     * @param data the data to set
     */
    setData(data: Block) {

        const newChildren: { [name: string]: LiveBlock } = {};

        //diff children
        if (data.children) {
            const oldChildren = this.block.children ?? {};
            for (const [name, block] of Object.entries(data.children)) {

                if (oldChildren[name] === block) {
                    //reference didn't change, reuse old child
                    newChildren[name] = this.children[name];
                } else {
                    //reference changed, recreate subtree
                    const newChild = new LiveBlock();
                    newChild.setData(block)
                    newChild.parent = this;
                    newChild.file = this.file;

                    //when the child changes, we need to update self as well
                    newChild.onChanged.push(() => {
                        //if child was changed, then we expect this block to be valid
                        if (!this.block.type )
                            throw new Error("Child of invalid block changed");

                        this.setData({
                            ...this.block,
                            children: {
                                ...this.block.children,
                                [name]: newChild.block,
                            }
                        })
                    })

                    newChildren[name] = newChild;
                }
            }

            this.children = newChildren;
        }
        this.block = data;
        for (const listener of this.onChanged) {
            listener();
        }
    }


}

export class LiveFile {
    root: LiveBlock
    onChange: ((root: Block) => void)[] = []

    constructor() {
        this.root = new LiveBlock()
        this.root.file = this;

        this.root.onChanged.push(() => {
            const data = this.root.block;
            if (!data.type)
                throw new Error("Invalid block changed");
            for (const listener of this.onChange) {
                listener(data);
            }
        })
    }
}

export interface Language {
    root(): Block

    toCode(file: LiveFile): string;

    suggestChildren(block: LiveBlock, child: string): Block[]
}

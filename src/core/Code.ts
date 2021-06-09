export type BlockType = string;

/**
 * Must be a plain JSON serializable object, and can be deep copied!
 */
export interface Block {
    type?: BlockType,
    children?: { [name: string]: Block },
    data?: any,
}

type  LiveBlockChildren = { [name: string]: ILiveBlock };

export interface ILiveBlock {
    readonly parent?: ILiveBlock
    readonly block: Block
    readonly children: LiveBlockChildren;
}


export function makeLive(
    block: Block,
    old?: ILiveBlock,
    parent: ILiveBlock|undefined=old?.parent
): ILiveBlock {

    if (old?.block === block) {
        return old;
    }


    const res: ILiveBlock = {
        children: {},
        block,
        parent,
    };

    let newChildren: LiveBlockChildren = res.children;
    if (block.children) {
        for (const [name, child] of Object.entries(block.children)) {
            newChildren[name] = makeLive(child, old?.children[name], res);
        }
    }

    return Object.freeze(res)
}

export interface Language {

    suggestChildren(block: ILiveBlock, childName: string): Block[]
}

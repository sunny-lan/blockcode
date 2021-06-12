export type BlockType = string;
export type BlockChildren={ [name: string]: Block };
/**
 * Must be a plain JSON serializable object, and can be deep copied!
 */
export interface Block {
    type?: BlockType,
    children?: BlockChildren,
    data?: any,
}

type  LiveBlockChildren = { [name: string]: ILiveBlock };

export interface ILiveBlock {
    readonly parent?: ILiveBlock
    readonly block: Block
    readonly children: LiveBlockChildren;
}

export const Live = {
    setChild(old: ILiveBlock, childName: string, child: ILiveBlock): ILiveBlock {
        const res: ILiveBlock = {
            ...old,
            block: {
                ...old.block,
                children: {
                    ...old.block.children,
                    [childName]: child.block,
                }
            },
            children: {
                ...old.children,
            },
        };
        res.children[childName] = Object.freeze({
            ...child,
            parent: res
        })
        return Object.freeze(res)
    },

    makeLive(
        block: Block,
        old?: ILiveBlock,
        parent: ILiveBlock | undefined = old?.parent
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
                newChildren[name] = Live.makeLive(child, old?.children[name], res);
            }
        }

        return Object.freeze(res)
    }
};


export interface Language {

    allowedChildren(block: ILiveBlock, childName: string): Block[]
}

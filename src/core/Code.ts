export type BlockType = string;

/**
 * Must be a plain JSON serializable object, and can be deep copied!
 */
export interface Block {
    type?: BlockType,
    children?: { [name: string]: Block },
    data?: any,
}


export interface ExtendedBlock extends Block {
    parent?: ExtendedBlock,

}

type LiveBlockChildren = { [name: string]: ILiveBlock };

export interface ILiveBlock {
    parent?: ILiveBlock
    value: Block
    children?: LiveBlockChildren;

    suggestChild(name: string): Block[]
}

export interface Language {
    root(): Block

    toCode(root: ILiveBlock): string;

    update(root: Block): ILiveBlock;
}


export abstract class BaseLanguage implements Language {
    abstract constructLiveBlock(value: Block, children?: LiveBlockChildren): ILiveBlock;

    update(root: Block): ILiveBlock {
        let children: LiveBlockChildren | undefined = undefined;
        if(root.children){

        }
        return this.constructLiveBlock(root, children);
    }

    abstract root(): Block ;

    abstract toCode(root: ILiveBlock): string ;

}

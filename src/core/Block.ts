
export type BlockType = string;
export type BlockChildren={ [name: string]: Block };
/**
 * Must be a plain JSON serializable object, and can be deep copied!
 * All children for the blocktype MUST be existing as keys in children, unless optional
 * Children can be undefined if block has no children
 */
export interface Block {
    type?: BlockType,
    children?: BlockChildren,
    data?: any,
    isArray?:boolean,
}


export interface BlockWithParent extends Block {
    parent: BlockWithParent | undefined
}
export type BlockType = string;
export type BlockChildren={ [name: string]: Block };
/**
 * Must be a plain JSON serializable object, and can be deep copied!
 */
export interface Block {
    type?: BlockType,
    children?: BlockChildren,
    data?: any,
    isArray?:boolean,
}




export interface Language {

    allowedChildren(block: Block, childName: string): Block[]
}

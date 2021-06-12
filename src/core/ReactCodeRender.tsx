import {Block, BlockType} from "~/core/Code";
import * as React from "react";

export interface BlockContextType {
    RenderUnknown: GeneralBlockRender
}
export interface EditorContextType {
    onSelect(value: Block): void,

    selected?: Block,

}
export function withBlockCtx(fn:(ctx:BlockContextType)=>JSX.Element) {
    return <BlockContext.Consumer>{ctx => {
        if (!ctx) throw new Error("Cannot use block outside of blockcontext!!");
        return fn(ctx)
    }}</BlockContext.Consumer>;
}
export const BlockContext = React.createContext<BlockContextType | undefined>(undefined);
export const EditorContext = React.createContext<EditorContextType | undefined>(undefined);

export interface BlockProps {
    block: Block
    onChange: (newRoot: Block) => void

    /**
     * utility method
     * @param name
     * @param newChild
     */
    childOnChange(name:string ,newChild:Block):void
}

export interface BlockRender {
    (block: BlockProps): JSX.Element
}

export interface LanguageRender {
    [blockType: string]: BlockRender
}

export interface RenderProps {
    root: Block ,
    onChange: (newRoot: Block) => void,
}


export type GeneralBlockRender = (props: RenderProps) => JSX.Element;

export function makeRenderer(renderer: LanguageRender): GeneralBlockRender {
    return function render(props: RenderProps): JSX.Element {
        const root = props.root
        const block = root;

        if (!block.type) {

            return <EditorContext.Consumer>
                {context => {
                    const style: any = {};
                    if (context?.selected === root) {
                        style['background'] = 'blue'
                    }
                    return <button
                        onClick={() => context && context.onSelect(block)}
                        style={style}
                        disabled={!context}
                    >
                        empty
                    </button>
                }}
            </EditorContext.Consumer>
        }

        if (!(block.type in renderer))
            throw new Error(`Invalid component to render: ${block.type}`);


        const blockRenderer = renderer[block.type];
        return blockRenderer({
            block,
            onChange:props.onChange,
            childOnChange(name: string, newChild: Block) {
                props.onChange({
                    ...block,
                    children:{
                        ...block.children,
                        [name]:newChild
                    }
                })
            }
        })
    }
}
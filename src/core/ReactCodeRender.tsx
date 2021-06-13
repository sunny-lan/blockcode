import {Block} from "~core/Block";
import * as React from "react";
import {lookupChild2, setChild} from "~core/TreeUtils";
import {arrayLast, arrayLast2} from "~core/Util";

export interface TooltipProps {

}

export interface BlockContextType {
    //RenderUnknown: GeneralBlockRender

    //Tooltip(props: TooltipProps): JSX.Element;

}

export interface EditableProps {
    edit(newValue: Block): void
}

export type Editable = (props: EditableProps) => JSX.Element;

export interface EditorContextType {
    onSelect(path: Block[]): void

    selected?: Block

    
}

export function withBlockCtx(fn: (ctx: BlockContextType) => JSX.Element) {
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

    RenderUnknown: InternalBlockRender
    RenderChild(props:{name:string}):JSX.Element

    /**
     * utility method
     * @param name
     * @param newChild
     */
    childOnChange(name: string, newChild: Block): void

    /**
     * Includes this.block as the last element
     */
    path:Block[]
}

export interface BlockRender {
    (block: BlockProps): JSX.Element
}

export interface LanguageRender {
    [blockType: string]: BlockRender
}
interface InternalRenderProps extends RenderProps{
    /**
     * Includes this.root as last elem. Defaults to [this.root]
     */
    path:Block[]
}
export interface RenderProps {
    root: Block,
    onChange: (newRoot: Block) => void,

}


export type GeneralBlockRender = (props: RenderProps) => JSX.Element;
export type InternalBlockRender = (props: InternalRenderProps) => JSX.Element;

export function makeRenderer(renderer: LanguageRender): GeneralBlockRender {
    function render(props: InternalRenderProps): JSX.Element {

        const root = props.root
        const block = root;
        const path=props.path.concat(root);

        if (!block.type) {
            return <EditorContext.Consumer>
                {context => {
                    const style: React.CSSProperties = {
                        background:'none',
                        border:'none'
                    };
                    if (context?.selected === root) {
                        style.background='blue'
                        style.color='white'
                    }
                    const childName = lookupChild2(arrayLast2(path,2), arrayLast2(path,1));
                    return <button
                        onClick={() => context && context.onSelect(path)}
                        style={style}
                        disabled={!context}
                    >
                        {`<${childName}>`}
                    </button>
                }}
            </EditorContext.Consumer>
        }

        if (!(block.type in renderer))
            throw new Error(`No renderer for block: ${block.type}`);

        function childOnChange(name:string,newChild:Block){
            props.onChange(setChild(block,name,newChild))
        }

        const blockRenderer = renderer[block.type];
        return blockRenderer({
            RenderChild( { name }): JSX.Element {
                if(!block.children)throw new Error('Block has no children!');
                const child=block.children[name]
                return < >{render({
                    root: child,
                    onChange(newChild){
                        childOnChange(name,newChild)
                    },
                    path
                })}</>
            },
            RenderUnknown:render,
            childOnChange,
            onChange:props.onChange,
            block,
            path
        })
    }
    return x=>render({...x,path:[]})
}
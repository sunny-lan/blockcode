import {Block} from "~core/Block";
import * as React from 'react'

export interface RenderProps2 {
    block: Block
    path?:Block[]
}
/**
 * With these props, any Block should be able to render
 */
export interface RenderProps extends RenderProps2{
    /**
     * Does not include {this.block}
     */
    path: Block[]
}

export interface BlockRenderer {
    (props: RenderProps): JSX.Element
}

export interface BlockRenderer2 {
    (props: RenderProps2): JSX.Element
}


export interface LanguageRenderer {
    [blockType: string]: BlockRenderer
}

export interface BlockContextType {
    RenderUnknown: BlockRenderer
}

export interface EditorContextType {
    onSelect(path: Block[]): void

    selected?: Block

    onChange(path: Block[], newValue: Block): void
}


export const BlockContext = React.createContext<BlockContextType | undefined>(undefined);
export const EditorContext = React.createContext<EditorContextType | undefined>(undefined);

export interface OptChildRenderProps {
    block?:Block
    path:Block[]
    childName:string
}

export interface ChildRenderProps extends OptChildRenderProps{
    block:Block
}

export function getChild(props: RenderProps, childName: string):ChildRenderProps {
    const res = getChildOpt(props, childName)
    if (!res.block ) throw new Error(`Child ${childName} doesn't exist on block`);
    return res as ChildRenderProps
}

export function getChildOpt(props: RenderProps, childName: string) :OptChildRenderProps{
    if (!props.block.children)
        throw new Error('Invalid block given. Block has no children');
    return {
        block: props.block.children[childName],
        path: props.path.concat(props.block),
        childName,
    }
}

export function makeRenderer(renderer: LanguageRenderer) :BlockRenderer2{
    function render(props: RenderProps): JSX.Element {

        const root = props.block
        const block = root;
        const path = props.path.concat(root);

        if (!block.type) {
            throw new Error(`Unknown how to render block`);

        }

        if (!(block.type in renderer))
            throw new Error(`No renderer for block: ${block.type}`);

        const blockRenderer = renderer[block.type];
        return blockRenderer({
            block,
            path,

        })
    }

    return (x: RenderProps2) => {
        return <BlockContext.Provider value={{
            RenderUnknown: render
        }}>
            {render({...x, path: x.path ?? []})}
        </BlockContext.Provider>
    }
}
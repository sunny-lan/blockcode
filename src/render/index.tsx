import {Block, BlockWithParent} from "~core/Block";
import * as React from 'react'

export interface RenderProps2<optional extends boolean> {
    block: optional extends true ? undefined : Block
    path?: string[]

    // onChange?(newBlock: Block): void
}

/**
 * With these props, any Block should be able to render
 */
export interface RenderProps<optional extends boolean> extends RenderProps2<optional> {
    /**
     * Does not include {this.block}
     */
    path: string[]

    parent: BlockWithParent|undefined
}

export interface BlockRenderer<optional extends boolean> {
    (props: RenderProps<optional>): JSX.Element
}

export interface BlockRenderer2 {
    (props: RenderProps2<false>): JSX.Element
}


export interface LanguageRenderer {
    [blockType: string]: BlockRenderer<false>
}

export interface BlockContextType {
    RenderUnknown: BlockRenderer<false>
}

export interface SelectionType {
    path: string[],
    block: Block
    parent:BlockWithParent|undefined
}

export interface EditorContextType {
    /**
     *
     * and {path[0]} is the root
     * @param selection
     * @param done Called when update is done
     */
    onSelect(selection?: SelectionType, done?: () => void): void

    selected?: Block

    /**
     *
     * @param path Path to update
     * @param newValue
     */
    onChange(path: string[], newValue: Block): void
}


export const BlockContext = React.createContext<BlockContextType | undefined>(undefined);
export const EditorContext = React.createContext<EditorContextType | undefined>(undefined);

export interface ChildRenderProps<optional extends boolean> extends RenderProps<optional> {
    childName: string
}

export function getChild(props: RenderProps<false>, childName: string): ChildRenderProps<false> {
    const res = getChildOpt(props, childName)
    if (!res.block) throw new Error(`Child ${childName} doesn't exist on block`);
    return res
}

export function getChildOpt2(props: RenderProps<false>, childName: string): ChildRenderProps<true> {
    const res = getChildOpt(props, childName)
    if (res.block) throw new Error(`Child ${childName} shouldn't exist on block`);
    delete res.block
    return res
}

export function getChildOpt(props: RenderProps<false>, childName: string): ChildRenderProps<boolean> {
    if (!props.block.children)
        throw new Error('Invalid block given. Block has no children');
    return {
        block: props.block.children[childName],
        path: props.path.concat(childName),
        childName,
        // onChange: props.onChange && ((newBlock: Block) => {
        //     expectNonNull(props.onChange)
        //     props.onChange(setChild(props.block, childName, newBlock))
        // })
        parent: {
            ...props.block,
            parent:props.parent
        }
    }
}

export function makeRenderer(renderer: LanguageRenderer): BlockRenderer2 {
    function render(props: RenderProps<false>): JSX.Element {

        const block = props.block;

        if (!block.type) {
            throw new Error(`Unknown how to render block`);

        }

        if (!(block.type in renderer))
            throw new Error(`No renderer for block: ${block.type}`);

        const RenderBlock = renderer[block.type];
        return <RenderBlock {...props}/>
    }

    return (props: RenderProps2<false>) => {
        return <BlockContext.Provider value={{
            RenderUnknown: render
        }}>
            {render({
                ...props,
                path: props.path ?? [],
                parent:undefined
            })}
        </BlockContext.Provider>
    }
}
import {Block, BlockType, ILiveBlock, Live} from "./Code";
import * as React from "react";
export interface UpdateableBlock {
    block: ILiveBlock, updateState:(newRoot:ILiveBlock)=>void
}
export interface BlockContextType {
    onSelect(value:UpdateableBlock): void,

    selected?: ILiveBlock,
}

export const BlockContext = React.createContext<BlockContextType | undefined>(undefined);

export interface BlockProps {
    type: BlockType,
    data?: any,
    children: { [name: string]: JSX.Element },
}

export interface BlockRender {
    (block: BlockProps): JSX.Element
}

export interface LanguageRender {
    [blockType: string]: BlockRender
}

export interface RenderProps {
    root: ILiveBlock,
    onChange:(newRoot:ILiveBlock)=>void,
}


export type GeneralBlockRender = (props: RenderProps) => JSX.Element;

export function makeRenderer(renderer: LanguageRender): GeneralBlockRender {
    return function render(props: RenderProps): JSX.Element {
        const root = props.root
        const block = root.block

        if (!block.type) {

            return <BlockContext.Consumer>
                {context => {


                    const style: any = {};
                    if (context?.selected === root) {
                        style['background'] = 'blue'
                    }
                    return <button
                        onClick={() => context && context.onSelect({
                            block:root,
                            updateState:props.onChange,
                        })}
                        style={style}
                        disabled={!context}
                    >
                        empty
                    </button>
                }}
            </BlockContext.Consumer>
        }

        if (!(block.type in renderer))
            throw new Error(`Invalid component to render: ${block.type}`);


        const children: { [name: string]: JSX.Element } = {};
        if (root.children) {

            for (const [name, child] of Object.entries(root.children)) {
                children[name] = (<React.Fragment key={name}>{render({
                    root: child,
                    onChange(newChild){
                        props.onChange(Live.setChild(root, name, newChild))
                    }
                })}</React.Fragment>)
            }
        }

        const blockRenderer = renderer[block.type];
        return blockRenderer({
            children,
            data: block.data,
            type: block.type,
        })
    }
}
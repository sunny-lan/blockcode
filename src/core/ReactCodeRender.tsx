import {Block, BlockType, ILiveBlock} from "~core/Code";
import * as React from "react";

export interface BlockContextType {
    setSelected(block: ILiveBlock): void,

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
                        onClick={() => context && context.setSelected(root)}
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
                //const blockSpecific = props.blockSpecific.children[name];

                children[name] = (<div key={name}>{render({
                    root: child,
                })}</div>)

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
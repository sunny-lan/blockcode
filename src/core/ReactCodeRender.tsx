import {Block, BlockType, ILiveBlock} from "~core/Code";
import * as React from "react";

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

interface GlobalProps {
    selected?: ILiveBlock,
    setSelected(block:ILiveBlock): void
}


export interface RenderProps {
    block: ILiveBlock,
    global: GlobalProps
}

export type GeneralBlockRender = (props: RenderProps) => JSX.Element;

export function makeRenderer(renderer: LanguageRender): GeneralBlockRender {
    return function render(props: RenderProps): JSX.Element {
        const block = props.block

        if (!block.value.type) {
            const style: any = {};
            if (props.global.selected === block) {
                style['background'] = 'blue'
            }
            return <button
                onClick={() => props.global.setSelected(block)}
                style={style}
            >
                empty
            </button>
        }

        if (!(block.value.type in renderer))
            throw new Error(`Invalid component to render: ${block.value.type}`);


        const children: { [name: string]: JSX.Element } = {};
        if (block.children) {

            for (const [name, child] of Object.entries(block.children)) {
                //const blockSpecific = props.blockSpecific.children[name];

                children[name] = render({
                    block: child,
                    global: props.global
                })

            }
        }

        const blockRenderer = renderer[block.value.type];
        return blockRenderer({
            children,
            data: block.value.data,
            type: block.value.type,
        })
    }
}
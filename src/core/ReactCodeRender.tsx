import {Block, BlockType} from "~core/Code";
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

export interface BlockSpecificProps {
    children?: { [name: string]: BlockSpecificProps },
}

interface GlobalProps {
    setSelected(block: Block): void,

    selected?: Block,
}

export interface RenderProps {
    root: Block,
    blockSpecific: BlockSpecificProps,
    global: GlobalProps
}

export type GeneralBlockRender = (props: RenderProps) => JSX.Element;

export function makeRenderer(renderer: LanguageRender): GeneralBlockRender {
    return function render(props: RenderProps): JSX.Element {
        const root = props.root

        if(!root.type){
            const style: any = {};
            if (props.global.selected === root) {
                style['background'] = 'blue'
            }
            return <button
                onClick={() => props.global.setSelected(root)}
                style={style}
            >
                empty
            </button>
        }

        if (!(root.type in renderer))
            throw new Error(`Invalid component to render: ${root.type}`);


        const children: { [name: string]: JSX.Element } = {};
        if (root.children) {

            for (const [name, child] of Object.entries(root.children)) {
                //const blockSpecific = props.blockSpecific.children[name];

                children[name] = render({
                    root: child,
                    blockSpecific:{},
                    global: props.global
                })

            }
        }

        const blockRenderer = renderer[root.type];
        return blockRenderer({
            children,
            data: root.data,
            type: root.type,
        })
    }
}
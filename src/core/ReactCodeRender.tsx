import {Block, BlockType} from "~core/Code";
import {ReactNode} from "react";

export interface BlockProps {
    type: BlockType,
    data?: any,
    children: { [name: string]: ReactNode },
}

export interface BlockRender {
    (block: BlockProps): JSX.Element
}

export interface LanguageRender {
    [blockType: string]: BlockRender
}

export interface RenderProps {
    root: Block
}

export function makeRenderer(renderer: LanguageRender) {
    return function render(props: RenderProps): JSX.Element {
        const root = props.root

        if (!(root.type in renderer))
            throw "fail";

        const defaultChild = "<empty>";

        const children: { [name: string]: ReactNode } = {};
        if (root.children)
            for (const [name, child] of Object.entries(root.children)) {

                children[name] = render({
                    root: child ?? defaultChild,
                });
            }

        const blockRenderer = renderer[root.type];
        return blockRenderer({
            children,
            data: root.data,
            type: root.type,
        })
    }
}
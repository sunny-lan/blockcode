import * as React from 'react';
import {useContext} from 'react';
import {Block} from "~core/Block";
import {BlockContext, ChildRenderProps, EditorContext} from "~render/index";
import {useContext2} from "~core/Util";

export function ChildRenderer(props: ChildRenderProps) {
    const {RenderUnknown} = useContext2(BlockContext)
    if (props.block.type)
        return <RenderUnknown {...props}/>
    else
        return <EmptyBlock {...props}/>
}

export function EmptyBlock(props: ChildRenderProps) {
    const root = props.block, path = props.path;
    const context = useContext(EditorContext)

    const style: React.CSSProperties = {
        background: 'none',
        border: 'none',
        color: 'blue'
    };
    if (context?.selected === root) {
        style.background = 'blue'
        style.color = 'white'
    }
    if (!context)
        style.color = 'gray'
    return <a
        onClick={() => context && context.onSelect(path.concat(root))}
        style={style}
    >
        {`<${props.childName}>`}
    </a>

}
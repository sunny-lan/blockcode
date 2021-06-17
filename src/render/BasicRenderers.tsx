import * as React from 'react';
import {useContext, useEffect} from 'react';
import {Block} from "~core/Block";
import {BlockContext, ChildRenderProps, EditorContext, EditorContextType} from "~render/index";
import {arrayLast2, expectNonNull, useContext2} from "~core/Util";
import {setChild} from "~core/TreeUtils";

/**
 * Renders an arbitrary child, handles if the child is missing
 * Note; doesn't handle when child is undefined
 *
 * @param props
 * @constructor
 */
export function ChildRenderer(props: EmptyBlockProps<false>) {
    const {RenderUnknown} = useContext2(BlockContext)
    if (props.block.type)
        return <RenderUnknown {...props}/>
    else
        return <EmptyBlock {...props}/>
}

export function OptChild(props: EmptyBlockProps<true>) {
    const [virtChild] = React.useState({});
    return <ChildRenderer {...props} block={virtChild} childHint={props.childHint ?? `[${props.childName}]`}/>

}

export function OptionalChild(props: EmptyBlockProps<boolean>) {
    if (props.block) {
        return ChildRenderer(props)
    } else {
        return OptChild(props)
    }
}

export interface EmptyBlockProps<optional extends boolean> extends ChildRenderProps<optional> {
    /**
     * The text displayed to help the user know what this child is supposed to be
     */
    childHint?: string
}

/**
 * Renders the tooltip for a missing block
 * @param props
 * @constructor
 */
export function EmptyBlock(props: EmptyBlockProps<false>) {
    const root = props.block, path = props.path;
    const context = useContext(EditorContext)


    let res: JSX.Element = <>{props.childHint ?? `<${props.childName}>`}</>;

    if (context) {

        const style: React.CSSProperties = {
            background: 'none',
            border: 'none',
            color: 'blue'
        };

        if (context.selected === root) {
            style.background = 'blue'
            style.color = 'white'
        }
        res = <a
            onClick={() => context && context.onSelect({
                path,
                block: props.block,
                parent: props.parent
            })}
            style={style}>{res}</a>
    }

    return res

}
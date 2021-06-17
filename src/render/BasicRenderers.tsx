import * as React from 'react';
import {useContext} from 'react';
import {BlockContext, ChildRenderProps, EditorContext, RenderProps} from "~render/index";
import {expectNonNull, useContext2} from "~core/Util";
import {Hint} from "~hint/index";

/**
 * Renders an arbitrary child, handles if the child is missing
 * Note; doesn't handle when child is undefined
 *
 * @param props
 * @constructor
 */
export function ChildRenderer(props: EmptyBlockProps<false>) :JSX.Element{
    const {RenderUnknown} = useContext2(BlockContext)

    let res;
    if (props.block.type)
        res= <RenderUnknown {...props}/>
    else
        res= <EmptyBlock {...props}/>

    return res
}


export interface SelectifyProps extends RenderProps<false>{
    children:React.ReactNode
}
export function Selectify(props:SelectifyProps) {
    const context=React.useContext(EditorContext)

    function activate() {
        expectNonNull(context)
        context.onSelect(props)
    }

    return <span>
        {props.children}{props.parent && context && <Hint onSelect={activate}/>}
    </span>
}


export function OptChild(props: EmptyBlockProps<true>) {
    const [virtChild] = React.useState({});
    return <ChildRenderer {...props} block={virtChild} childHint={props.childHint ?? `[${props.childName}]`}/>

}

export function OptionalChild(props: EmptyBlockProps<boolean>) {
    if (props.block) {
        return <ChildRenderer {...props}/>
    } else {
        return <OptChild {...props}/>
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
        res = <span
            style={style}>
            {res}
        </span>
    }

    return <Selectify {...props}>{res}</Selectify>

}
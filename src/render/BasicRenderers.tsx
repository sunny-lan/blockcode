import * as React from 'react';
import {BlockContext} from "~render/index";
import {useContext2} from "~core/Util";
import {EmptyBlock, EmptyBlockProps} from "~render/EmptyBlock";

/**
 * Renders an arbitrary child, handles if the child is missing
 * Note; doesn't handle when child is undefined
 *
 * @param props
 * @constructor
 */
export function ChildRenderer(props: EmptyBlockProps<false>): JSX.Element {
    const {RenderUnknown} = useContext2(BlockContext)

    let res;
    if (props.block.type)
        res = <RenderUnknown {...props}/>
    else
        res = <EmptyBlock {...props}/>

    return res
}


export function OptChild(props: EmptyBlockProps<true>) {
    const [virtChild] = React.useState({});
    return <ChildRenderer {...props} block={virtChild} childHint={props.childHint ?? `[${props.childName}]`}/>

}

export function OptionalChild(props: EmptyBlockProps<boolean>) {
    //this should not need a type assert
    if (props.block) {
        return <ChildRenderer {...(props as EmptyBlockProps<false>)}/>
    } else {
        return <OptChild {...(props as EmptyBlockProps<true>)}/>
    }
}


import {OptionalChild} from "~render/BasicRenderers";
import {getChildOpt, RenderProps} from "~render/index";
import * as React from "react";

export interface ArrayBlockProps extends RenderProps<false> {

    Separator?: JSX.Element
    parentStyle?: React.CSSProperties,
    childStyle?: React.CSSProperties,
}

export function ArrayBlock(props: ArrayBlockProps) {
    const block = props.block;
    if (!block.isArray)
        throw new Error(`Expected block to be array`);

    const children = block.children;
    if (!children) throw new Error('Expected child to have elements');


    const len = Object.keys(children).length;
    const elems = [];
    for (let i = 0; i <= len; i++) {
        if (i > 0)
            if (props.Separator)
                elems.push(props.Separator)
        elems.push(<React.Fragment key={i}><OptionalChild {...getChildOpt(props, i.toString())}/></React.Fragment>)
    }

    return <>{elems}</>
}
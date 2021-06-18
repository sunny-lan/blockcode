import {ChildRenderProps, EditorContext} from "~render/index";
import * as React from "react";
import {Selectify} from "~render/Selectify";

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
    const context = React.useContext(EditorContext)


    const style: React.CSSProperties = {
        background: 'none',
        border: 'none',
        color: 'grey'
    };


    if (context) {
        style.color = 'blue';
    }

    return <Selectify {...props}>
        <span style={style}>
            {props.childHint ?? `<${props.childName}>`}
        </span>
    </Selectify>

}
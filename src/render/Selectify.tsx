import {EditorContext, RenderProps} from "~render/index";
import {expectNonNull} from "~core/Util";
import {Hint} from "~hint/index";
import * as React from "react";

export interface SelectifyProps extends RenderProps<false> {
    children: React.ReactNode
}

export function Selectify(props: SelectifyProps) {
    const context = React.useContext(EditorContext)

    function activate() {
        expectNonNull(context)
        context.onSelect(props)
    }

    const style:React.CSSProperties={}
    // const substyle:React.CSSProperties={}

    if(context?.selected===props.block){
        // substyle.filter='invert(1)'
        style.background='lightgreen'
    }

    return <span style={style}>
        {/*<span style={substyle}>*/}
        {props.children}{props.parent && context && <Hint onSelect={activate}/>}
        {/*</span>*/}
    </span>
}
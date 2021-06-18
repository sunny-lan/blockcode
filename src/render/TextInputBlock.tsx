import {EditorContext, RenderProps} from "~render/index";
import * as React from "react";
import {useState} from "react";
import {expectNonNull} from "~core/Util";
import {Selectify} from "~render/Selectify";

export interface TextBlockProps extends RenderProps<false> {
    defaultText?:string
}

export default function TextInputBlock(props: TextBlockProps) {
    const ctx = React.useContext(EditorContext)
    const [currentText, setCurrentText] = useState<string>();

    let enableTextbox = false;
    if (ctx) {
        enableTextbox = ctx.selected === props.block;
    }

    let output = props.block.data??props.defaultText;
    if (enableTextbox) {
        const txt=currentText ?? output;
        output = <input
            style={{width:`${txt.length}ch`}}
            autoFocus
            value={txt}
            onChange={evt => setCurrentText(evt.target.value)}
            onBlur={() => {
                //for performance, only update actual tree on focus lost
                expectNonNull(ctx)
                ctx.onChange(props.path, {
                    ...props.block,
                    data: txt
                })

                setCurrentText(undefined)
                ctx.onSelect()
            }}
        />;
    }else{
        output=<Selectify {...props} >{output}</Selectify>
    }

    return <>
        {output}
    </>;
}
import {lookupChild2} from "~core/TreeUtils";
import {arrayLast2} from "~core/Util";
import {BlockProps, EditorContext} from "~core/ReactCodeRender";
import * as React from 'react';
import {Block} from "~core/Block";

export interface EmptyBlockProps{
    block?:Block
    childName?:string

    /**
     * Doesn't? include block itself
     */
    path:Block[]


}
export default function EmptyBlockRenderer(props:EmptyBlockProps){
    let root=props.block,path=props.path;

    return <EditorContext.Consumer>
        {context => {
            const style: React.CSSProperties = {
                background:'none',
                border:'none',
                color:'blue'
            };
            if (context?.selected === root) {
                style.background='blue'
                style.color='white'
            }
            if(!context)
                style.color='gray'
            return <a
                onClick={() => context && context.onSelect(path)}
                style={style}
            >
                {`<${props.childName}>`}
            </a>
        }}
    </EditorContext.Consumer>
}
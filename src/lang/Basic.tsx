import {BlockProps, BlockRender, LanguageRender} from "~core/ReactCodeRender";
import {parseTemplate, parseTemplateParam} from "../core/Util";
import * as React from "react";

export function fromTemplate(template: string): BlockRender {
    const tokens = parseTemplate(template)

    return function (block: BlockProps) {
        const ans1: (string | JSX.Element)[] = tokens.map(token => {
            if (token.isTemplate) {
                const parsed = parseTemplateParam(token.value);
                if (parsed.name in block.children) {
                    let res= block.children[parsed.name];
                    if('inline' in parsed.params)
                        res=<span>{res}</span>

                    return res;
                }else
                    throw new Error(`Missing child '${parsed.name}' in block '${block.type}'`);
            }
            return token.value;
        });
        return <React.Fragment>
            {ans1}
        </React.Fragment>
    }
}

export const Basic: LanguageRender = {
    "statements": function (block: BlockProps) {
        const ans: JSX.Element[] = [];
        for (let i = 0; i < Object.keys(block).length; i++) {
            ans.push(<div>{block.children[i.toString()]}</div>);
        }
        return <div>{ans}</div>;
    }
}
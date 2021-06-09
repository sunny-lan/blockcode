import {BlockProps, BlockRender, LanguageRender} from "~core/ReactCodeRender";
import {parseTemplateString} from "../core/Util";
import * as React from "react";

export function fromTemplate(template: string): BlockRender {
    const tokens = parseTemplateString(template)

    return function (block: BlockProps) {
        const ans1: (string | JSX.Element)[] = tokens.map(token => {
            if (token.isTemplate) {
                if (token.value in block.children)
                    return block.children[token.value];
                else
                    throw new Error(`Missing child '${token.value}' in block '${block.type}'`);
            }
            return token.value;
        });
        return <pre>
            {ans1}
        </pre>
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
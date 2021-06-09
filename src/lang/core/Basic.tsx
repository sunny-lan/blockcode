import {BlockProps, BlockRender, LanguageRender} from "~core/ReactCodeRender";
import * as React from "react";

export function fromTemplate(template: string): BlockRender {
    enum State {
        Normal,
        Template1,
        Template2,
    }

    let state: State = State.Normal;
    let token = '';
    let escape = false;
    type Token = {
        isTemplate: boolean,
        value: string,
    }
    const tokens: Token[] = [];

    for (let i = 0; i < template.length; i++) {
        const char = template[i];
        if (escape) {
            token += char;
            escape = false;
        } else {
            if (char === '\\') {
                escape = true;
            } else {
                if (char === '$' && state === State.Normal)
                    state = State.Template1;
                else if (char === '}' && state === State.Template2) {
                    tokens.push({
                        value: token,
                        isTemplate: true,
                    })
                    token = '';
                    state = State.Normal;
                } else if (state === State.Template1) {
                    if (char === '{') {
                        state = State.Template2;
                        tokens.push({
                            value: token,
                            isTemplate: false,
                        })
                        token = '';
                    } else {
                        state = State.Normal;
                        token += '{' + char;
                    }
                } else {
                    token += char;
                }
            }
        }
    }

    if (token.length > 0)
        tokens.push({
            value: token,
            isTemplate: false,
        })

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
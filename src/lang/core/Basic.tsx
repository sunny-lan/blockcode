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
    type d = {
        x: boolean,
        s: string,
    }
    const ans: d[] = [];

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
                    ans.push({
                        s: token,
                        x: true,
                    })
                    token = '';
                    state = State.Normal;
                } else if (state === State.Template1) {
                    if (char === '{') {
                        state = State.Template2;
                        ans.push({
                            s: token,
                            x: false,
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
    ans.push({
        s: token,
        x: true,
    })

    return function (block: BlockProps) {
        const ans1: (string | JSX.Element)[] = ans.map(x => x.x ? block.children[x.s] : x.s);
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
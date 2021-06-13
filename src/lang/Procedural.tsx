import {LanguageRender} from "~/core/ReactCodeRender";
import * as React from "react";
import {BlockDef, fromBlockTemplates, fromTemplate, makeSequenceDef} from "~/lang/Basic";

import {LanguageProvider} from "~core/Lang2";

enum Tags {
    expression = 'expression',
    statement = 'statement',

}

enum Types {
    boolean = 'boolean'
}


const blockDefs: BlockDef[] = [
    makeSequenceDef({
        type: 'statements',
        childSpec: {
            tag: Tags.statement,
        },
        info: {}
    }),
    {
        type: 'codeblock',
        children: {
            statements: {
                types: ['statements']
            }
        },
        info: {
            tag: Tags.statement,
        },
    },
    {
        type: 'if',
        children: {
            condition: {
                tag: Tags.expression,
                type: Types.boolean,
            },
            code: {
                tag: Tags.statement
            }
        },
        info: {
            tag: Tags.statement,
        }
    },
    {
        type: 'comparison',
        children: {
            lhs: {
                tag: Tags.expression,
            },
            rhs: {
                tag: Tags.expression,
            }
        },
        info: {
            tag: Tags.expression,
            type: Types.boolean,
        }
    },
    {
        type: 'hello',
        info: {
            tag: Tags.statement
        }
    }
];

const impl = fromBlockTemplates(blockDefs);
export const ProceduralLang: LanguageProvider = impl;
export const ProceduralRender: LanguageRender = {
    codeblock: fromTemplate("\\{${statements|array,separator:\n}\\}"),
    if: fromTemplate("if(${condition})${code}"),
    hello: fromTemplate("print('hi')"),
    comparison: fromTemplate("${lhs}==${rhs}"),
}

/*
    "statements":
    */
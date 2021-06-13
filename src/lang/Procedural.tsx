import {LanguageRender} from "~/core/ReactCodeRender";
import * as React from "react";
import {BlockDef, fromBlockTemplates, fromTemplate, makeSequenceDef} from "~/lang/Basic";
import {Language} from "~/core/Code";

enum Tags {
    expression = 'expression',
    statement = 'statement',

}

 enum Types {
    boolean = 'boolean'
}


const blockDefs: BlockDef[] = [
    makeSequenceDef({
        type:'codeblock',
        childSpec:{
            tag:Tags.statement,
        },
        info:{
            tag:Tags.statement,
        }
    }),
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
export const ProceduralLang: Language = impl;
export const ProceduralRender: LanguageRender = {

    if: fromTemplate("if(${condition})${code}"),
    hi: fromTemplate("print('hi')"),
    comparison: fromTemplate("${lhs}==${rhs}"),
}

/*
    "statements":
    */
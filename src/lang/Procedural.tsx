import * as React from "react";
import {BlockDefs, fromBlockTemplates, fromTemplate, makeSequenceDef} from "~/lang/Basic";
import {BlockRenderer, LanguageRenderer} from "~render";
import {expectNonNull} from "~core/Util";

enum Tags {
    expression = 'expression',
    statement = 'statement',
    type='type',
}

enum Declaration{
    function='function',
    variable='variable'
}

enum Types {
    boolean = 'boolean'
}


const defList = {
    nameDef:{
        type:'nameDef',
        info:{}
    },
    varDecl:{
        type:'varDecl',
        info:{
            declaration: Declaration.variable
        },
        children:{
            name:['nameDef']
        }
    },
    argDeclList:makeSequenceDef({
        type: 'argDeclList',
        childSpec: {
            declaration:Declaration.variable
        },
        info: {}
    }),
    functiondef:{
        type:'functiondef',
        children:{
            returnType:{
                tag:Tags.type,
            },
            name:{
                types:['nameDef']
            },
            args:{
                types:['argDeclList']
            },
            body:{
                types:['codeblock']
            }
        },
        info:{
            declaration:Declaration.function,
        },
    },
    statements:makeSequenceDef({
        type: 'statements',
        childSpec: {
            tag: Tags.statement,
        },
        info: {}
    }),
    codeblock:{
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
    if:{
        type: 'if',
        children: {
            condition: {
                tag: Tags.expression,
                type: Types.boolean,
            },
            code: {
                types: ['codeblock']
            }
        },
        info: {
            tag: Tags.statement,
        }
    },
    comparison:{
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
    hello:{
        type: 'hello',
        info: {
            tag: Tags.statement
        }
    }
};
const blockDefs:BlockDefs=defList;

export const ProceduralBlockDefs=defList;
const impl = fromBlockTemplates(defList);
export const ProceduralLang = impl;

export function parenExpression(Wrapped: BlockRenderer<false>): BlockRenderer<false> {
    return props => {
        let child = Wrapped(props)
        const len=props.path.length;
        if(len>1){
            const parent=props.parent;
            expectNonNull(parent)
            if(!parent.type)throw new Error('parent of block has no type!');
            if(blockDefs[parent.type].info.tag === Tags.expression)
                child=<span>({child})</span>;
        }
        return child;
    }
}

export const ProceduralRender: LanguageRenderer = {
    codeblock: fromTemplate("\\{${statements|array,indent,separator:\n}\\}"),
    varDecl: fromTemplate("var ${name|textbox:name}"),
    nameDef: fromTemplate("tmp_nameDef"),
    functiondef: fromTemplate(
        "${returnType} ${name}(${args|array,horizontal,separator: })${body}"),
    if: fromTemplate("if(${condition})${code}"),
    hello: fromTemplate("print('hi')"),
    comparison:   parenExpression(fromTemplate("${lhs}==${rhs}")),
}

/*
    "statements":
    */
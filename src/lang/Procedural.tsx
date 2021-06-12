import {BlockProps, BlockRender, LanguageRender} from "~core/ReactCodeRender";
import * as React from "react";
import {fromTemplate} from "./Basic";
import {Block, BlockChildren, BlockType, ILiveBlock, Language} from "~core/Code";

export enum Tags {
    expression = 'expression',
    statement = 'statement',

}

export enum Types {
    boolean = 'boolean'
}

export interface BlockSpec {
    tag?: Tags
    type?: Types
}

export interface BlockDef {
    type: BlockType,
    render: BlockRender,
    children?: {
        [name: string]: BlockSpec
    },
    info: BlockSpec
}

const blockDefs:BlockDef[] = [
    {
        type: 'if',
        render: fromTemplate("if(${condition})${code}"),
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
        render: fromTemplate("${lhs}==${rhs}"),
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
        render: fromTemplate("print('hi')"),
        info: {
            tag: Tags.statement
        }
    }
];

function fromBlockTemplates(defs:BlockDef[]) {
    const basicTempl:Block[]=defs.map(def=>{
        let children:BlockChildren|undefined;
        if(def.children){
            children={};
            for(const name of Object.keys(def.children)){
                children[name]={};
            }
        }
        return {
            type:def.type,
            children,

        }
    })
    function additionalBlocks(block: ILiveBlock, childName: string):Block[]{
        return []
    }
    return function allowedChildren(block: ILiveBlock, childName: string): Block[] {
        return []
    }
}

export const ProceduralLang: Language = {
    allowedChildren:fromBlockTemplates(blockDefs)

};
export const ProceduralRender: LanguageRender = {
    "if": fromTemplate("if(${condition})${code}"),
    "hello": fromTemplate(`print("hello");`),
    "statements": function (block: BlockProps) {
        const ans: JSX.Element[] = [];
        for (let i = 0; i < Object.keys(block).length; i++) {
            ans.push(<div>{block.children[i.toString()]}</div>);
        }
        return <div>{ans}</div>;
    }
};
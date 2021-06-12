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

    [name: string]: any
}

export type ChildDef = {
    [name: string]: BlockSpec
} | ((childName: string, block: Block, blockDef: BlockDef) => boolean);

export interface BlockDef {
    type: BlockType,
    render: BlockRender,
    children?: ChildDef,
    info: BlockSpec
}


const blockDefs: BlockDef[] = [
    {
        type: 'codeblock',
        render(block: BlockProps) {
            const ans: JSX.Element[] = [];
            for (let i = 0; i < Object.keys(block).length; i++) {
                ans.push(<div>{block.children[i.toString()]}</div>);
            }
            return <div>{"{"}{ans}{"}"}</div>;
        },
        children(childName, block, blockDef): boolean {
            const num = Number.parseInt(childName);
            if (Number.isNaN(num))
                throw new Error(`Invalid child codeblock: ${childName}`);
            return blockDef.info.tag === Tags.statement;
        },
        info: {
            tag: Tags.statement,
        }
    },
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

function fromBlockTemplates(defs: BlockDef[]) {
    const blockDefs: { [name: string]: BlockDef } = {};
    const render: LanguageRender = {};
    const basicTempl: Block[] = defs.map(def => {
        let children: BlockChildren | undefined;
        if (def.children) {
            children = {};
            for (const name of Object.keys(def.children)) {
                children[name] = {};
            }
        }
        render[def.type] = def.render;
        blockDefs[def.type] = def;
        return {
            type: def.type,
            children,

        }
    });


    function additionalBlocks(block: ILiveBlock, childName: string): Block[] {
        return []
    }


    return {
        render,
        allowedChildren(block: ILiveBlock, childName: string): Block[] {

            if (!block.block.type) return [];
            const def = blockDefs[block.block.type];
            if (!def.children)
                throw new Error('Block expected to have child');
            const defChildren = def.children;
            const allSuggestions = basicTempl.concat(additionalBlocks(block, childName));


            return allSuggestions.filter(suggestion => {
                if (!suggestion.type)
                    throw new Error('Proposed block must have a type');
                const suggestionDef = blockDefs[suggestion.type];

                if (typeof defChildren === 'function') {
                    return defChildren(childName, suggestion, suggestionDef);
                } else {
                    for (const [name, requirement] of Object.entries(defChildren[childName])) {
                        if (suggestionDef.info[name] !== requirement)
                            return false;
                    }
                    return true;
                }
            })
        }
    }
}

const impl = fromBlockTemplates(blockDefs);
export const ProceduralLang: Language = impl;
export const ProceduralRender: LanguageRender = impl.render;

/*
    "statements":
    */
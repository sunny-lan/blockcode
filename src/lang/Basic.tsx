import {BlockContext, BlockProps, BlockRender, LanguageRender} from "~/core/ReactCodeRender";
import {parseTemplate, parseTemplateParam} from "~/core/Util";
import * as React from "react";
import {Block, BlockChildren, BlockType, ILiveBlock} from "~/core/Code";

export function fromTemplate(template: string): BlockRender {
    const tokens = parseTemplate(template)

    return function (props: BlockProps) {
        const block = props.block;
        const ans1: (string | JSX.Element)[] = tokens.map(token => {
            if (token.isTemplate) {
                if (!block.children)
                    throw new Error("Block missing children");
                const parsed = parseTemplateParam(token.value);
                if (parsed.name in block.children) {
                    const child = block.children[parsed.name];
                    let res = <BlockContext.Consumer>{ctx => {
                        if (!ctx) throw new Error("d");
                        return ctx.RenderUnknown({
                            root: child,
                            onChange: x => props.childOnChange(parsed.name, x)
                        })
                    }}</BlockContext.Consumer>;
                    if ('inline' in parsed.params)
                        res = <span>{res}</span>

                    return res;
                } else
                    throw new Error(`Missing child '${parsed.name}' in block '${block.type}'`);
            }
            return token.value
        });
        return <React.Fragment>
            {ans1}
        </React.Fragment>
    }
}

export enum BasicTags {
    sequence = 'sequence'
}

export interface BlockSpec {
    types?: BlockType[]

    [name: string]: any
}

export interface ChildrenDefFn {
    (childName: string, block: Block, blockDef: BlockDef): boolean
}

export type ChildDef = {
    [name: string]: BlockSpec
} | ChildrenDefFn;

export interface BlockDef {
    type: BlockType,
    children?: ChildDef,
    info: BlockSpec,
    isArray?: boolean,
}

function checkBlock(blockDef: BlockDef, spec: BlockSpec): boolean {
    const allowedTypes = spec.types;
    if (allowedTypes)
        if (!allowedTypes.includes(blockDef.type))
            return false;
    for (const [name, requirement] of Object.entries(spec)) {
        if (blockDef.info[name] !== requirement)
            return false;
    }
    return true;
}

export interface SequenceDef {
    type: BlockType,
    info: BlockSpec,
    childSpec: BlockSpec,
    separator?: JSX.Element
}

export function makeSequenceDef({childSpec, info, type, separator}: SequenceDef): BlockDef {

    return {
        type,
        children(childName, block, blockDef): boolean {
            const num = Number.parseInt(childName);
            if (Number.isNaN(num))
                throw new Error(`Invalid child codeblock: ${childName}`);
            return checkBlock(blockDef, childSpec)
        },
        info,
        isArray: true,

    }
}

export function fromBlockTemplates(defs: BlockDef[]) {
    const blockDefs: { [name: string]: BlockDef } = {};
    const basicTempl: Block[] = defs.map(def => {
        let children: BlockChildren | undefined;
        if (def.children) {
            children = {};
            for (const name of Object.keys(def.children)) {
                children[name] = {};
            }
        }
        blockDefs[def.type] = def;
        return {
            type: def.type,
            children,
            isArray: def.isArray,
        }
    });


    function additionalBlocks(block: ILiveBlock, childName: string): Block[] {
        return []
    }


    return {
        allowedChildren(block: ILiveBlock, childName: string): Block[] {

            if (!block.block.type) return [];
            const def = blockDefs[block.block.type];
            if (!def.children)
                throw new Error('Block expected to have child');
            const spec = def.children;
            const allSuggestions = basicTempl.concat(additionalBlocks(block, childName));


            return allSuggestions.filter(suggestion => {
                if (!suggestion.type)
                    throw new Error('Proposed block must have a type');
                const suggestionDef = blockDefs[suggestion.type];

                if (typeof spec === 'function') {
                    return spec(childName, suggestion, suggestionDef);
                } else {
                    return checkBlock(suggestionDef, spec[childName]);
                }
            });
        }
    }
}

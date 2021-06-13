import {BlockProps, BlockRender} from "~/core/ReactCodeRender";
import {arrayLast, parseTemplate, parseTemplateParam} from "~/core/Util";
import * as React from "react";
import {Block, BlockChildren, BlockType} from "~/core/Code";
import {ILiveBlock} from "~core/DocumentUtils";
import {LanguageProvider} from "~core/Lang2";
import {lookupChild, lookupChild2} from "~core/TreeUtils";

export function fromTemplate(template: string): BlockRender {
    const tokens = parseTemplate(template)

    return function (props: BlockProps) {
        const ans1: (string | JSX.Element)[] = tokens.map(token => {
            if (token.isTemplate) {
                const parsed = parseTemplateParam(token.value);
                if (parsed.name in props.children) {
                    let res = props.children[parsed.name];
                    if ('inline' in parsed.params)
                        res = <span>{res}</span>
                    return res;
                } else
                    throw new Error(`Template: Missing child '${parsed.name}' in block '${props.block.type}'`);
            }
            return token.value
        });
        return <>
            {ans1}
        </>
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
}

export function makeSequenceDef({childSpec, info, type,}: SequenceDef): BlockDef {

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

export function makeSequenceRenderer(separator: JSX.Element, start?: JSX.Element, end?: JSX.Element): BlockRender {
    return function (props) {
        const list: JSX.Element[] = [];
        const block = props.block;

        return <>{start}{list}{end}</>
    }
}

export function fromBlockTemplates(defs: BlockDef[]): LanguageProvider {
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


    function additionalBlocks(path: Block[], childName: string): Block[] {
        return []
    }

    function suggestInternal(block: Block, childName: string, path: Block[]): Block[] {
        if (!block.type) return [];
        const def = blockDefs[block.type];
        if (!def.children)
            throw new Error('Block expected to have child');
        const spec = def.children;
        const allSuggestions = basicTempl.concat(additionalBlocks(path, childName));


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

    return {
        suggest(path: Block[]): Block[] {
            const block = arrayLast(path);
            if (!block) throw new Error("tried to suggest on null block");
            if (path.length - 1 < 0) throw new Error("No parent in block");
            const parent = path[path.length - 2];
            return suggestInternal(parent, lookupChild2(parent, block), path)
        }

    }
}

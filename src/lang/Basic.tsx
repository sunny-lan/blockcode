import {arrayLast, ParsedParams, parseTemplate, parseTemplateParam, Token, useContext2} from "~/core/Util";
import * as React from "react";
import {lookupChild2, setChild} from "~core/TreeUtils";
import {Block, BlockChildren, BlockType} from "~core/Block";
import {useContext} from "react";
import {BlockContext, EditorContext, RenderProps, getChild, BlockRenderer, getChildOpt, getChildOpt2} from "~/render";
import {ChildRenderer, OptChild, OptionalChild} from "~render/BasicRenderers";

export interface ArrayBlockProps extends RenderProps<false> {

    Separator?: JSX.Element
    parentStyle?: React.CSSProperties,
    childStyle?: React.CSSProperties,
}

export function ArrayBlock(props: ArrayBlockProps) {
    const block = props.block;
    if (!block.isArray)
        throw new Error(`Expected block to be array`);

    const children = block.children;
    if (!children) throw new Error('Expected child to have elements');



    const len = Object.keys(children).length;
    const elems = [];
    for (let i = 0; i <= len; i++) {
        if (i > 0)
            if (props.Separator)
                elems.push(props.Separator)
        elems.push(<OptionalChild {...getChildOpt(props, i.toString())}/>)
    }

    return <>{elems}</>
}

export function fromTemplate(template: string): BlockRenderer<false> {
    const tokens: [Token, ParsedParams?][] = parseTemplate(template).map(token => {
        if (token.isTemplate) return [token, parseTemplateParam(token.value)]
        return [token]
    })


    return function (props: RenderProps<false>): JSX.Element {
        function renderToken([token, _params]: [Token, ParsedParams?]) {
            if (token.isTemplate) {
                const params = _params as ParsedParams
                const children = props.block.children;
                if (!children) throw new Error('expected children');

                if (params.name in children) {
                    const child = getChild(props, params.name)
                    let res;
                    if ('array' in params.params) {

                        const separator = <>{params.params.separator}</>;
                        res = <span style={{
                            display: ('horizontal' in params.params) ? 'flex-inline' : 'flex',
                            flexDirection: ('horizontal' in params.params) ? 'row' : 'column',
                            alignItems: params.params['align'] ?? 'flex-start',
                            marginLeft: ('indent' in params.params) ? '10px' : '0'
                        }} key={params.name}>
                            <ArrayBlock
                                {...child}
                                Separator={separator}
                            />
                        </span>
                    } else {
                        res = <ChildRenderer {...child}/>
                    }

                    return res;
                } else {
                    throw new Error(`Template: Missing child '${params.name}' in block '${props.block.type}'`);
                }
            }
            return token.value
        }

        return <span>
            {tokens.map(renderToken)}
        </span>
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
        if (!(name in blockDef.info)) return false;
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

export type BlockDefs = { [name: string]: BlockDef };


export function fromBlockTemplates(blockDefs: BlockDefs) {


    function hydrate(def: BlockDef) {
        let children: BlockChildren | undefined;
        if (def.children) {

            children = {};
            if (typeof def.children !== 'function')
                for (const [name, spec] of Object.entries(def.children)) {
                    if (spec.types?.length === 1) {
                        children[name] = hydrate(blockDefs[spec.types[0]])
                    } else
                        children[name] = {};
                }
        }

        return {
            type: def.type,
            children,
            isArray: def.isArray,
        }
    }

    const basicTempl: Block[] = Object.values(blockDefs).map(hydrate);


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

        let a = allSuggestions.filter(suggestion => {
            if (!suggestion.type)
                throw new Error('Proposed block must have a type');
            const suggestionDef = blockDefs[suggestion.type];

            if (typeof spec === 'function') {
                return spec(childName, suggestion, suggestionDef);
            } else {
                return checkBlock(suggestionDef, spec[childName]);
            }
        });
        return a;
    }

    return {
        hydrate,
        suggest(path: Block[]): Block[] {
            const block = arrayLast(path);
            if (!block) throw new Error("tried to suggest on null block");
            if (path.length - 1 < 0) throw new Error("No parent in block");
            const parent = path[path.length - 2];
            return suggestInternal(parent, lookupChild2(parent, block), path)
        }

    }
}

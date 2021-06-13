import {BlockProps, BlockRender} from "~/core/ReactCodeRender";
import {arrayLast, parseTemplate, parseTemplateParam, Token} from "~/core/Util";
import * as React from "react";
import {LanguageProvider} from "~core/Lang2";
import {lookupChild2, setChild} from "~core/TreeUtils";
import {Block, BlockChildren, BlockType} from "~core/Block";

export interface ArrayBlockProps extends BlockProps {

    Separator?: JSX.Element
}

export function ArrayBlock(props: ArrayBlockProps) {
    const child = props.block;
    if (!child.isArray) throw new Error(`Expected block to be array`);
    const elems = [];
    const arr = child.children;
    if (!arr) throw new Error('Expected child to have elements');
    for (let i = 0; i < Object.keys(arr).length; i++) {
        if (props.Separator)
            if (i > 0) elems.push(props.Separator)

        elems.push(<props.RenderUnknown
            key={i}
            onChange={newElem => {
                props.onChange(setChild(
                    child,
                    i.toString(),
                    newElem
                ))
            }}
            root={arr[i]}
            path={props.path.concat(arr[i])}
        />)
    }
    return <>{elems}</>
}

export function fromTemplate(template: string): BlockRender {
    const tokens = parseTemplate(template)


    return function (props: BlockProps) {
        function renderToken(token: Token) {
            if (token.isTemplate) {
                const parsed = parseTemplateParam(token.value);
                const children = props.block.children;
                if (!children) throw new Error('expected chilren');

                if (parsed.name in children) {
                    const child = children[parsed.name]
                    let res;
                    console.log(parsed)
                    if ('array' in parsed.params) {
                        res=<ArrayBlock
                            block={child}
                            onChange={newArr=>props.childOnChange(parsed.name, newArr)}
                            path={props.path.concat(child)}
                            RenderUnknown={props.RenderUnknown}
                            RenderChild={props.RenderChild}
                            childOnChange={undefined}
                            Separator={parsed.params.separator}
                        />
                    } else {
                        res = <props.RenderChild key={parsed.name} name={parsed.name}/>
                    }

                    return res;
                } else
                    throw new Error(`Template: Missing child '${parsed.name}' in block '${props.block.type}'`);
            }
            return token.value
        }

        return <>
            {tokens.map(renderToken)}
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
    console.log('aa', blockDef, spec)
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

export function makeSequenceRenderer(separator: JSX.Element, start?: JSX.Element, end?: JSX.Element): BlockRender {
    return function (props) {
        const list: JSX.Element[] = [];
        const block = props.block;

        return <>{start}{list}{end}</>
    }
}

export function fromBlockTemplates(defs: BlockDef[]): LanguageProvider {

    const blockDefs: { [name: string]: BlockDef } = {};
    defs.forEach(def => blockDefs[def.type] = def)

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

    const basicTempl: Block[] = defs.map(hydrate);


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
        console.log(block, childName, allSuggestions, spec)

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
        console.log('ret ', a)
        return a;
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

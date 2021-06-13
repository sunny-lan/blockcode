import {BlockProps, BlockRender, EditorContext, InternalBlockRender} from "~/core/ReactCodeRender";
import {arrayLast, ParsedParams, parseTemplate, parseTemplateParam, Token} from "~/core/Util";
import * as React from "react";
import {LanguageProvider} from "~core/Lang2";
import {lookupChild2, setChild} from "~core/TreeUtils";
import {Block, BlockChildren, BlockType} from "~core/Block";

export interface ArrayBlockProps {
    RenderUnknown: InternalBlockRender,

    onChange(newChild: Block): void

    block: Block
    path: Block[]
    Separator?: JSX.Element
    parentStyle?: React.CSSProperties,
    childStyle?: React.CSSProperties,
}

export function ArrayBlock(props: ArrayBlockProps) {
    const child = props.block;
    if (!child.isArray)
        throw new Error(`Expected block to be array`);
    const elems = [];
    const arr = child.children;
    if (!arr) throw new Error('Expected child to have elements');
    const len = Object.keys(arr).length;
    const path = props.path.concat(child)

    function Inserter() {
        const style: React.CSSProperties = {
            background:'none',
            border:'none'
        };
        return <EditorContext.Consumer>{ctx => {
            return <button
                style={style}

                onClick={() => {
                    props.onChange(setChild(
                        child,
                        len.toString(),
                        {}
                    ))
                }}

                disabled={!ctx}

            >[+]</button>
        }}</EditorContext.Consumer>
    }

    for (let i = 0; i < len; i++) {
        if (i > 0)
            if(props.Separator)
                elems.push(props.Separator)
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
            path={path}
        />)
    }

    return <>{elems}<Inserter/></>
}

export function fromTemplate(template: string): BlockRender {
    const tokens:[Token,ParsedParams?][] = parseTemplate(template).map(token=>{
        if(token.isTemplate)return [token, parseTemplateParam(token.value)]
        return  [token]
    })


    return function (props: BlockProps): JSX.Element {
        function renderToken([token,parsed1]:[Token,ParsedParams?]) {
            if (token.isTemplate) {
                const parsed = parsed1 as ParsedParams
                const children = props.block.children;
                if (!children) throw new Error('expected children');

                if (parsed.name in children) {
                    const child = children[parsed.name]
                    let res;
                    if ('array' in parsed.params) {

                        const separator = <>{parsed.params.separator}</>;
                        res = <span style={{
                            display: 'flex',
                            flexDirection: ('horizontal' in parsed.params) ? 'row' : 'column',
                            alignItems: parsed.params['align'] ?? 'flex-start',
                            marginLeft: ('indent' in parsed.params) ? '10px' : '0'
                        }} key={parsed.name}>
                            <ArrayBlock
                                block={child}
                                onChange={newArr => props.childOnChange(parsed.name, newArr)}
                                path={props.path}
                                RenderUnknown={props.RenderUnknown}
                                Separator={separator}/>
                        </span>
                    } else {
                        res = <props.RenderChild key={parsed.name} name={parsed.name}/>
                    }

                    return res;
                } else {
                    throw new Error(`Template: Missing child '${parsed.name}' in block '${props.block.type}'`);
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

export type BlockDefs={ [name: string]: BlockDef };


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

            if (typeof spec=== 'function') {
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

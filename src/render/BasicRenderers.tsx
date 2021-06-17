import * as React from 'react';
import {useContext, useEffect} from 'react';
import {Block} from "~core/Block";
import {BlockContext, ChildRenderProps, EditorContext, EditorContextType} from "~render/index";
import {arrayLast2, expectNonNull, useContext2} from "~core/Util";
import {setChild} from "~core/TreeUtils";

/**
 * Renders an arbitrary child, handles if the child is missing
 * Note; doesn't handle when child is undefined
 *
 * @param props
 * @constructor
 */
export function ChildRenderer(props: EmptyBlockProps) {
    const {RenderUnknown} = useContext2(BlockContext)
    if (props.block.type)
        return <RenderUnknown {...props}/>
    else
        return <EmptyBlock {...props}/>
}

interface VirtualChildProps extends ChildRenderProps<true> {
    children(childProps: ChildRenderProps<false>): JSX.Element

}

/**
 * Makes it apparent to children that a certain child exists, even if it doesn't
 * @param props
 * @constructor
 */
export function VirtualChild(props: VirtualChildProps): JSX.Element {
    const parentCtx = useContext(EditorContext)
   // const [selected, setSelected] = React.useState<Block>()
    const [virtualChild] = React.useState<Block>({})

    const faked:EditorContextType|undefined=React.useMemo(()=>parentCtx && {
        onSelect(path: Block[]) {
            const selection = arrayLast2(path)
            if (selection === virtualChild) {
            //     setSelected(selection)
                //TODO super sketch
                const pChildren=arrayLast2(path,2).children;
                if(!pChildren)throw new Error('bad');
                const old=pChildren[props.childName];
                pChildren[props.childName]=virtualChild;
                parentCtx.onSelect(path, ()=>pChildren[props.childName]=old)
            } else {
            //     console.error('this should never happen, since virtualChild is the only child')
            //     setSelected(undefined)
                parentCtx.onSelect(path)
            }

            // parentCtx.onSelect(path)
        },
        onChange(path: Block[], newValue: Block) {
            //TODO this is an optimization since it doesn't check the full path
            if (arrayLast2(path) === virtualChild) {
                //if we are setting the virtual child, we cannot directly use the path
                //as it doesn't exist yet int the actual tree
                const parent = arrayLast2(props.path);
                parentCtx.onChange(props.path, setChild(parent, props.childName, newValue))
            } else {
                console.error('this should never happen, since virtualChild is the only child')
                parentCtx.onChange(path, newValue)
            }
        },
        selected:parentCtx.selected
    },[props.childName,props.path,parentCtx]);

    return <EditorContext.Provider value={faked}>
        {props.children({
            ...props,
            block: virtualChild
        })}
    </EditorContext.Provider>
}

export function OptChild(props:ChildRenderProps<true>) {
    return <VirtualChild {...props}>{props2=>(
        <ChildRenderer {...props2} childHint={`[${props2.childName}]`}/>
    )}</VirtualChild>
}

export function OptionalChild(props:ChildRenderProps<boolean>) {
    if(props.block){
        return ChildRenderer(props)
    }else{
        return OptChild(props)
    }
}

export interface EmptyBlockProps extends ChildRenderProps<false> {
    /**
     * The text displayed to help the user know what this child is supposed to be
     */
    childHint?: string
}

/**
 * Renders the tooltip for a missing block
 * @param props
 * @constructor
 */
export function EmptyBlock(props: EmptyBlockProps) {
    const root = props.block, path = props.path;
    const context = useContext(EditorContext)

    const style: React.CSSProperties = {
        background: 'none',
        border: 'none',
        color: 'blue'
    };
    if (context?.selected === root) {
        style.background = 'blue'
        style.color = 'white'
    }
    if (!context)
        style.color = 'gray'

    let text = props.childHint ?? `<${props.childName}>`;

    return <a
        onClick={() => context && context.onSelect(path.concat(root))}
        style={style}
    >
        {text}
    </a>

}
export interface Node {
    children?: { [name: string]: Node }
}

export function setChild(block: Node, name: string, newChild: Node): Node {
    return {
        ...block,
        children: {
            ...block.children,
            [name]: newChild
        }
    }
}

export function lookupChild(tree:Node, child:Node):string|undefined{
    const children=tree.children;
    if(!children)return undefined;
    return Object.keys(children).find(x=>children[x]==child)
}
export function lookupChild2(tree:Node,child:Node):string{
    const res=lookupChild(tree, child);
    if(!res)throw new Error(`Unable to find child ${child} in node ${tree}`);
    return res;
}
export function updateNode(tree: Node, path: Node[], newVal: Node): Node {
    if(path.length==0)throw new Error('invalid path of length 0')

    if (path.length == 1)
        return newVal;

    const child=lookupChild2(tree,path[1]);

    return setChild(tree, child, updateNode(
        path[1],
        path.slice(1),
        newVal
    ))
}

export function updateNodeStr(tree: Node, path: string[], newVal: Node): Node {
    if (path.length == 0)
        return newVal;

    if (!tree.children)
        throw new Error(`Invalid path: ${path}`);

    return setChild(tree, path[0], updateNodeStr(
        tree.children[path[0]],
        path.slice(1),
        newVal
    ))
}
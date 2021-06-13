export interface Tree<T> {
    children?: { [name: string]: Tree<T> }
}

export function setChild<T>(block: Tree<T>, name: string, newChild: Tree<T>): Tree<T> {
    return {
        ...block,
        children: {
            ...block.children,
            [name]: newChild
        }
    }
}

export function lookupChild<T>(tree:Tree<T>, child:Tree<T>):string|undefined{
    const children=tree.children;
    if(!children)return undefined;
    return Object.keys(children).find(x=>children[x]==child)
}
export function updateNode<T>(tree: Tree<T>, path: T[], newVal: T): Tree<T> {
    if (path.length == 0)
        return newVal;

    const child=lookupChild(tree,path[0]);
    if (!child)
        throw new Error(`Invalid path: ${path}`);

    return setChild(tree, child, updateNode(
        path[0],
        path.slice(1),
        newVal
    ))
}

export function updateNodeStr<T>(tree: Tree<T>, path: string[], newVal: T): Tree<T> {
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
import * as React from "react";
import {Block} from "./Block";
import {arrayLast} from "core/Util";
import {updateNode} from "core/TreeUtils";
import {LanguageProvider} from "core/Lang2";
import {BlockRenderer, BlockRenderer2, EditorContext, LanguageRenderer, makeRenderer} from "render";
import {useEffect, useMemo, useState} from "react";

export interface EditorProps {
    language: LanguageProvider,
    languageRender: LanguageRenderer

    content: Block,

    /**
     * Called whenever the user makes an edit to the code
     * @param block the new root block
     */
    onChange(block: Block): void,


    onSelected(selected?: Block[]): void,

}

interface EditorState {
    suggestions?: Block[]

    selected?: Block[],
    blockRenderer: BlockRenderer2

}

export default function Editor(props: EditorProps): JSX.Element {
    const [suggestions1, setSuggestions] = useState<Block[] | undefined>()
    const [selected, setSelected] = useState<Block[] | undefined>()
    const renderBlock = useMemo(() => makeRenderer(props.languageRender), [props.languageRender])

    function onSelect(selected?: Block[]) {
        setSelected(selected)
        setSuggestions(selected && props.language.suggest(selected))
    }

    function replaceSelection(newVal: Block) {
        if (!selected)
            throw new Error('No block selected to update');

        onSelect(undefined)
        onChange(selected, newVal)
    }


    function onChange(path: Block[], newValue: Block) {
        props.onChange(updateNode(props.content, path, newValue))
    }

    function renderSuggestion(suggestion: Block) {
        if (typeof suggestion.type !== 'string')
            throw new Error(`Suggestion type is invalid: ${suggestion.type}`);
        return <li key={suggestion.type}>
            <button onClick={() => {
                replaceSelection(suggestion)
            }}>{suggestion.type}</button>

            <pre>{renderBlock({
                block: suggestion,
                path: []
            })}</pre>
        </li>
    }

    let suggestions;
    if (suggestions1)
        suggestions = <div>
            Suggestions:
            <ul>
                {suggestions1.map(renderSuggestion)}
            </ul>
        </div>


    return <>
        <EditorContext.Provider value={{onSelect, onChange, selected: arrayLast(selected)}}>
            <pre>{renderBlock({block: props.content})}</pre>
        </EditorContext.Provider>
        {suggestions}
    </>
}
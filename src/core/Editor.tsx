import * as React from "react";
import {useMemo, useState} from "react";
import {Block} from "./Block";
import {updateNodeStr} from "core/TreeUtils";
import {LanguageProvider} from "core/Lang2";
import {EditorContext, LanguageRenderer, makeRenderer, SelectionType} from "render";

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


export default function Editor(props: EditorProps): JSX.Element {
    const [suggestions1, setSuggestions] = useState<Block[] | undefined>()
    const [selected, setSelected] = useState<SelectionType | undefined>()
    const renderBlock = useMemo(() => makeRenderer(props.languageRender), [props.languageRender])

    React.useEffect(()=>{
        setSuggestions(selected && props.language.suggest(props.content, selected))
    },[selected])

    function onSelect(selected: SelectionType, done?: () => void): void {
        setSelected(selected)
        if(done)throw new Error('onSelect done callback not supported')
    }

    function replaceSelection(newVal: Block) {
        if (!selected)
            throw new Error('No block selected to update');

        setSelected(undefined)
        onChange(selected.path, newVal)
    }


    function onChange(path: string[], newValue: Block) {
        props.onChange(updateNodeStr(props.content, path, newValue))
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
        <EditorContext.Provider value={{onSelect, onChange, selected: selected?.block}}>
            <pre>{renderBlock({block: props.content})}</pre>
        </EditorContext.Provider>
        {suggestions}
    </>
}
import * as React from "react";
import {Block} from "./Block";
import {BlockContext, EditorContext, GeneralBlockRender, LanguageRender, makeRenderer} from "./ReactCodeRender";
import {arrayLast} from "core/Util";
import {updateNode} from "core/TreeUtils";
import {LanguageProvider} from "core/Lang2";

export interface EditorProps {
    language: LanguageProvider,
    languageRender: LanguageRender

    content: Block,

    /**
     * Called whenever the user makes an edit to the code
     * @param block the new root block
     */
    onChange(block: Block): void,


    onSelected(selected?: Block[]): void,

}


export default class Editor extends React.Component<EditorProps, {
    suggestions?: Block[]

    selected?: Block[],
    languageRender: GeneralBlockRender
}> {

    constructor(props: EditorProps) {
        super(props);

        this.state = {
            languageRender: makeRenderer(props.languageRender),

        };
    }

    componentDidUpdate(prevProps: EditorProps) {
        //update language renderer
        if (prevProps.languageRender !== this.props.languageRender) {
            this.setState({
                ...this.state,
                languageRender: makeRenderer(this.props.languageRender)
            })
        }

    }

    onSelect(selected?: Block[]) {
        this.setState({
            ...this.state,
            selected,
            suggestions: selected && this.props.language.suggest(selected)
        })
    }

    replaceSelection(newVal: Block) {
        if (!this.state.selected)
            throw new Error('No block selected to update');

        this.onSelect(undefined)

        this.props.onChange(updateNode(
            this.props.content,
            this.state.selected,
            newVal,
        ))
    }

    renderSuggestion(suggestion: Block) {
        if (typeof suggestion.type !== 'string')
            throw new Error(`Suggestion type is invalid: ${suggestion.type}`);
        return <li key={suggestion.type}>
            <button onClick={() => {
                this.replaceSelection(suggestion)
            }}>{suggestion.type}</button>

            {this.state.languageRender({
                root: suggestion,
                onChange() {
                    throw new Error('Did not expect onchange to be called for suggestion')
                }
            })}
        </li>
    }

    render() {
        let suggestions;
        if (this.state.suggestions)
            suggestions = <div>
                Suggestions:
                <ul>
                    {this.state.suggestions.map(this.renderSuggestion.bind(this))}
                </ul>
            </div>


        return <BlockContext.Provider value={{}}>
            <EditorContext.Provider value={{
                onSelect: this.onSelect.bind(this),
                selected: arrayLast(this.state.selected),
            }}>

                {this.state.languageRender({
                    root: this.props.content,
                    onChange: this.props.onChange
                })}
            </EditorContext.Provider>
            {suggestions}
        </BlockContext.Provider>
    }
}
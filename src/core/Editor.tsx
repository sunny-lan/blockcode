import * as React from "react";
import {Block, Language} from "./Code";
import {GeneralBlockRender, LanguageRender, makeRenderer, BlockContext, EditorContext} from "./ReactCodeRender";

export interface EditorProps {
    language: Language,
    languageRender: LanguageRender

    content: Block,

    /**
     * Called whenever the user makes an edit to the code
     * @param block the new root block
     */
    onChange(block: Block): void,

    selected?: Block,

    onSelected(selected?: Block): void,

    suggestions: Block[]
}


export default class Editor extends React.Component<EditorProps, {

    languageRender: GeneralBlockRender
}> {

    constructor(props: EditorProps) {
        super(props);

        this.state = {languageRender: makeRenderer(props.languageRender)};
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

    onSelect(selected?: Block) {
        this.props.onSelected(selected)
    }


    render() {
        let suggestions;
        if (this.props.suggestions)
            suggestions = <div>
                Suggestions:
                <ul>
                    {this.props.suggestions.map(suggestion => {
                        const block = suggestion;

                        return <li key={suggestion.type}>
                            <button onClick={() => {
                                this.props.onSelected(block)
                            }}>{suggestion.type}</button>
                            {this.state.languageRender({
                                root: block,
                                onChange() {
                                    throw new Error('Did not expect onchange to be called for suggestion')
                                }
                            })}
                        </li>
                    })}
                </ul>
            </div>

        return <BlockContext.Provider value={{
            RenderUnknown: this.state.languageRender,
        }}>
            <EditorContext.Provider value={{
                onSelect: this.props.onSelected,
                selected: this.props.selected,
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
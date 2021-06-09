import * as React from "react";
import {Block, ILiveBlock, Language, Live} from "./Code";
import {GeneralBlockRender, LanguageRender, makeRenderer, BlockContext, UpdateableBlock} from "./ReactCodeRender";

export interface EditorProps {
    language: Language,
    languageRender: LanguageRender

    content: Block,

    /**
     * Called whenever the user makes an edit to the code
     * @param block the new root block
     */
    onChange(block: Block): void,
}


export default class Editor extends React.Component<EditorProps, {
    curLive: ILiveBlock,
    selected?: UpdateableBlock
}> {
    languageRender: GeneralBlockRender

    constructor(props: EditorProps) {
        super(props);

        this.languageRender = makeRenderer(props.languageRender)
        this.state = {curLive: Live.makeLive(props.content)};
    }

    componentDidUpdate(prevProps: EditorProps) {
        //update language renderer
        if (prevProps.languageRender !== this.props.languageRender) {
            this.languageRender = makeRenderer(this.props.languageRender)
        }

        if(this.props.content!==prevProps.content) {
            this.setState({
                ...this.state,
                curLive: Live.makeLive(this.props.content, this.state.curLive)
            })
        }
    }

    onSelect(selected?: UpdateableBlock) {
        this.setState({...this.state, selected});
    }

    render() {
        let suggestions;
        const selected= this.state.selected?.block;
        const selectedParent = selected?.parent;
        if (selectedParent) {
            const childName = Object.keys(selectedParent.children)
                .find(name => selectedParent.children[name] === selected);
            if (!childName) {
                console.error(selected, selectedParent)
                throw new Error(`Invalid child: ${childName} of ${JSON.stringify(selectedParent.block)}!`)
            }

            suggestions = <div>
                Suggestions:
                <ul>
                {this.props.language.suggestChildren(
                    selectedParent,
                    childName
                )
                    .map(suggestion => {
                        const block= Live.makeLive(suggestion)

                        return <li key={suggestion.type}>
                            <button onClick={()=>{
                                this.state.selected?.updateState(block)

                            }}>{suggestion.type}</button>
                            {this.languageRender({
                                root: block,
                                onChange(){throw new Error('Did not expect onchange to be called for suggestion')}
                            })}
                        </li>
                    })

                }</ul>
            </div>
        }

        return <div>
            <div><BlockContext.Provider value={{
                onSelect: this.onSelect.bind(this),
                selected: this.state.selected?.block,
            }}>
                {this.languageRender({
                    root: this.state.curLive,
                    onChange:(newRoot)=>{
                        this.props.onChange(newRoot.block)
                    }
                })}
            </BlockContext.Provider></div>
            {suggestions}
        </div>
    }
}
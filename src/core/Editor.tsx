import * as React from "react";
import {Block, ILiveBlock, Language, makeLive} from "./Code";
import {GeneralBlockRender, LanguageRender, makeRenderer, BlockContext} from "./ReactCodeRender";

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
    selected?: ILiveBlock
}> {
    languageRender: GeneralBlockRender

    constructor(props: EditorProps) {
        super(props);

        this.languageRender = makeRenderer(props.languageRender)
        this.state = {curLive: makeLive(props.content)};
    }

    onComponentDidUpdate(prevProps: EditorProps) {
        //update language renderer
        if (prevProps.languageRender != this.props.languageRender) {
            this.languageRender = makeRenderer(this.props.languageRender)
        }

        this.setState({
            ...this.state,
            curLive: makeLive(this.props.content, this.state.curLive)
        })
    }

    setSelected(selected: ILiveBlock) {
        this.setState({...this.state, selected});
    }

    render() {
        let suggestions;
        const selectedParent = this.state.selected?.parent;
        if (selectedParent) {
            const childName = Object.keys(selectedParent.children)
                .find(name => selectedParent.children[name] === this.state.selected);
            if (!childName) {
                console.error(this.state.selected, selectedParent)
                throw new Error(`Invalid child: ${childName} of ${JSON.stringify(selectedParent.block)}!`)
            }

            suggestions = <div>
                Suggestions:
                <ul>
                {this.props.language.suggestChildren(
                    selectedParent,
                    childName
                )
                    .map(child => {
                        return <li>{child.type}</li>
                    })

                }</ul>
            </div>
        }

        return <div>
            <div><BlockContext.Provider value={{
                setSelected: this.setSelected.bind(this),
                selected: this.state.selected,
            }}>
                {this.languageRender({
                    root: this.state.curLive,
                })}
            </BlockContext.Provider></div>
            {suggestions}
        </div>
    }
}
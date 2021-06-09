import * as React from "react";
import {Block, ILiveBlock, Language} from "./Code";
import {GeneralBlockRender, LanguageRender, makeRenderer} from "./ReactCodeRender";

export interface EditorProps {
    language: Language,
    languageRender: LanguageRender

    root: Block,

    onChange(block: Block): void,
}

export default class Editor extends React.Component<EditorProps, {
    root: ILiveBlock,
    selected?: ILiveBlock
}> {
    languageRender: GeneralBlockRender

    constructor(props: EditorProps) {
        super(props);

        this.languageRender = makeRenderer(props.languageRender)
    }

    onComponentDidUpdate(prevProps: EditorProps) {
        //update language renderer
        if (prevProps.languageRender != this.props.languageRender) {
            this.languageRender = makeRenderer(this.props.languageRender)
        }

        this.setState({
            ...this.state,
            root: this.props.language.parse(this.props.root)
        })
    }

    render() {
        return <div>
            <div>{this.languageRender({
                block: this.state.root,
                global: {
                    setSelected: selected => this.setState({...this.state, selected}),
                    selected: this.state.selected,
                }
            })}</div>
            <div>suggestions:</div>
        </div>
    }
}
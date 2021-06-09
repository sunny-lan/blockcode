import * as React from "react";
import {Block, LiveFile, Language} from "./Code";
import {GeneralBlockRender, LanguageRender, makeRenderer} from "./ReactCodeRender";

export interface EditorProps {
    language: Language,
    languageRender: LanguageRender

    /**
     * The last loaded contents from disk. If this is updated, everything within the current state is wiped
     */
    savedContents: Block,

    /**
     * Called whenever the user makes an edit to the code
     * @param block the new root block
     */
    onChange(block: Block): void,
}

export default class Editor extends React.Component<EditorProps, {
    root: Block,
    selected?:Block
}> {
    file: LiveFile = new LiveFile()
    languageRender: GeneralBlockRender

    constructor(props: EditorProps) {
        super(props);

        this.languageRender = makeRenderer(props.languageRender)
        this.file.root.setData(props.savedContents)
        this.state={
            root:this.file.root.block
        };
        this.file.onChange.push(root => this.setState({root}))
        this.file.onChange.push(props.onChange)
    }

    onComponentDidUpdate(prevProps: EditorProps) {
        //update language renderer
        if (prevProps.languageRender != this.props.languageRender) {
            this.languageRender = makeRenderer(this.props.languageRender)
        }

        //update event handler
        if (prevProps.onChange != this.props.onChange) {
            const idx = this.file.onChange.indexOf(this.props.onChange);
            this.file.onChange[idx] = this.props.onChange;
        }

        //update internal AST to new data
        if (prevProps.savedContents != this.props.savedContents) {
            //this will cascade, calling setState
            this.file.root.setData(this.props.savedContents)
        }
    }

    render() {
        return this.languageRender({
            root: this.state.root,
            blockSpecific: {},
            global:{
                setSelected:selected=>this.setState({...this.state, selected}),
                selected:this.state.selected,
            }
        })
    }
}
import * as React from "react";
import {ProceduralLang, ProceduralRender} from "~/lang/Procedural";
import Editor from "~/core/Editor";
import {Block} from "~/core/Code";

export default class App extends React.Component<any, {
    root: Block
}> {
    constructor(props: {}) {
        super(props);
        this.state = {
            root: {
                type: 'if',
                children: {
                    "condition": {},
                    "code": {}
                }
            }
        };
    }


    render() {


        return <Editor
            onSelected={x=>{}}
            suggestions={[]}

            language={ProceduralLang}
            languageRender={ProceduralRender}
            content={this.state.root}
            onChange={root => {
                this.setState({...this.state, root})
            }}
        />
    }
}

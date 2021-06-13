import * as React from "react";
import {ProceduralLang, ProceduralRender,ProceduralBlockDefs} from "~/lang/Procedural";
import Editor from "~/core/Editor";
import {Block} from "~/core/Block";

export default class App extends React.Component<any, {
    root: Block
}> {
    constructor(props: {}) {
        super(props);
        this.state = {
            root: ProceduralLang.hydrate(ProceduralBlockDefs.functiondef)
        };
    }


    render() {


        return <Editor
            onSelected={x=>{}}

            language={ProceduralLang}
            languageRender={ProceduralRender}
            content={this.state.root}
            onChange={root => {
                this.setState({...this.state, root})
            }}
        />
    }
}

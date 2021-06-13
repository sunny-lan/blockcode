import * as React from "react";
import {ProceduralLang, ProceduralRender} from "~/lang/Procedural";
import Editor from "~/core/Editor";
import {Block} from "~/core/Block";

export default class App extends React.Component<any, {
    root: Block
}> {
    constructor(props: {}) {
        super(props);
        this.state = {
            root: {
                type:'codeblock',
                children:{
                    statements: {
                        type:'statements',
                        isArray:true,
                        children: {}
                    }
                },
            }
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

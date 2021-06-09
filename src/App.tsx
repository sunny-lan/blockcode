import * as React from "react";
import {CppLang, CppRender} from "./lang/Cpp";
import Editor from "./core/Editor";
import {Block} from "./core/Code";

export default class App extends React.Component<any, {
    root: Block
}> {
    constructor(props: {}) {
        super(props);
        this.state = {
            root: {
                type: 'if',
                children: {
                    "condition": {
                        data: 'nope'
                    },
                    "code": {
                        data: 'yup',
                        type: "hello"
                    }
                }
            }
        };
    }


    render() {


        return <Editor
            language={CppLang}
            languageRender={CppRender}
            content={this.state.root}
            onChange={root => {
                this.setState({...this.state, root})
            }}
        />
    }
}

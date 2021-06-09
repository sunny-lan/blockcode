import * as React from "react";
import {CppLang, CppRender} from "./lang/Cpp";
import Editor from "./core/Editor";

export default class App extends React.Component {
    constructor(props: {}) {
        super(props);
        this.state = {};
    }


    render() {


        return <Editor
            language={CppLang}
            languageRender={CppRender}
            content={{
                type: 'if',
                children: {
                    "condition": {
                        data:'nope'
                    },
                    "code": {
                        data:'yup',
                        type: "hello"
                    }
                }
            }}
            onChange={_=>{}}
        />
    }
}

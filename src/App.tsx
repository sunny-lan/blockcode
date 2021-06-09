import * as React from "react";
import {CppRender} from "./lang/Cpp";
import Editor from "./core/Editor";

export default class App extends React.Component {
    constructor(props: {}) {
        super(props);
        this.state = {};
    }


    render() {


        return <Editor
            language={{

            }}
            languageRender={CppRender}
            root={{
                type: 'if',
                children: {
                    "condition": {},
                    "code": {
                        type: "hello"
                    }
                }
            }}
            onChange={_=>{}}
        />
    }
}

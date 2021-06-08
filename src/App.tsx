import * as React from "react";
import {makeRenderer} from "./core/ReactCodeRender";
import {CppRender} from "./lang/Cpp";

const F = makeRenderer(CppRender);

export default class App extends React.Component {
    constructor(props: {}) {
        super(props);
        this.state = {};
    }


    render() {


        return <F root={{
            type: 'if',
            children: {
                "condition":{
                    type:"hello",
                },
                "code": {
                    type:"hello"
                }
            }
        }}/>
    }
}

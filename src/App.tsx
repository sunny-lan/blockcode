import * as React from "react";
import {ProceduralLang, ProceduralRender,ProceduralBlockDefs} from "~/lang/Procedural";
import Editor from "~/core/Editor";
import {Block} from "~/core/Block";
import {Hint, makeHintProvider} from "hint";

export default class App extends React.Component<any, {
    root: Block
}> {

    hintProvider=makeHintProvider(['a','b','c','d','e','f','g','h','i','j'])
    constructor(props: {}) {
        super(props);
        this.state = {
            root: ProceduralLang.hydrate(ProceduralBlockDefs.functiondef)
        };
    }


    render() {


        // return <Editor
        //     onSelected={x=>{}}
        //
        //     language={ProceduralLang}
        //     languageRender={ProceduralRender}
        //     content={this.state.root}
        //     onChange={root => {
        //         this.setState({...this.state, root})
        //     }}
        // />
        const HintProvider=this.hintProvider;
        const lst=[]
        for(let i=0;i<200;i++) {
            lst.push(<span key={i} ><Hint onSelect={() => alert(`hi ${i}`)}/></span>)

        }
        return <HintProvider>
            <div style={{
                overflowWrap:'break-word'
            }}>
            {lst}</div>

        </HintProvider>
    }
}

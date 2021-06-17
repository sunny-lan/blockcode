import * as React from "react";
import {ProceduralLang, ProceduralRender, ProceduralBlockDefs} from "~/lang/Procedural";
import Editor from "~/core/Editor";
import {Block} from "~/core/Block";
import {Hint, makeHintProvider} from "hint";
import { useState } from "react";

const HintProvider = makeHintProvider('abcdefghijklmnopqrstuvwxyz'.split(''))
export default function App() :JSX.Element{
    const [content,setContent]=useState<Block>(()=>ProceduralLang.hydrate(ProceduralBlockDefs.functiondef));

    return <HintProvider>
        <Editor
            onSelected={x => {
            }}

            language={ProceduralLang}
            languageRender={ProceduralRender}
            content={content}
            onChange={setContent}
        />
    </HintProvider>
    // const HintProvider=this.hintProvider;
    // const lst=[]
    // for(let i=0;i<200;i++) {
    //     lst.push(<span key={i} >[<Hint onSelect={() => alert(`hi ${i}`)}/>]</span>)
    //
    // }
    // return <HintProvider>
    //     <div style={{
    //         overflowWrap:'break-word'
    //     }}>
    //     {lst}</div>
    //
    // </HintProvider>
}


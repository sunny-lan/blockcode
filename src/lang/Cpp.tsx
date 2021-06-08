import {BlockProps, LanguageRender} from "~core/ReactCodeRender";
import * as React from "react";
import {fromTemplate} from "./core/Basic";

export const CppRender:LanguageRender={
    "if":fromTemplate("if(${condition})${code}"),
    "hello":function (block:BlockProps){
        return (<pre>
            print("hello");
        </pre>)
    }
};
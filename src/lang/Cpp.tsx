import {Block, LiveBlock} from "~core/Code";
import {BlockProps, LanguageRender} from "~core/ReactCodeRender";
import * as React from "react";

export const CppRender:LanguageRender={
    "if":function (block:BlockProps){
        return (<pre>
            if({block.children['condition']})
                {block.children['code']}
        </pre>)
    },
    "hello":function (block:BlockProps){
        return (<pre>
            print("hello");
        </pre>)
    }
};
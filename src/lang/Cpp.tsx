import {BlockProps, LanguageRender} from "~core/ReactCodeRender";
import * as React from "react";
import {fromTemplate} from "./Basic";
import {Block, ILiveBlock, Language} from "~core/Code";

const blockTemplates:Block[]=[
    {
        type:'hello',
    },
    {
        type:'if',
        children:{
            condition:{},
            code:{}
        }
    }
];

export const CppLang: Language = {
    suggestChildren(block: ILiveBlock, childName: string): Block[] {
        return blockTemplates;
    }

};
export const CppRender: LanguageRender = {
    "if": fromTemplate("if(${condition})${code}"),
    "hello": function (block: BlockProps) {
        return (<pre>
            print("hello");
        </pre>)
    }
};
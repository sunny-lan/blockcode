import * as React from 'react'
export type Token = {
    isTemplate: boolean,
    value: string,
}
export function assert(condition:boolean, message:string='assert failed'): asserts condition {
    if(!condition)
    throw new Error(message)
}
export function expectNonNull(val:any, message:string='expected to be non-null'):asserts val {
    assert(val, message)
}
export function useContext2<T>(ctx:React.Context<T|undefined>):T{
    const res=React.useContext(ctx);
    if(!res)throw new Error('Context consumed outside of producer!');
    return res
}
export function useActiveElement () {
    const [active, setActive] = React.useState(document.activeElement);

    const handleFocusIn = (e:FocusEvent) => {
        setActive(document.activeElement);
    }

    React.useEffect(() => {
        document.addEventListener('focusin', handleFocusIn)
        document.addEventListener('focusout', handleFocusIn)
        return () => {
            document.removeEventListener('focusin', handleFocusIn)
            document.removeEventListener('focusout', handleFocusIn)
        };
    }, [])

    return active;
}
export function isTextbox(obj:any){
    return obj instanceof HTMLInputElement && obj.type == 'text';
}
export function compareArray<T>(array1:T[],array2:T[]):boolean{
   return array1.length === array2.length &&
       array1.every((value, index) => value === array2[index])

}
export function arrayLast<T>(arr?:T[], offset:number=1):T|undefined{
    if(!arr)return undefined;
    return arr[arr.length-offset];
}
export function arrayLast2<T>(arr?:T[], offset:number=1):T{
    if(!arr)throw new Error(`Array doesn't exist`);
    return arr[arr.length-offset];
}
export interface Params{[name:string]:string|undefined}
export interface TemplateParam{
    name:string,
    params:Params
}
export interface ParsedParams{ name: any; params: Params }
export function parseTemplateParam(token: string,defaultParams:Params={}): ParsedParams {
    const split = token.split('|')
    const params:Params={};
    (split[1]??'').split(',').forEach(param=>{
        const [name,value]=param.split(':') as [string,string?]
        params[name]=value??defaultParams[name]
    })
    return {
        name: split[0],
        params
    }
}

export function parseTemplate(template: string): Token[] {
    enum State {
        Normal,
        Template1,
        Template2,
    }

    let state: State = State.Normal;
    let token = '';
    let escape = false;
    const tokens: Token[] = [];

    for (let i = 0; i < template.length; i++) {
        const char = template[i];
        if (escape) {
            token += char;
            escape = false;
        } else {
            if (char === '\\') {
                escape = true;
            } else {
                if (char === '$' && state === State.Normal)
                    state = State.Template1;
                else if (char === '}' && state === State.Template2) {
                    tokens.push({
                        value: token,
                        isTemplate: true,
                    })
                    token = '';
                    state = State.Normal;
                } else if (state === State.Template1) {
                    if (char === '{') {
                        state = State.Template2;
                        tokens.push({
                            value: token,
                            isTemplate: false,
                        })
                        token = '';
                    } else {
                        state = State.Normal;
                        token += '{' + char;
                    }
                } else {
                    token += char;
                }
            }
        }
    }

    if (token.length > 0)
        tokens.push({
            value: token,
            isTemplate: false,
        })
    return tokens
}
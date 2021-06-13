export type Token = {
    isTemplate: boolean,
    value: string,
}

export function arrayLast<T>(arr?:T[]):T|undefined{
    if(!arr)return undefined;
    return arr[arr.length-1];
}
export interface Params{[name:string]:string}
export interface TemplateParam{
    name:string,
    params:Params
}

export function parseTemplateParam(token: string,defaultParams:Params={}) {
    const split = token.split('|')
    const params:Params={};
    (split[1]??'').split(',').forEach(param=>{
        const [name,value]=param.split(':') as [string,string?]
        params[name]=value??defaultParams[name]??''
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
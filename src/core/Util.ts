export type Token = {
    isTemplate: boolean,
    value: string,
}

export function parseTemplateParam(token: string) {
    const split = token.split('|')
    return {
        name: split[0],
        params: (token[1]??'').split(',')
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
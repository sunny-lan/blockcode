import * as React from 'react'
import {useContext, useEffect, useState} from 'react'
import {useTrackVisibility} from 'react-intersection-observer-hook'

type Code = string[];

interface HintRef {
    /**
     * Priority determines the length of the code assigned to the hint
     * Any hint with a lower priority will never have a longer code
     * than a hint with a higher priority
     * TODO this isn't implemented yet
     */
    priority?: number,
    /**
     * The assigner will try to assign one of the codes in this list
     * to this hint if possible
     */
    preferredCodes?: Code[]

    onCodeChange(code: Code): void
}

interface HintContextType {
    registerHint(settings: HintRef): () => void

    currentCode: Code

    push(letter: string): void

    clear(): void
}

const HintContext = React.createContext<HintContextType | undefined>(undefined);

export interface HintProviderProps {
    children: React.ReactNode,
}

export interface HintTrie {
    children: {
        [letter: string]: HintTrie | HintRef
    }
}

export interface HintAlloc {
    alloc(newHint: HintRef): void

    free(freed: HintRef): void
}

export function makeHintUtils(alphabet: string[]) {

    const fastIdxOf: { [letter: string]: number } = {};
    for (let idx = 0; idx < alphabet.length; idx++) {
        fastIdxOf[alphabet[idx]] = idx;
    }

    function numToCode(num: number, len: number): Code {
        let code: Code = new Array(len)
        for (let i = len - 1; i >= 0; i--) {
            code[i] = alphabet[num % alphabet.length]
            num /= alphabet.length;
            num=Math.floor(num)
        }
        return code
    }

    function codeToNum(code: Code): number {
        let num = 0;
        for (const letter of code) {
            num = num * alphabet.length + fastIdxOf[letter];
        }
        return num;
    }

    return {
        numToCode,
        codeToNum,
        fastIdxOf,


    }
}

export function makeHintProvider(alphabet: string[]) {
    const utils = makeHintUtils(alphabet);

    function reqLen(count: number): number {
        let res = 1;
        while (Math.pow(alphabet.length, res) < count) res++;
        return res;
    }

    function assignCodes(refs: HintRef[]) {
        const maxLength = reqLen(refs.length);
        let remainingCodes = Math.pow(alphabet.length, maxLength);
        let curPrefix = 0, curPrefixLen = 1;
        let curMultiplier =Math.floor( remainingCodes / alphabet.length);
        let refsLeft = refs.length;
        for (const ref of refs) {

            //not enough codes left to continue at current length of prefix
            if (remainingCodes - curMultiplier < refsLeft) {
                curPrefix *= alphabet.length;
                curPrefixLen++;
                curMultiplier /= alphabet.length;
                curMultiplier=Math.floor(curMultiplier)
            }

            const code = utils.numToCode(curPrefix, curPrefixLen);
            ref.onCodeChange(code);
            curPrefix++;

            refsLeft--;
            remainingCodes -= curMultiplier;
        }
    }

    const refs: HintRef[] = [];

    return function HintProvider(props: HintProviderProps): JSX.Element {
        const [currentCode, setCode] = useState<Code>([]);

        function onRefsChange() {
            assignCodes(refs)
        }

        const ctx: HintContextType = {
            registerHint(ref: HintRef): () => void {
                refs.push(ref)
                onRefsChange()
                return function free() {
                    refs.splice(refs.indexOf(ref))
                    onRefsChange()
                };
            },
            currentCode,
            push(letter: string) {
                setCode(currentCode.concat(letter))
            },
            clear() {
                setCode([])
            }
        };

        return <HintContext.Provider value={ctx}>
            {props.children}
        </HintContext.Provider>
    }
}

export interface HintProps {
    onSelect(): void

}

interface HintViewProps {
    currentCode: Code
    code: Code
}

function HintView({currentCode, code}: HintViewProps): JSX.Element | undefined {

    if (currentCode.length >= code.length) return;

    for (let prefixMatch = 0; prefixMatch < currentCode.length; prefixMatch++) {
        if (currentCode[prefixMatch] !== code[prefixMatch]) {
            return;
        }
    }
    return <>{code.map((letter, idx) => (
        <span key={idx} style={{
            color: idx < currentCode.length ? 'red' : 'black'
        }}>{letter}</span>
    ))}</>
}

export function Hint(props: HintProps): JSX.Element {
    const ctx = useContext(HintContext);
    if (!ctx)
        throw new Error('Hint cannot be used without HintProvider');

    const [ref, {isVisible}] = useTrackVisibility();
    const [code, setCode] = useState<Code | undefined>();

    useEffect(() => {
        if (isVisible) {
            return ctx.registerHint({
                onCodeChange(code: Code) {
                    setCode(code)
                }
            });
        }
    }, [isVisible, ctx, setCode]);


    return <span ref={ref}>{code && HintView({
        currentCode: ctx.currentCode,
        code
    })}</span>
}
import * as React from 'react'
import {useContext, useEffect, useState} from 'react'
import {InView} from 'react-intersection-observer';
import {useDebounce} from 'use-debounce';

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
    /**
     * returns a unique ID for this hint
     */
    registerHint(ref: HintRef): string

    unRegisterHint(id: string): void

    setVisible(id: string, visible: boolean, hint: HintRef): void

    currentCode: Code

    // codes: { [id: string]: Code }

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
            num = Math.floor(num)
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


    function reqLen(count: number): number {
        let res = 1;
        while (Math.pow(alphabet.length, res) < count) res++;
        return res;
    }

    /**
     * Assigns unique codes to a number of hints, trying best to give minimal length codes
     * @param refs
     * @return an array of same length as {refs} which each element is the code assigned to the hint
     * in the corresponding array index
     */
    function assignCodes(refs: HintRef[]): Code[] {
        const maxLength = reqLen(refs.length);
        let remainingCodes = Math.pow(alphabet.length, maxLength);
        let curPrefix = 0, curPrefixLen = 1;
        let curMultiplier = Math.floor(remainingCodes / alphabet.length);
        let refsLeft = refs.length;
        let idx = 0;
        const res = new Array(refs.length)
        for (const ref of refs) {

            //not enough codes left to continue at current length of prefix
            if (remainingCodes - curMultiplier < refsLeft) {
                curPrefix *= alphabet.length;
                curPrefixLen++;
                curMultiplier /= alphabet.length;
                curMultiplier = Math.floor(curMultiplier)
            }

            res[idx] = numToCode(curPrefix, curPrefixLen);
            curPrefix++;

            refsLeft--;
            remainingCodes -= curMultiplier;
            idx++;
        }
        return res
    }

    return {
        numToCode,
        codeToNum,
        fastIdxOf,
        reqLen,
        assignCodes,

    }
}

export function makeHintProvider(alphabet: string[]) {
    const utils = makeHintUtils(alphabet);

    let uniqId = 1;
    return function HintProvider(props: HintProviderProps): JSX.Element {
        const [currentCode, setCurrentCode] = useState<Code>([]);
        const [visibleDict, setVisibleDict] = useState<{ [id: string]: HintRef }>({});
        //const [idMap, setIdMap] = useState<{ [id: string]: HintRef }>({});
        const [debounceVisible] = useDebounce(visibleDict, 300);
        //const [codes, setCodes] = useState<{ [id: string]: Code }>({});

        //console.log('render HintProvider')

        useEffect(() => {
            const keys = Object.values(debounceVisible);
            const codeArr = utils.assignCodes(keys)
            //console.log('recalc codeArr')
            //const newCodes: { [id: string]: Code } = {}
            for (let i = 0; i < keys.length; i++) {
                // newCodes[keys[i]] = codeArr[i]
                keys[i].onCodeChange(codeArr[i])
            }

        }, [debounceVisible])

        return React.useMemo(() => {
            const ctx: HintContextType = {
                registerHint(ref: HintRef): string {
                    const id = (uniqId++).toString()
                    // setIdMap(idMap => {
                    //     return {...idMap, [id]: ref}
                    // })
                    return id;
                },
                unRegisterHint(id: string): void {
                    // setIdMap(idMap => {
                    //     const {[id]: _, ...newIdMap} = idMap;
                    //     return newIdMap;
                    // })
                },
                setVisible(id: string, visible: boolean, thing: HintRef) {
                    //console.log('visibility change', id, visible)
                    if (!visible) {

                        setVisibleDict(visibleDict => {
                            const {[id]: _, ...newDict} = visibleDict;
                            return newDict;
                        });
                    } else {
                        setVisibleDict(visibleDict => {
                            return {...visibleDict, [id]: thing}
                        })
                    }
                },

                currentCode,
                // codes,

                push(letter: string) {
                    setCurrentCode(currentCode => currentCode.concat(letter))
                },
                clear() {
                    setCurrentCode([])
                }
            }
            return <HintContext.Provider value={ctx}>
                {props.children}
            </HintContext.Provider>
        }, [currentCode]);

    }
}

export interface HintProps {
    onSelect(): void

}

interface HintViewProps {
    currentCode: Code
    code?: Code
}

function _hintView({currentCode, code}: HintViewProps) {

    if (!code) return;
    if (currentCode.length >= code.length) return;

    for (let prefixMatch = 0; prefixMatch < currentCode.length; prefixMatch++) {
        if (currentCode[prefixMatch] !== code[prefixMatch]) {
            return;
        }
    }
    return code.map((letter, idx) => (
        <span key={idx} style={{
            color: idx < currentCode.length ? 'red' : 'black'
        }}>{letter}</span>
    ))
}

function HintView(props: HintViewProps): JSX.Element {

    return <span>{_hintView(props)}</span>
}


export function Hint(props: HintProps): JSX.Element {
    const ctx = useContext(HintContext);
    if (!ctx)
        throw new Error('Hint cannot be used without HintProvider');
    const [id, setID] = useState<string | undefined>();
    const [code, setCode] = useState<Code | undefined>();
    const thing = React.useMemo<HintRef>(() => {
        return {
            onCodeChange(code) {
                setCode(code)
            }
        }
    }, [])
    useEffect(() => {
        let _id: string;
        setID(_id = ctx.registerHint(thing));
        return () => ctx.unRegisterHint(_id);
    }, []);
    return React.useMemo(() => {
        if (!id) return <></>;
        //console.log('render hint')
        return <InView as="span" onChange={visible => {
            ctx.setVisible(id, visible, thing)
        }}>{_hintView({
            code,
            currentCode: ctx.currentCode
        })}</InView>
    }, [id, code, ctx.currentCode]);


}
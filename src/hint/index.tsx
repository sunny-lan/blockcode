import * as React from 'react'
import {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {InView} from 'react-intersection-observer';
import {useDebounce} from 'use-debounce';
import {assert, compareArray, isTextbox, useActiveElement, useContext2} from "~core/Util";

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

    onCodeChange(code?: Code): void
}

export interface PublicHintContext{

    currentCode: Code

    // codes: { [id: string]: Code }

    push(letter: string): void

    clear(): void
    //
    //
    // setEnabled(enable:boolean):void
}
interface HintContextType extends PublicHintContext{
    /**
     * returns a unique ID for this hint
     */
    registerHint(ref: HintRef): string

    unRegisterHint(id: string): void

    setVisible(id: string, visible: boolean): void
    enabled:boolean

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

function useLock<T>(input: T, lock: boolean): T {
    const [output, setOutput] = useState<T>(input);
    useEffect(() => {
        if (!lock) {
            setOutput(input);
        }
    }, [input, lock]);
    return output;
}

type VDict = { [id: string]: HintRef };

export function makeHintProvider(alphabet: string[]) {
    const utils = makeHintUtils(alphabet);

    let uniqId = 1;
    return function HintProvider(props: HintProviderProps): JSX.Element {
        const [currentCode, setCurrentCode] = useState<Code>([]);
        const [visibleDict, setVisibleDict] = useState<VDict>({});
        const activeElem = useActiveElement();
        const enabled=!isTextbox(activeElem);

        const [idMap, setIdMap] = useState<{ [id: string]: HintRef }>({});
        const [debounceVisible] = useDebounce(visibleDict, 300);

        //prevent the codes from changing as the user is entering the selection code
        const visibleFinal = useLock(debounceVisible, currentCode.length > 0 || !enabled)
        const [lastVisible, setLastVisible] = useState<VDict>({})

        useEffect(() => {
            // console.log('recalc', Object.keys(visibleFinal))

            const values = Object.values(visibleFinal);
            const codeArr = utils.assignCodes(values)
            //console.log('recalc codeArr')
            //const newCodes: { [id: string]: Code } = {}
            for (let i = 0; i < values.length; i++) {
                // newCodes[keys[i]] = codeArr[i]
                values[i].onCodeChange(codeArr[i])
            }

            //clear old codes
            for (const [id, ref] of Object.entries(lastVisible)) {
                if (!(id in visibleFinal)) {
                    if (id in idMap)
                        ref.onCodeChange()
                }
            }
            setLastVisible(visibleFinal)
        }, [visibleFinal])

        const functions = useMemo(() => {
            return {
                registerHint(ref: HintRef): string {
                    const id = (uniqId++).toString()
                    // console.log('register', id)
                    setIdMap(idMap => {
                        return {...idMap, [id]: ref}
                    })
                    return id;
                },
                unRegisterHint(id: string): void {
                    // console.log('unregister', id)
                    setIdMap(idMap => {
                        const {[id]: _, ...newIdMap} = idMap;
                        return newIdMap;
                    })
                    this.setVisible(id, false)
                },
                setVisible(id: string, visible: boolean) {
                    // console.log('visibility change', id, visible)
                    if (!visible) {

                        setVisibleDict(visibleDict => {
                            const {[id]: _, ...newDict} = visibleDict;
                            return newDict;
                        });
                    } else {
                        const thing = idMap[id]
                        setVisibleDict(visibleDict => {
                            return {...visibleDict, [id]: thing}
                        })
                    }
                },


                // codes,

                push(letter: string) {
                    setCurrentCode(currentCode => currentCode.concat(letter))
                },
                clear() {
                    setCurrentCode([])
                }
            }
        }, [idMap]);

        const handleKeyDown = useCallback((ev: KeyboardEvent) => {
            if (ev.key === 'Escape') {
                functions.clear()
            } else if (alphabet.includes(ev.key)) {
                functions.push(ev.key)
            }
        }, [functions]);

        // console.log('enabled', enabled)
        useEffect(() => {
            if(enabled) {
                // console.log('register key')
                window.addEventListener("keydown", handleKeyDown);

                return () => {
                    // console.log('unregister key')
                    window.removeEventListener("keydown", handleKeyDown);
                };
            }
        }, [handleKeyDown,enabled]);

        return useMemo(() => {
            return <HintContext.Provider value={{...functions, currentCode,enabled}}>
                {props.children}
            </HintContext.Provider>
        }, [functions, currentCode]);

    }
}

export interface HintProps {
    onSelect(): void

}

interface HintViewProps {
    currentCode: Code
    code?: Code
    enable:boolean
}

function _hintView({currentCode, code,enable}: HintViewProps) {

    if (!code) return;

    if (currentCode.length > code.length) return;

    for (let prefixMatch = 0; prefixMatch < currentCode.length; prefixMatch++) {
        if (currentCode[prefixMatch] !== code[prefixMatch]) {
            return;
        }
    }
    return <>
        <span style={{color: enable?'red':'pink'}}>{currentCode.join('')}</span>
        <span style={{color: enable?'lightgray':`#eeeeee`}}>{code.slice(currentCode.length).join('')}</span>
    </>

}

function HintView(props: HintViewProps): JSX.Element {

    return <span>{_hintView(props)}</span>
}

export function Hint(props: HintProps): JSX.Element {
    const ctx = useContext2(HintContext);

    const [id, setID] = useState<string | undefined>();
    const [code, setCode] = useState<Code | undefined>();

    const thing = useMemo<HintRef>(() => {
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
    useEffect(() => {
        if (!code) return;
        if (code.length === ctx.currentCode.length) {
            if (compareArray(code, ctx.currentCode)) {
               // assert(!ctx.enabled, 'expected to be enabled when hint is selected!');

                ctx.clear()
                props.onSelect()
            }
        }
    }, [code, ctx.currentCode]);
    return useMemo(() => {
        if (!id ) return <></>;
        //console.log('render hint')
        return <InView as="span" onChange={visible => {
            ctx.setVisible(id, visible)
        }}>{_hintView({
            code,
            currentCode: ctx.currentCode,
            enable:ctx.enabled
        })}</InView>
    }, [id, code, ctx.currentCode,ctx.enabled]);


}
import {Block} from "~/core/Code";

export interface LiveBlock2 {
    readonly parent?: LiveBlock2
    suggestions():Block[]

}

export interface LivifyParams {
    block: Block,
    parent?: LiveBlock2
}

export interface Lang2 {
    livify(params: LivifyParams): LiveBlock2
}
import {Block} from "~core/Block";
import {SelectionType} from "~render";

export interface LanguageProvider {
    /**
     * @param root
     * @param selection
     */
    suggest(root: Block, selection: SelectionType): Block[]
}
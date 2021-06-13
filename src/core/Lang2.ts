import {Block} from "~/core/Code";

export interface LanguageProvider{
    /**
     * Path[0] provides root
     * @param path
     */
    suggest(path:Block[]):Block[]
}
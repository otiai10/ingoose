// under construction
declare module ingoose {
    export interface Promise {
        success(cb:(any?) => any): Promise;
        error(cb:(Error?) => any): Promise;
    }
    export interface FindQuery {
        only?: any;
        min?: any;
        max?: any;
    }
    export interface Model {
        new(props: any): Model;
        save(): Promise;
        find(query: FindQuery): Promise;
        clear(): Promise;
        remove(key: any): Promise;
    }
    export function model(modelName: string): Model;
}
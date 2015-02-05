// under construction
declare module ingoose {
    export interface Promise {
        success(cb:(any?) => any): Promise;
        error(cb:(Error?) => any): Promise;
    }
    export interface PromiseOpen extends Promise {
        schemas(schemas: Object): Promise;
    }
    export interface FindQuery {
        only?: any;
        min?: any;
        max?: any;
    }
    export interface IModel {
        new(props: any): Model;
        save(): Promise;
        remove(): Promise;
        clear(): Promise;
        find(query: FindQuery): Promise;
    }
    export class Model {
        constructor(modelName: string, props: any);
        save(): Promise;
        remove(): Promise;
        static clear(): Promise;
        static find(query: FindQuery): Promise;
        find(query: FindQuery): Promise;
    }
    export function model(modelName: string): Model;
    export function connect(dbName: string, version: number): PromiseOpen;
}
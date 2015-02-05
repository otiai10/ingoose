// under construction
declare module ingoose {
    export interface Promise {
        success(cb:(any?) => any): Promise;
        error(cb:(Error?) => any): Promise;
    }
    export interface PromiseOpen extends Promise {
        schema(schemas: Object): Promise;
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
        new(props: any): Model;
        save(): Promise;
        clear(): Promise;
        remove(): Promise;
        find(query: FindQuery): Promise;
    }
    export function model(modelName: string): Model;
    export function connect(dbName: string, version: number): PromiseOpen;
}
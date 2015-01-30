
module ingoose {
    var _db: IDBDatabase;
    export interface ModelScheme {
        name: string;
    }
    export class PromiseOpened {
        private openRequest: IDBOpenDBRequest;
        constructor(private dbname: string, private version: number) {}
        public schemas(schemas: Object): PromiseOpened {
            this.openRequest = indexedDB.open(this.dbname, this.version);
            this.openRequest.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
                console.log('ここで与えられたschemaについてどうこうする', schemas);
            };
            this.openRequest.onsuccess = (ev: Event) => {
                _db = this.openRequest.result;
                console.log("うれぴー");
            };
            return this;
        }
        public error(onerror: (Error) => any = () => {}): PromiseOpened {
            this.openRequest.onerror = onerror;
            return this;
        }
    }
    export function connect(dbname: string, version: number): PromiseOpened {
        return new PromiseOpened(dbname, version);
    }
}

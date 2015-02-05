/// <reference path="./schema.ts" />

module ingoose {
    // TODO: #2 exportしたくない（同module内で有効なprivateスコープってどうやるの？）
    export var _db: IDBDatabase;
    export class PromiseOpened {
        constructor(private openRequest: IDBOpenDBRequest) {}
        public schemas(schemas: Object): PromiseOpened {
            SchemaRegistry.upsertAll(schemas);
            this.openRequest.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
                _db = ev.target['result'];
                ev.target['transaction'].onerror = (err) => { throw new Error("xxx00: " + err.toString())};
                for (var name in SchemaRegistry.all()) {
                    if (_db.objectStoreNames.contains(name)) {
                        _db.deleteObjectStore(name);
                    }
                    _db.createObjectStore(name, SchemaRegistry.get(name));
                }
            };
            return this;
        }
        public error(onerror: (Error) => any = () => {}): PromiseOpened {
            this.openRequest.onerror = onerror;
            return this;
        }
        public success(onsuccess: () => any = () => {}): PromiseOpened {
            // overwrite onsuccess
            this.openRequest.onsuccess = (ev: Event) => {
                _db = this.openRequest.result;
                onsuccess()
            };
            return this;
        }
    }
    export function connect(dbname: string, version: number): PromiseOpened {
        var openRequest = indexedDB.open(dbname, version);
        return new PromiseOpened(openRequest);
    }
}

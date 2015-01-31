
module ingoose {
    // TODO: exportしたくない（同module内で有効なprivateスコープってどうやるの？）
    export var _db: IDBDatabase;
    export interface ModelScheme {
        name: string;
    }
    export class PromiseOpened {
        private openRequest: IDBOpenDBRequest;
        constructor(private dbname: string, private version: number) {}
        private defaultOnSuccessListener(ev: Event) {
            _db = this.openRequest.result;
            console.log("openRequestは成功してる");
        }
        public schemas(schemas: Object[]): PromiseOpened {
            this.openRequest = indexedDB.open(this.dbname, this.version);
            this.openRequest.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
                _db = ev.target['result'];
                ev.target['transaction'].onerror = (err) => { throw new Error("xxx00: " + err.toString())};
                for (var name in schemas) {
                    if (!schemas.hasOwnProperty(name)) continue;
                    if (typeof schemas[name] !== "object") continue;
                    console.log("_0", name);
                    if (_db.objectStoreNames.contains(name)) {
                        console.log("_1", name);
                        _db.deleteObjectStore(name);
                    }
                    console.log("_2", name);
                    _db.createObjectStore(name, schemas[name]);
                    console.log("_3", name);
                }
            };
            this.openRequest.onsuccess = this.defaultOnSuccessListener;
            return this;
        }
        public error(onerror: (Error) => any = () => {}): PromiseOpened {
            this.openRequest.onerror = onerror;
            return this;
        }
        public success(onsuccess: () => any = () => {}): PromiseOpened {
            // overwrite onsuccess
            this.openRequest.onsuccess = (ev: Event) => {
                this.defaultOnSuccessListener(ev);
                onsuccess()
            };
            return this;
        }
    }
    export function connect(dbname: string, version: number): PromiseOpened {
        return new PromiseOpened(dbname, version);
    }
}

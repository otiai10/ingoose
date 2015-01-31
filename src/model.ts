/// <reference path="./connection.ts" />

module ingoose {
    export interface ModelConstructable {
        new(modelName: string, opt?: any): Model;
    }
    export class PromiseModelTx {
        constructor(private cursorRequest: IDBRequest) {}
        public success(cb: (any) => any): PromiseModelTx {
            // TODO: 生を渡したらおもしろくない.
            this.cursorRequest.onsuccess = cb;
            return this;
        }
        public error(cb: (err) => any): PromiseModelTx {
            this.cursorRequest.onerror = cb;
            return this;
        }
    }
    class HotCore {
        constructor(public db: IDBDatabase, private modelName: string) {
        }
        public tx(): IDBTransaction {
            return this.db.transaction([this.modelName], "readwrite"/* TODO: とりあえずハード */);
        }
        public objectStore(): IDBObjectStore {
            return this.tx().objectStore(this.modelName);
        }
    }
    class _Model {
        private __core: HotCore;
        constructor(db, modelName) {
            this.__core = new HotCore(db, modelName);
        }
        public save(): PromiseModelTx {
            var store = this.__core.objectStore();
            var toBeStored = new Object();
            for (var i in this) {
                if (!this.hasOwnProperty(i)) continue;
                if (String(i) == '__core') continue;
                toBeStored[i] = this[i];
            }
            console.log('toBeStored', toBeStored);
            var req: IDBRequest = store.put(toBeStored);
            var promise: PromiseModelTx = new PromiseModelTx(req);
            return promise;
        }
    }
    export class Model extends _Model {
        public static __name: string;
        constructor(modelName: string, props: any) {
            // bind inner connected db
            super(_db, modelName);
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    this[i] = props[i];
                }
            }
        }
    }
    export function model(modelName: string, opt: any = {}): any /* ModelConstructable */ {

        // clone Model class definition
        var m = function(props: any = {}) {
            m['__modelName'] = modelName;
            Model.call(this, m['__modelName'], props);
        };
        m.prototype = Model.prototype;

        return m;
    }
}
/// <reference path="./connection.ts" />

module ingoose {
    export interface ModelConstructable {
        new(modelName: string, opt?: any): Model;
    }
    export class PromiseModelTx {
        constructor(private cursorRequest: IDBRequest) {}
        public success(cb: (any) => any): PromiseModelTx {
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
            // TODO: hard "readwrite"
            return this.db.transaction([this.modelName], "readwrite");
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
            var toBeStored = {};
            for (var i in this) {
                if (!this.hasOwnProperty(i)) continue;
                if (String(i) == '__core') continue;// skip __core
                toBeStored[i] = this[i];
            }
            var req: IDBRequest = store.put(toBeStored);
            return new PromiseModelTx(req);
        }
    }

    /**
     * active model of ingoose.
     * @param modelName Name of this model and storedObject
     * @param props Properties to be bound on this model
     */
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

    /**
     * provide extended Model class definition.
     * @param modelName
     * @param opt
     * @returns ModelConstructable
     */
    export function model(modelName: string, opt: any = {}): any /* ModelConstructable */ {

        // clone Model class definition
        var ConstructableModel = function(props: any = {}) {
            ConstructableModel['__modelName'] = modelName;
            Model.call(this, ConstructableModel['__modelName'], props);
        };
        ConstructableModel.prototype = Model.prototype;

        return ConstructableModel;
    }
}
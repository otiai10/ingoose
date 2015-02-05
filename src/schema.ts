
module ingoose.SchemaRegistry {
    var _SchemaRegistry: Object = {};
    export interface ModelSchema {
        keyPath: string;
        autoIncrement?: boolean;
        // TODO: enhancement
        required?: string[];
        // TODO: enhancement
        defaults?: Object;
    }
    export function upsertAll(schemas: Object) {
        for (var name in schemas) {
            if (!schemas.hasOwnProperty(name)) continue;
            if (typeof schemas[name] !== 'object') continue;
            if (!validate(schemas[name])) continue;
            _SchemaRegistry[name] = schemas[name];
        }
    }
    function validate(schemaLike: Object): boolean {
        return !!schemaLike['keyPath'];
    }
    export function all(): Object {
        return _SchemaRegistry;
    }
    export function get(name: string): ModelSchema {
        var schema = _SchemaRegistry[name];
        if (!schema || typeof schema != 'object') return null;
        return <ModelSchema>_SchemaRegistry[name];
    }
    export function keyOf(name: string): string {
        var schema = get(name);
        if (!schema) return "";
        return schema['keyPath'];
    }
}
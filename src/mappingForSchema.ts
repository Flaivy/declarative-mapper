import { TPropertiesMap, TValueMap } from "./TMapping";
import { JSONSchema4 } from 'json-schema';
import { default as sampleForSchema } from './sampleForSchema';

function getObjectFields(obj: { [k: string]: JSONSchema4 }): TPropertiesMap {
	const map: TPropertiesMap = {};
	for (const [fieldName, fieldSchema] of Object.entries(obj)) {
		map[fieldName] = mappingForSchema(fieldSchema);
	}
	return map;
}

/**
 * Create mapping template for a given JSON schema
 */
export default function mappingForSchema(schema: JSONSchema4): TValueMap {

	const { title, type, properties, items } = schema;

	if (type === 'object') {
		if (!properties)
			throw new TypeError(`"properties" definition is empty in "${title || JSON.stringify(schema)}"`);

		return {
			map: getObjectFields(properties)
		};
	}
	else if (type === 'array') {
		if (!items)
			throw new TypeError(`"items" definition is empty in "${title || JSON.stringify(schema)}"`);

		if (Array.isArray(items)) {
			const map: TPropertiesMap = {};
			items.forEach((item, index) => {
				map[index] = mappingForSchema(item);
			});
			return { map };
		}
		else {
			const itemsMapping = mappingForSchema(items);
			return {
				forEach: '',
				map: typeof itemsMapping === 'object' && 'map' in itemsMapping ?
					itemsMapping.map :
					{ '*': itemsMapping }
			};
		}
	}
	else if(type === 'boolean' || type === 'integer' || type === 'null' || type === 'number' || type === 'string') {
		return JSON.stringify(sampleForSchema(schema));
	}
	else {
		throw new TypeError(`Unexpected type "${type}" in "${title || JSON.stringify(schema)}"`);
	}
}

import * as fs from "fs";
import xmlFormat from "xml-formatter";
import { portalDefinitions } from "./portalDefinitions";

export namespace Portal {

	type Definitions = typeof portalDefinitions;
	export type Events = Definitions["events"][number]["name"];
	export type Objects = Definitions["objects"][number]["name"];
	type SelectionLists = {
		[key in `${number}` & keyof Definitions["selectionLists"]as Definitions["selectionLists"][key]["name"]]: {
			returnType: Definitions["selectionLists"][key]["returnType"],
			selectionValues: Definitions["selectionLists"][key]["selectionValues"][number]["name"],
		}
	}
	export type Types = Definitions["types"][number];
	export namespace Values {
		type ExtractParameters<T> = {
			[key in keyof T]: T[key] extends { parameterTypes: any } ? T[key]["parameterTypes"] extends readonly [] ? "Any" : T[key]["parameterTypes"][number] : never
		}
		type ValuesActions = [...Definitions["values"], ...Definitions["actions"]]
		type Raw = {
			[returnType in Types]: {
				[index in `${number}` & keyof ValuesActions as ExtractParameters<Extract<ValuesActions[index]["functionSignatures"][number], { returnType: returnType }>["parameterTypes"]> extends never ? never : ValuesActions[index]["name"]]:
				ExtractParameters<({ returnType: returnType } & ValuesActions[index]["functionSignatures"][number])["parameterTypes"]>
			}
		} & {
			Void: {
				[index in `${number}` & keyof ValuesActions as ExtractParameters<Exclude<ValuesActions[index]["functionSignatures"][number], { returnType: any }>["parameterTypes"]> extends never ? never : ValuesActions[index]["name"]]:
				ExtractParameters<Exclude<ValuesActions[index]["functionSignatures"][number], { returnType: any }>["parameterTypes"]>
			}
		}
		type GenerateBlockFormat<T> = {
			[key in keyof T]: T[key] extends readonly [...any[]] ?
			T[key] extends readonly [] ? key
			// : T[key] extends readonly [any] ? MapToType<T[key][0]> 👈 Triggers Typescript infinite loop error?
			: {
				[element in key]: MapSetToType<T[element]>
			} : never
		}[keyof T];
		type MapSetToType<T, Result = {
			-readonly [index in keyof T]: MapToType<T[index]>
		}> = Result;
		type MapToType<T> =
			T extends "Any" ? Any
			: T extends "String" ? String
			: T extends "Number" ? Number
			: T extends "Boolean" ? Boolean
			: T extends "Global" ? Global
			: T extends "Player" ? Player
			: T extends "TeamId" ? TeamId
			: T extends "Vector" ? Vector
			: T extends "Array" ? Array
			: T extends "Enum_CharacterGadgets" ? Enum_CharacterGadgets
			: T extends "Enum_CustomMessages" ? Enum_CustomMessages
			: T extends "Enum_Factions" ? Enum_Factions
			: T extends "Enum_InventorySlots" ? Enum_InventorySlots
			: T extends "Enum_SoldierStateNumber" ? Enum_SoldierStateNumber
			: T extends "Enum_SoldierStateBool" ? Enum_SoldierStateBool
			: T extends "Enum_SoldierStateVector" ? Enum_SoldierStateVector
			: T extends "Enum_PrimaryWeapons" ? Enum_PrimaryWeapons
			: T extends "Enum_SecondaryWeapons" ? Enum_SecondaryWeapons
			: T extends "Enum_OpenGadgets" ? Enum_OpenGadgets
			: T extends "Enum_Throwables" ? Enum_Throwables
			: T extends "Enum_MeleeWeapons" ? Enum_MeleeWeapons
			: T extends "Enum_SoldierKits" ? Enum_SoldierKits
			: T extends "Enum_MedGadgetTypes" ? Enum_MedGadgetTypes
			: T extends "Message" ? Message
			: T extends "Enum_RestrictedInputs" ? Enum_RestrictedInputs
			: T extends "Enum_ResupplyTypes" ? Enum_ResupplyTypes
			: T extends "Variable" ? Variable
			: T

		export type Void = GenerateBlockFormat<Raw["Void"]>
		export type String = string | GenerateBlockFormat<Raw["String"]>
		export type Number = number | GenerateBlockFormat<Raw["Number"]>
		export type Boolean = boolean | GenerateBlockFormat<Raw["Boolean"]>
		export type Global = GenerateBlockFormat<Raw["Global"]>
		export type Player = GenerateBlockFormat<Raw["Player"]>
		export type TeamId = GenerateBlockFormat<Raw["TeamId"]>
		export type Vector = GenerateBlockFormat<Raw["Vector"]>
		export type Array = GenerateBlockFormat<Raw["Array"]>
		export type Message = GenerateBlockFormat<Raw["Message"]>
		export type Enum_CharacterGadgets = GenerateBlockFormat<Raw["Enum_CharacterGadgets"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_CharacterGadgets" })["selectionValues"]
		export type Enum_CustomMessages = GenerateBlockFormat<Raw["Enum_CustomMessages"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_CustomMessages" })["selectionValues"]
		export type Enum_Factions = GenerateBlockFormat<Raw["Enum_Factions"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_Factions" })["selectionValues"]
		export type Enum_InventorySlots = GenerateBlockFormat<Raw["Enum_InventorySlots"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_InventorySlots" })["selectionValues"]
		export type Enum_SoldierStateNumber = GenerateBlockFormat<Raw["Enum_SoldierStateNumber"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_SoldierStateNumber" })["selectionValues"]
		export type Enum_SoldierStateBool = GenerateBlockFormat<Raw["Enum_SoldierStateBool"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_SoldierStateBool" })["selectionValues"]
		export type Enum_SoldierStateVector = GenerateBlockFormat<Raw["Enum_SoldierStateVector"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_SoldierStateVector" })["selectionValues"]
		export type Enum_PrimaryWeapons = GenerateBlockFormat<Raw["Enum_PrimaryWeapons"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_PrimaryWeapons" })["selectionValues"]
		export type Enum_SecondaryWeapons = GenerateBlockFormat<Raw["Enum_SecondaryWeapons"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_SecondaryWeapons" })["selectionValues"]
		export type Enum_OpenGadgets = GenerateBlockFormat<Raw["Enum_OpenGadgets"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_OpenGadgets" })["selectionValues"]
		export type Enum_Throwables = GenerateBlockFormat<Raw["Enum_Throwables"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_Throwables" })["selectionValues"]
		export type Enum_MeleeWeapons = GenerateBlockFormat<Raw["Enum_MeleeWeapons"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_MeleeWeapons" })["selectionValues"]
		export type Enum_SoldierKits = GenerateBlockFormat<Raw["Enum_SoldierKits"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_SoldierKits" })["selectionValues"]
		export type Enum_MedGadgetTypes = GenerateBlockFormat<Raw["Enum_MedGadgetTypes"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_MedGadgetTypes" })["selectionValues"]
		export type Enum_RestrictedInputs = GenerateBlockFormat<Raw["Enum_RestrictedInputs"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_RestrictedInputs" })["selectionValues"]
		export type Enum_ResupplyTypes = GenerateBlockFormat<Raw["Enum_ResupplyTypes"]> | (SelectionLists[keyof SelectionLists] & { returnType: "Enum_ResupplyTypes" })["selectionValues"]
		export type Any =
			| String
			| Number
			| Boolean
			| Global
			| Player
			| TeamId
			| Vector
			| Array
			| Enum_CharacterGadgets
			| Enum_CustomMessages
			| Enum_Factions
			| Enum_InventorySlots
			| Enum_SoldierStateNumber
			| Enum_SoldierStateBool
			| Enum_SoldierStateVector
			| Enum_PrimaryWeapons
			| Enum_SecondaryWeapons
			| Enum_OpenGadgets
			| Enum_Throwables
			| Enum_MeleeWeapons
			| Enum_SoldierKits
			| Enum_MedGadgetTypes
			| Message
			| Enum_RestrictedInputs
			| Enum_ResupplyTypes
	}
	export type Procedure = Actions | Array<Actions>
	export type Actions =
		| Portal.Values.Void
		| { While: Values.Boolean, Do: Procedure }
		| { ForVariable: [variable: Variable, from: Values.Number, to: Values.Number, by: Values.Number], Do: Portal.Values.Void[] }
		| { If: Values.Boolean, Do: Procedure }
		| { If: Values.Boolean, Do: Procedure, Else: Procedure }
		| [{ If: Values.Boolean, Do: Procedure }, ...{ ElseIf: Values.Boolean, Do: Procedure }[], { Else: Procedure }]
		| "Break"
		| "Continue"
	export type Variable =
		| { type: "Global", variable: string }
		| { type: "Team", variable: string, for: Values.TeamId }
		| { type: "Player", variable: string, for: Values.Player }
	export type Mod = {
		rules: Array<
			& {
				name: string,
				conditions: Array<Values.Boolean>,
				actions: Array<Actions>,
			}
			& (
				| {
					eventType: Exclude<Events, "Ongoing">
				}
				| {
					eventType: "Ongoing",
					objectType: Objects,
				}
			)
		>,
	};

	function parseAccessor(value: string, inferredTypes: Types[] | null) {
		const type = inferredTypes[0].substr("Enum_".length);
		return [
			{ type: `${type}Item` },
			{ id: generateUID() },
			{ field: { name: "VALUE-0", inner: type } },
			{ field: { name: "VALUE-1", inner: value } },
		];
	}

	function parseVariable(value: Variable): any {
		return [
			{ type: "variableReferenceBlock" },
			{ id: generateUID() },
			...(value.type == "Global" ? [] : [{ mutation: { isObjectVar: false } }]),
			{ field: { name: "OBJECTTYPE", inner: value.type } },
			{
				field: {
					name: "VAR",
					id: generateUID(),
					variableType: value.type,
					inner: value.variable,
				}
			},
		];
	}

	const definitionValuesAndActions = [...portalDefinitions.values, ...portalDefinitions.actions, ...portalDefinitions.controlActions];
	function parseFunction(value: any, inferredTypes: Types[] | null): any {
		let [type, parameters] = Object.entries(value)[0];
		const parameterInferredTypes = (definitionValuesAndActions
			.find(value => value.name == type).functionSignatures as any)
			.find((func: any) => inferredTypes == null || inferredTypes.includes(func.returnType)).parameterTypes
			.map((param: any) => param.parameterTypes.length == 0 ? null : param.parameterTypes);
		return Array.isArray(parameters) ? [
			{ type },
			{ id: generateUID() },
			...parameters.map((parameter: any, index: number) => ({
				value: {
					name: `VALUE-${index}`,
					block: parseValue(parameter, parameterInferredTypes[index]),
				}
			}))
		] : {
			type,
			id: generateUID(),
			value: {
				name: "VALUE-0",
				block: parseValue(parameters, parameterInferredTypes[0]),
			},
		};
	}

	function parseProcedure(value: any): any {
		return toLinkedList("block", Array.isArray(value) ? value.map(value => parseValue(value, null)) : [parseValue(value, null)])
	}

	function parseIfStatement(value: any): any {
		if ("If" in value) {
			if (!("Else" in value)) {
				return {
					type: "If",
					id: generateUID(),
					value: {
						name: "VALUE-0",
						block: parseValue(value.If, null),
					},
					statement: {
						name: "DO",
						...parseProcedure(value.Do),
					},
				}
			}
			return [
				{ type: "If" },
				{ id: generateUID() },
				{ mutation: { else: 1 } },
				{ value: { name: "VALUE-0", block: parseValue(value.If, null) } },
				{
					statement: {
						name: "DO",
						...parseProcedure(value.Do),
					}
				},
				{
					statement: {
						name: "ELSE",
						...parseProcedure(value.Else),
					}
				},
			];
		}
		const elseIfs = value.filter((element: any) => "ElseIf" in element);
		return [
			{ type: "If" },
			{ id: generateUID() },
			{
				mutation: {
					elseif: elseIfs.length,
					else: 1
				}
			},
			{ value: { name: "VALUE-0", block: parseValue(value[0].If, null) } },
			{
				statement: {
					name: "DO",
					...parseProcedure(value[0].Do),
				}
			},
			...elseIfs.flatMap((elseIf: any, index: number) => [{
				statement: {
					name: `IF${index + 1}`,
					block: parseValue(elseIf.ElseIf, null),
				}
			},
			{
				statement: {
					name: `DO${index + 1}`,
					...parseProcedure(elseIf.Do),
				}
			}]),
			{
				statement: {
					name: "ELSE",
					...parseProcedure(value[value.length - 1].Else),
				}
			},
		];
	}

	function parseLoopStatement(value: any): any {
		const result = parseFunction(value, null);
		const statement = {
			name: "DO",
			...parseProcedure(value.Do),
		};
		if (Array.isArray(result)) {
			return [
				...result,
				{ statement },
			]
		}
		return {
			...result,
			statement,
		};
	}

	function parseValue(value: any, inferredTypes: Types[] | null): any {
		if (typeof value == "string") {
			if (inferredTypes != null) {
				if (inferredTypes.find(inferredType => inferredType.includes("Enum_"))) {
					return parseAccessor(value, inferredTypes);
				}
				if (inferredTypes.includes("String")) {
					return {
						type: "Text",
						id: generateUID(),
						field: {
							name: "TEXT",
							inner: value,
						},
					};
				}
			}
			return {
				type: value,
				id: generateUID(),
			};
		}
		if (typeof value == "number") {
			return {
				type: "Number",
				id: generateUID(),
				field: {
					name: "NUM",
					inner: value,
				},
			};
		}
		if (typeof value == "boolean") {
			return {
				type: "Boolean",
				id: generateUID(),
				field: {
					name: "BOOL",
					inner: `${value}`.toUpperCase(),
				},
			};
		}
		if (typeof value == "object") {
			if ("variable" in value) {
				return parseVariable(value);
			}
			if ("If" in value || Array.isArray(value) && "If" in value[0]) {
				return parseIfStatement(value);
			}
			if ("Do" in value) {
				return parseLoopStatement(value);
			}
			else {
				return parseFunction(value, inferredTypes);
			}
		}
		return { "error": true };
	}

	function toLinkedList(key: string, array: any[]) {
		const result = array
			.reverse()
			.reduce((result, current) => {
				if (result == null) {
					return current
				}
				if (Array.isArray(current)) {
					return [...current, { next: { [key]: result } }];
				}
				return { ...current, next: { [key]: result } };
			}, null);

		if (result == null) {
			return {};
		}
		return {
			[key]: result,
		};
	}

	function generateUID() {
		return (Math.random() + 1).toString(36).substring(2);
	}

	export function toBlockly(mod: Portal.Mod): any {
		const { rules } = mod;
		return {
			block: {
				xmlns: "https://developers.google.com/blockly/xml",
				type: "modBlock",
				id: generateUID(),
				deletable: false,
				statement: {
					name: "RULES",
					...toLinkedList("block", rules.map(rule => ([
						{ type: "ruleBlock" },
						{
							mutation: {
								isOnGoingEvent: rule.eventType == "Ongoing"
							}
						},
						{ field: { name: "NAME", inner: rule.name } },
						{ field: { name: "EVENTTYPE", inner: rule.eventType } },
						...(rule.eventType != "Ongoing" ? [] : [{ field: { name: "OBJECTTYPE", inner: rule.objectType } }]),
						{
							statement:
							{
								name: "CONDITIONS",
								...toLinkedList("block", rule.conditions.map(condition => ({
									type: "conditionBlock",
									value: {
										name: "CONDITION",
										block: parseValue(condition, null),
									},
								}))),
							}
						},
						{
							statement:
							{
								name: "ACTIONS",
								...toLinkedList("block", rule.actions.map(action => parseValue(action, null))),
							}
						},
					]))),
				},
			},
		};
	}
}

namespace Blockly {

	export function toXML(json: any): string {
		return "inner" in json
			? json.inner
			: entries(json)
				.filter(([key, value]) => typeof value == "object")
				.map(([key, value]) => toXMLInner(key, value))
				.join("");
	}

	function entries(json: any): Array<[string, any]> {
		if (Array.isArray(json)) {
			return json.map(element => Object.entries(element)[0])
		}
		return Object.entries(json);
	}

	function toXMLInner(key: string, json: any): string {
		const properties = entries(json)
			.filter(([key, value]) => key != "inner" && typeof value != "object")
			.map(([key, value]) => ` ${key}="${value.toString()}"`).join("");
		const children = toXML(json);
		return `<${key}${properties}>${children}</${key}>`;
	}
}

export function buildPortalMod(mod: Portal.Mod) {
	const blocklyOutput = Portal.toBlockly(mod);
	const xmlOutput = Blockly.toXML(blocklyOutput);

	(async () => {
		await new Promise(resolve => fs.writeFile('output-intermediate.json', JSON.stringify(blocklyOutput, null, 4), resolve));
		await new Promise(resolve => fs.writeFile('output-formatted.xml', xmlFormat(xmlOutput), resolve));
		await new Promise(resolve => fs.writeFile('output-useable.xml', xmlOutput, resolve));
		console.log(`New files generated @ ${new Date().toTimeString()}`);
		console.log(`Once you copy the contents of \`output-useable.xml\`, You can \`Paste From Clipboard\` in Battlefield Portal using the Chrome Extension \`BF2042 Portal Extensions\``);
	})();
}
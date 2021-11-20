import * as fs from "fs";
import xmlFormat from "xml-formatter";
import { definitions } from "definitions";


namespace Portal {

	export type Definitions = typeof definitions;
	export type Events = Definitions["events"][number]["name"];
	export type Objects = Definitions["objects"][number]["name"];
	export type SelectionLists = {
		[key in `${number}` & keyof Definitions["selectionLists"]as Definitions["selectionLists"][key]["name"]]: {
			returnType: Definitions["selectionLists"][key]["returnType"],
			selectionValues: Definitions["selectionLists"][key]["selectionValues"][number]["name"],
		}
	}
	export type Types = Definitions["types"][number] | "Void";
	export type ExtractReturnType<T> = T extends { returnType: any } ? T["returnType"] : "Void"
	export type ExtractParameters<T, Result = {
		[key in keyof T]: T[key] extends { parameterTypes: any } ? T[key]["parameterTypes"] extends readonly [] ? "Any" : T[key]["parameterTypes"][number] : "error: lat"
	}> = Result
	export type Values = {
		[returnType in Types]: { [
			index
			in `${number}` & keyof Definitions["values"]
			as
			Definitions["values"][index] extends { functionSignatures: ReadonlyArray<{ readonly returnType: returnType }> }
			? Definitions["values"][index]["name"]
			: Definitions["values"][index] extends { functionSignatures: ReadonlyArray<{ readonly returnType: any }> }
			?  never
			: returnType extends "Void"
			? Definitions["values"][index]["name"]
			: never
			]:
			ExtractParameters<({ returnType: returnType } & Definitions["values"][index]["functionSignatures"][number])["parameterTypes"]>
		}
	}

	export type Tester = Types.MapToType<"Any">

	export type MapSetToType<T, Result = {
		-readonly [index in keyof T]: Types.MapToType<T[index]>
	}> = Result;
	export type GenerateBlockFormat<T> = {
		[key in keyof T]: T[key] extends readonly [...any[]] ?
		T[key] extends readonly [] ? key
		// : T[key] extends readonly [any] ? MapToType<T[key][0]> 👈 Triggers Typescript infinite loop error?
		: {
			[element in key]: MapSetToType<T[element]>
		} : "error: rifle"
	}[keyof T]

	export namespace Types {
		export type MapToType<T> =
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
			: "err"
		export type String = string | GenerateBlockFormat<Values["String"]>
		export type Number = number | GenerateBlockFormat<Values["Number"]>
		export type Boolean = boolean | GenerateBlockFormat<Values["Boolean"]>
		export type Global = GenerateBlockFormat<Values["Global"]>
		export type Player = GenerateBlockFormat<Values["Player"]>
		export type TeamId = GenerateBlockFormat<Values["TeamId"]>
		export type Vector = GenerateBlockFormat<Values["Vector"]>
		export type Array = GenerateBlockFormat<Values["Array"]>
		export type Enum_CharacterGadgets = GenerateBlockFormat<Values["Enum_CharacterGadgets"]>
		export type Enum_CustomMessages = GenerateBlockFormat<Values["Enum_CustomMessages"]>
		export type Enum_Factions = GenerateBlockFormat<Values["Enum_Factions"]>
		export type Enum_InventorySlots = GenerateBlockFormat<Values["Enum_InventorySlots"]>
		export type Enum_SoldierStateNumber = GenerateBlockFormat<Values["Enum_SoldierStateNumber"]>
		export type Enum_SoldierStateBool = GenerateBlockFormat<Values["Enum_SoldierStateBool"]>
		export type Enum_SoldierStateVector = GenerateBlockFormat<Values["Enum_SoldierStateVector"]>
		export type Enum_PrimaryWeapons = GenerateBlockFormat<Values["Enum_PrimaryWeapons"]>
		export type Enum_SecondaryWeapons = GenerateBlockFormat<Values["Enum_SecondaryWeapons"]>
		export type Enum_OpenGadgets = GenerateBlockFormat<Values["Enum_OpenGadgets"]>
		export type Enum_Throwables = GenerateBlockFormat<Values["Enum_Throwables"]>
		export type Enum_MeleeWeapons = GenerateBlockFormat<Values["Enum_MeleeWeapons"]>
		export type Enum_SoldierKits = GenerateBlockFormat<Values["Enum_SoldierKits"]>
		export type Enum_MedGadgetTypes = GenerateBlockFormat<Values["Enum_MedGadgetTypes"]>
		export type Message = GenerateBlockFormat<Values["Message"]>
		export type Enum_RestrictedInputs = GenerateBlockFormat<Values["Enum_RestrictedInputs"]>
		export type Enum_ResupplyTypes = GenerateBlockFormat<Values["Enum_ResupplyTypes"]>
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

	export type SpecialCases = Values["Void"]

	const tester: Types.Boolean =

	export type Mod = {
		rules: Array<
			& {
				name: string,
				conditions: Array<Types.Boolean>,
				actions: Array<Voids>,
			}
			& (
				| {
					eventType: Events
				}
				| {
					eventType: "Ongoing",
					objectType: Objects,
				}
			)
		>,
	};

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

	function parseFunction(value: Values): any {
		let [type, parameters] = Object.entries(value)[0]
		return Array.isArray(parameters) ? [
			{ type },
			{ id: generateUID() },
			...parameters.map((parameter: any, index: number) => ({
				value: {
					name: `VALUE-${index}`,
					block: parseValue(parameter),
				}
			}))
		] : {
			type,
			id: generateUID(),
			value: {
				name: "VALUE-0",
				block: parseValue(parameters),
			},
		};
	}

	function parseProcedure(value: any): any {
		return toLinkedList("block", Array.isArray(value) ? value.map(parseValue) : [parseValue(value)])
	}

	function parseIfStatement(value: any): any {
		if ("If" in value) {
			if (!("Else" in value)) {
				return {
					type: "If",
					id: generateUID(),
					value: {
						name: "VALUE-0",
						block: parseValue(value.If),
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
				{ value: { name: "VALUE-0", block: parseValue(value.If) } },
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
			{ value: { name: "VALUE-0", block: parseValue(value[0].If) } },
			{
				statement: {
					name: "DO",
					...parseProcedure(value[0].Do),
				}
			},
			...elseIfs.flatMap((elseIf: any, index: number) => [{
				statement: {
					name: `IF${index + 1}`,
					block: parseValue(elseIf.ElseIf),
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
		const result = parseFunction(value);
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

	function tryParseAccessor(value: string) {
		const filteredAccessors = Object
			.entries(playerStateAccessors)
			.filter(([_, names]) => names.findIndex(name => name == value) >= 0)
		if (filteredAccessors.length > 0) {
			const [type] = filteredAccessors[0];
			return [
				{ type: `${type}Item` },
				{ id: generateUID() },
				{ field: { name: "VALUE-0", inner: type } },
				{ field: { name: "VALUE-1", inner: value } },
			];
		}
		return false;
	}

	function parseValue(value: Values): any {
		if (typeof value == "string") {
			return tryParseAccessor(value) || {
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
				return parseFunction(value);
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

	export function toBlockly(mod: PortalMod): any {
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
										block: parseValue(condition),
									},
								}))),
							}
						},
						{
							statement:
							{
								name: "ACTIONS",
								...toLinkedList("block", rule.actions.map(parseValue)),
							}
						},
					]))),
				},
			},
		};
	}
}

namespace PortalEnhanced {

	type PortalModEnhanced = {

		rules: Array<
			& {
				name: string,
				conditions: Array<Booleans>,
				actions: Array<Voids>,
			}
			& (
				| {
					eventType:
					| "OnGameModeEnding"
					| "OnGameModeStarted"
					| "OnMandown"
					| "OnPlayerDeployed"
					| "OnPlayerDied"
					| "OnPlayerEarnedKill"
					| "OnPlayerIrreversiblyDead"
					| "OnPlayerJoinGame"
					| "OnPlayerLeaveGame"
					| "OnRevived"
					| "OnTimeLimitReached",
				}
				| {
					eventType: "Ongoing",
					objectType: "Global" | "Player" | "Team",
				}
			)
		>,
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

function IncrementPlayerScore(skip = 1): Voids {
	return { SetGamemodeScore: ["EventPlayer", { Add: [{ GetGamemodeScore: "EventPlayer" }, skip] }] };
}

const exampleMod: Portal.Mod = {
	rules: [
		{
			name: "Game Start",
			eventType: "OnGameModeStarted",
			conditions: [
				{ And: [{ IsFaction, "Boolean"] }
			],
			actions: [
				// { DisplayGameModeMessage: [
			],
		}
	],
};

const blocklyOutput = Portal.toBlockly(exampleMod);
const xmlOutput = Blockly.toXML(blocklyOutput);

(async () => {
	await new Promise(resolve => fs.writeFile('output-intermediate.json', JSON.stringify(blocklyOutput, null, 4), resolve));
	await new Promise(resolve => fs.writeFile('output-formatted.xml', xmlFormat(xmlOutput), resolve));
	await new Promise(resolve => fs.writeFile('output-useable.xml', xmlOutput, resolve));
	console.log(`New files generated @ ${new Date().toTimeString()}`);
})();

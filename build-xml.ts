import * as fs from "fs";
import xmlFormat from "xml-formatter";

type Players =
	| "EventPlayer"
	| "EventOtherPlayer"
	| { ClosestPlayerTo: Vectors }

type Teams =
	| "EventTeam"
	| { GetTeamId: Players }

type Numbers =
	| "GetTargetScore"
	| { GetGamemodeScore: Players }
	| { DistanceBetween: [Vectors, Vectors] }
	| { Add: [Numbers, Numbers] }
	| number

type Booleans =
	| { NotEqualTo: [Players, Players] }
	| { NotEqualTo: [Numbers, Numbers] }
	| { Equals: [Players, Players] }
	| { Equals: [Numbers, Numbers] }
	| { LessThan: [Numbers, Numbers] }
	| { GetSoldierState: [Players, SoldierStateBool] }
	| boolean

type Procedure = Voids | Array<Voids>

type Voids =
	| { SetGamemodeScore: [Players, Numbers] }
	| { EndRound: Players }
	| { EnableDefaultScoring: Booleans }
	| { SetRoundTimeLimit: Numbers }
	| { SetTargetScore: Numbers }
	| { While: Booleans, Do: Procedure }
	| { ForVariable: [variable: Variable, from: Numbers, to: Numbers, by: Numbers], Do: Voids[] }
	| { If: Booleans, Do: Procedure }
	| { If: Booleans, Do: Procedure, Else: Procedure }
	| [{ If: Booleans, Do: Procedure }, ...{ ElseIf: Booleans, Do: Procedure }[], { Else: Procedure }]
	| "Break"
	| "Continue"

type Variable =
	| { type: "Global", variable: string }
	| { type: "Team", variable: string, for: Teams }
	| { type: "Player", variable: string, for: Players }

type Vectors =
	{ GetSoldierState: [Players, SoldierStateVector] }

type PortalValues = Players | Numbers | Booleans | Voids | SoldierStateVector | SoldierStateBool | SoldierStateNumber;

const playerStateAccessors = {
	SoldierStateVector: [
		"GetPosition",
		"GetLinearVelocity"
	],
	SoldierStateBool: [
		"IsAISoldier",
		"IsAlive",
		"IsBeingRevived",
		"IsCrouching",
		"IsDead",
		"IsFiring",
		"IsInAir",
		"IsInteracting",
		"IsInVehicle",
		"IsInWater",
		"IsJumping",
		"IsMandown",
		"IsOnGround",
		"IsParachuting",
		"IsProne",
		"IsReloading",
		"IsReviving",
		"IsSprinting",
		"IsStanding",
		"IsVaulting",
		"IsZooming",
	],
	SoldierStateNumber: [
		"CurrentHealth",
		"CurrentInventoryAmmo",
		"CurrentInventoryMagazineAmmo",
		"MaxHealth",
		"NormalizedHealth",
		"Speed",
	],
} as const;

type SoldierStateVector = typeof playerStateAccessors["SoldierStateVector"][number];
type SoldierStateBool = typeof playerStateAccessors["SoldierStateBool"][number]
type SoldierStateNumber = typeof playerStateAccessors["SoldierStateNumber"][number]

type PortalMod = {
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
};

function parseVariable(value: Variable): any {
	return {
		type: "variableReferenceBlock",
		id: generateUID(),
		...(value.type == "Global" ? {} : { mutation: { isObjectVar: false } }),
		field: [{
			name: "OBJECTTYPE",
			inner: value.type,
		}, {
			name: "VAR",
			id: generateUID(),
			variableType: value.type,
			inner: value.variable,
		}],
	};
}

function parseFunction(value: PortalValues): any {
	let [type, parameters] = Object.entries(value)[0]
	return Array.isArray(parameters) ? [
		{ type },
		{ id: generateUID },
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

function tryParseAccessor(value: string) {
	const filteredAccessors = Object
		.entries(playerStateAccessors)
		.filter(([_, names]) => names.findIndex(name => name == value) >= 0)
	if (filteredAccessors.length > 0) {
		const [type] = filteredAccessors[0];
		return {
			type: `${type}Item`,
			id: generateUID(),
			field: [
				{ name: "VALUE-0", inner: type },
				{ name: "VALUE-1", inner: value },
			],
		};
	}
	return false;
}

function parseValue(value: PortalValues): any {
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
		else {
			return parseFunction(value);
		}
	}
	return { "error": true };
}

function toLinkedList(key: string, array: any[]) {
	return {
		[key]: array
			.reverse()
			.reduce((result, current) => result == null ? current : ({ ...current, next: { [key]: result } }), null) || []
	};
}

function generateUID() {
	return (Math.random() + 1).toString(36).substring(2);
}

function modToBlockly(mod: PortalMod): any {
	const { rules } = mod;
	return {
		block: {
			xmlns: "https://developers.google.com/blockly/xml",
			type: "modBlock",
			id: generateUID(),
			deletable: false,
			statement: {
				name: "RULES",
				...toLinkedList("block", rules.map(rule => ({
					type: "ruleBlock",
					mutation: {
						isOnGoingEvent: rule.eventType == "Ongoing"
					},
					field: [
						{ name: "NAME", inner: rule.name },
						{ name: "EVENTTYPE", inner: rule.eventType },
						...(rule.eventType != "Ongoing" ? [] : [{ name: "OBJECTTYPE", inner: rule.objectType }]),
					],
					statement: [
						{
							name: "CONDITIONS",
							...toLinkedList("block", rule.conditions.map(condition => ({
								type: "conditionBlock",
								value: {
									name: "CONDITION",
									block: parseValue(condition),
								},
							}))),
						},
						{
							name: "ACTIONS",
							...toLinkedList("block", rule.actions.map(parseValue)),
						}
					]
				}))),
			},
		},
	};
}

function blocklyEntries(json: any): Array<[string, any]> {
	if (Array.isArray(json)) {
		return json.map(element => Object.entries(element)[0])
	}
	return Object.entries(json);
}

function blocklyToXML(json: any): string {
	return "inner" in json
		? json.inner
		: blocklyEntries(json)
			.filter(([key, value]) => typeof value == "object")
			.map(([key, value]) => blocklyToXMLInner(key, value))
			.join("");
}

function blocklyToXMLInner(key: string, json: any): string {
	const properties = blocklyEntries(json)
		.filter(([key, value]) => key != "inner" && typeof value != "object")
		.map(([key, value]) => ` ${key}="${value.toString()}"`).join("");
	const children = blocklyToXML(json);
	return `<${key}${properties}>${children}</${key}>`;
}

function IncrementPlayerScore(skip = 1): Voids {
	return { SetGamemodeScore: ["EventPlayer", { Add: [{ GetGamemodeScore: "EventPlayer" }, skip] }] };
}

const exampleMod: PortalMod = {
	rules: [
		{
			name: "Hello World!",
			eventType: "OnGameModeStarted",
			conditions: [
			],
			actions: [
				{ EnableDefaultScoring: false },
				{ SetRoundTimeLimit: 900 },
				{ SetTargetScore: 50 },
			],
		},
		{
			name: "Increment Score",
			eventType: "OnPlayerEarnedKill",
			conditions: [
				{ NotEqualTo: ["EventPlayer", "EventOtherPlayer"] },
			],
			actions: [
				...[0, 1, 2].map(IncrementPlayerScore)
			],
		},
		{
			name: "Check Win Condition",
			eventType: "OnPlayerEarnedKill",
			conditions: [
				{ Equals: [{ GetGamemodeScore: "EventPlayer" }, "GetTargetScore"] },
			],
			actions: [
				{ EndRound: "EventPlayer" }
			],
		},
		{
			name: "Branch Tester",
			eventType: "OnPlayerEarnedKill",
			conditions: [],
			actions: [
				{ If: true, Do: { EndRound: "EventPlayer" } },
				{ If: true, Do: { EndRound: "EventPlayer" }, Else: { EndRound: "EventPlayer" } },
				[
					{ If: true, Do: { EndRound: "EventPlayer" } },
					{ ElseIf: true, Do: { EndRound: "EventPlayer" } },
					{ Else: { EndRound: "EventPlayer" } },
				],
				{
					ForVariable: [{ type: "Global", variable: "TestVar" }, 0, 10, 1], Do: [
						{ EndRound: "EventPlayer" },
						"Break",
						"Continue",
					]
				},
				{
					While: true, Do: [
						{ EndRound: "EventPlayer" },
						"Break",
						"Continue",
					]
				},
			],
		}
	],
};

const blocklyOutput = modToBlockly(exampleMod);
const xmlOutput = blocklyToXML(blocklyOutput);

(async () => {
	await new Promise(resolve => fs.writeFile('output-intermediate.json', JSON.stringify(blocklyOutput, null, 4), resolve));
	await new Promise(resolve => fs.writeFile('output-formatted.xml', xmlFormat(xmlOutput), resolve));
	await new Promise(resolve => fs.writeFile('output-useable.xml', xmlOutput, resolve));
	console.log(`New files generated @ ${new Date().toTimeString()}`);
})();

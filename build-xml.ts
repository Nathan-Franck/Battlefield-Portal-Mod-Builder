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

type Voids =
	| { SetGamemodeScore: [Players, Numbers] }
	| { EndRound: Players }
	| { EnableDefaultScoring: Booleans }
	| { SetRoundTimeLimit: Numbers }
	| { SetTargetScore: Numbers }

	//TODO
	| { If: Booleans, Do: Voids[] }
	| { If: Booleans, Do: Voids[], Else: Voids[] }
	// | [{ If: Booleans, Do: Voids[] }, ...{ If: Booleans, Do: Voids[] }[], { Else: Voids[] }] // This case breaks how the intermediate json is formatted --- just leave unsupported?
	| { LoopVariable: [Variable, { from: Numbers, to: Numbers, by: Numbers }], Do: Voids[] }
	| { While: Booleans, Do: Voids[] }
	| "Break"
	| "Continue"

	// ALTERNATIVES
	| { If: [Booleans, { Do: Voids[] }] }

const statementBlocks = [
	"Rules",
	"Actions",
	"Conditions",
	"Do",
	"Else",
] as const;

function isStatement(candidate: string) {
	return statementBlocks.findIndex(statement => statement == candidate) >= 0;
}

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

function parseValue(value: PortalValues): any {
	if (typeof value == "string") {
		const filteredAccessors = Object
			.entries(playerStateAccessors)
			.filter(([_, names]) => names.findIndex(name => name == value) >= 0)
		if (filteredAccessors.length > 0) {
			const [type] = filteredAccessors[0];
			return {
				type: `${type}Item`,
				field: [
					{ name: "VALUE-0", inner: type },
					{ name: "VALUE-1", inner: value },
				],
			};
		}
		return {
			type: value,
		};
	}
	if (typeof value == "number") {
		return {
			type: "Number",
			field: {
				name: "NUM",
				inner: value,
			},
		};
	}
	if (typeof value == "boolean") {
		return {
			type: "Boolean",
			field: {
				name: "BOOL",
				inner: `${value}`.toUpperCase(),
			},
		};
	}
	if (typeof value == "object") {
		const entries = Object.entries(value);
		let { type, parameters, statements } = (() => {
			if (entries.length == 1) {
				const [type, parameters] = entries[0];
				return { type, parameters, statements: [] };
			} else {
				const [type, parameters] = entries.find(([type]) => !isStatement(type));
				const statements = entries.filter(([type]) => isStatement(type));
				return { type, parameters, statements };
			}
		})();
		if (!Array.isArray(parameters)) parameters = [parameters];
		return {
			type,
			value: parameters.map((parameter: any, index: number) => ({
				name: `VALUE-${index}`,
				block: parseValue(parameter),
			})),
			statement: statements.map(([type, contents]: any) => ({
				name: type.toUpperCase(),
				block: parseValue(contents),
			}))
		};
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

function modToBlockly(mod: PortalMod): any {
	const { rules } = mod;
	return {
		xmlns: "https://developers.google.com/blockly/xml",
		block: {
			type: "modBlock",
			deletable: false,
			x: 0,
			y: 0,
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

function blocklyToXML(key: string, json: any): string {
	if (Array.isArray(json)) {
		return json.reduce((result, next) => {
			const contents = blocklyToXML(key, next);
			return result != ""
				? `${result}${contents}`
				: contents;
		}, "")
	}
	const entries = Object.entries(json);
	const properties = entries
		.filter(([key, value]) => key != "inner" && typeof value != "object")
		.map(([key, value]) => ` ${key}="${value.toString()}"`).join("");
	const children = "inner" in json
		? json.inner
		: entries
			.filter(([_, value]) => typeof value == "object")
			.map(([key, value]) => blocklyToXML(key, value))
			.join("");
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
				{ If: true, Do: [{ EndRound: "EventPlayer" }] },
				{ If: true, Do: [{ EndRound: "EventPlayer" }], Else: [{ EndRound: "EventPlayer" }] },
				// [{ If: true, Do: [{ EndRound: "EventPlayer" }] }, { If: true, Do: [{ EndRound: "EventPlayer" }] }, { Else: [{ EndRound: "EventPlayer" }] }],
				{
					LoopVariable: [{ type: "Global", variable: "TestVar" }, { from: 0, to: 10, by: 1 }], Do: [
						{ EndRound: "EventPlayer" },
						"Break",
						"Continue",
					]
				},
				{ While: true, Do: [{ EndRound: "EventPlayer" }] },
			]
		}
	],
};

const blocklyOutput = modToBlockly(exampleMod);
const xmlOutput = blocklyToXML("xml", blocklyOutput);

(async () => {
	await new Promise(resolve => fs.writeFile('output-intermediate.json', JSON.stringify(blocklyOutput, null, 4), resolve));
	await new Promise(resolve => fs.writeFile('output-formatted.xml', xmlFormat(xmlOutput), resolve));
	await new Promise(resolve => fs.writeFile('output-useable.xml', xmlOutput, resolve));
	console.log(`New files generated @ ${new Date().toTimeString()}`);
})();

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
	| { If: Booleans, Do: Voids[] }
	| { If: Booleans, Do: Voids[], Else: Voids[] }
	| { While: Booleans, Do: Voids[] }
	| "Break"
	| "Continue"

	//TODO
	| { ForVariable: [variable: Variable, from: Numbers, to: Numbers, by: Numbers], Do: Voids[] }

const statementBlocks = [
	"Rules",
	"Actions",
	"Conditions",
	"Do",
	"Else",
] as const;

const mutationFactors = [
	"Else"
] as const;

function isStatement(candidate: string) {
	return statementBlocks.findIndex(statement => statement == candidate) >= 0;
}

function isMutationFactor(candidate: string) {
	return mutationFactors.findIndex(mutation => mutation == candidate) >= 0;
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
				id: generateID(),
				field: [
					{ name: "VALUE-0", inner: type },
					{ name: "VALUE-1", inner: value },
				],
			};
		}
		return {
			type: value,
			id: generateID(),
		};
	}
	if (typeof value == "number") {
		return {
			type: "Number",
			id: generateID(),
			field: {
				name: "NUM",
				inner: value,
			},
		};
	}
	if (typeof value == "boolean") {
		return {
			type: "Boolean",
			id: generateID(),
			field: {
				name: "BOOL",
				inner: `${value}`.toUpperCase(),
			},
		};
	}
	if (typeof value == "object") {
		const entries = Object.entries(value);
		let { type, parameters, statements, mutation } = (() => {
			if (entries.length == 1) {
				const [type, parameters] = entries[0];
				return { type, parameters, statements: [], mutation: [] };
			} else {
				const [type, parameters] = entries.find(([type]) => !isStatement(type));
				const statements = entries.filter(([type]) => isStatement(type));
				const mutation = statements
					.map(([type]) => type)
					.filter(isMutationFactor)
					.reduce((counts, type) => ({
						...counts,
						[type.toLowerCase()]: type in counts ? counts[type] + 1 : 1
					}), {} as any)
				return { type, parameters, statements, mutation };
			}
		})();
		if (!Array.isArray(parameters)) parameters = [parameters];
		return {
			type,
			id: generateID(),
			...(Object.entries(mutation).length == 0 ? {} : { mutation }),
			value: parameters.map((parameter: any, index: number) => ({
				name: `VALUE-${index}`,
				block: parseValue(parameter),
			})),
			statement: statements.map(([type, contents]: any) => ({
				name: type.toUpperCase(),
				...toLinkedList("block", contents.map(parseValue)),
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

function generateID() {
	return (Math.random() + 1).toString(36).substring(2); // Credit - https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
}

function modToBlockly(mod: PortalMod): any {
	const { rules } = mod;
	return {
		block: {
			xmlns: "https://developers.google.com/blockly/xml",
			type: "modBlock",
			id: generateID(),
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

function blocklyToXML(json: any): string {
	const children = "inner" in json
		? json.inner
		: Object
			.entries(json)
			.filter(([_, value]) => typeof value == "object")
			.map(([key, value]) => blocklyToXMLInner(key, value))
			.join("");
	return children;
}

function blocklyToXMLInner(key: string, json: any): string {
	if (Array.isArray(json)) {
		return json.reduce((result, next) => {
			const contents = blocklyToXMLInner(key, next);
			return result != ""
				? `${result}${contents}`
				: contents;
		}, "")
	}
	const properties = Object
		.entries(json)
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
				{ If: true, Do: [{ EndRound: "EventPlayer" }] },
				{ If: true, Do: [{ EndRound: "EventPlayer" }], Else: [{ EndRound: "EventPlayer" }] },
				// {
				// 	ForVariable: [{ type: "Global", variable: "TestVar" }, 0, 10, 1], Do: [
				// 		{ EndRound: "EventPlayer" },
				// 		"Break",
				// 		"Continue",
				// 	]
				// },
				{ While: true, Do: [{ EndRound: "EventPlayer" }, "Break", "Continue"] },
			]
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

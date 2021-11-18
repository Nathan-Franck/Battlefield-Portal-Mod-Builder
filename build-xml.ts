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
	| { If: Booleans, Then: Voids[] }
	| [{ If: Booleans, Do: Voids[] }, ...{ If: Booleans, Do: Voids[] }[], { Else: Voids[] }]
	| { LoopVariable: [Variable, { from: Numbers, to: Numbers, by: Numbers }], Do: Voids[] }
	| { While: Booleans, Do: Voids[] }

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
		const [type, parameters] = Object.entries(value)[0];
		return {
			type,
			value: !Array.isArray(parameters)
				? {
					name: "VALUE-0",
					block: parseValue(parameters),
				}
				: parameters.map((parameter: any, index: number) => ({
					name: `VALUE-${index}`,
					block: parseValue(parameter),
				})),
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
				{ SetGamemodeScore: ["EventPlayer", { Add: [{ GetGamemodeScore: "EventPlayer" }, 1] }] },
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
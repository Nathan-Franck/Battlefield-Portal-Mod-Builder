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

function toLinkedList(key: string, array: any[]) {
	return {
		[key]: array
			.reverse()
			.reduce((result, current) => result == null ? current : ({ ...current, next: { [key]: result } }), null)
	};
}

type Players =
	| "EventPlayer"
	| "EventOtherPlayer"
	| { readonly ClosestPlayerTo: Vectors }

type Numbers =
	| "GetTargetScore"
	| { readonly GetGamemodeScore: Players }
	| { readonly DistanceBetween: readonly [Vectors, Vectors] }
	| { readonly Add: readonly [Numbers, Numbers] }
	| number

type Booleans =
	| { readonly NotEqualTo: readonly [Players, Players] }
	| { readonly NotEqualTo: readonly [Numbers, Numbers] }
	| { readonly Equals: readonly [Players, Players] }
	| { readonly Equals: readonly [Numbers, Numbers] }
	| { readonly LessThan: readonly [Numbers, Numbers] }
	| { readonly GetSoldierState: readonly [Players, SoldierStateBool] }
	| boolean

type Voids =
	| { readonly SetGameModeScore: readonly [Players, Numbers] }
	| { readonly EndRound: Players }
	| { readonly EnableDefaultScoring: Booleans }
	| { readonly SetRoundTimeLimit: Numbers }
	| { readonly SetTargetScore: Numbers }

type Vectors =
	{ readonly GetSoldierState: readonly [Players, SoldierStateVector] }

type PortalValues = Players | Numbers | Booleans | Voids | SoldierStateVector | SoldierStateBool | SoldierStateNumber;

const playerStateAccessors = <const>[
	{
		type: "SoldierStateVector",
		name: [
			"GetPosition",
			"GetLinearVelocity"
		],
	},
	{
		type: "SoldierStateBool",
		name: [
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
	},
	{
		type: "SoldierStateNumber",
		name: [
			"CurrentHealth",
			"CurrentInventoryAmmo",
			"CurrentInventoryMagazineAmmo",
			"MaxHealth",
			"NormalizedHealth",
			"Speed",
		],
	}
];

type SoldierStateVector = (typeof playerStateAccessors[number] & { type: "SoldierStateVector" })["name"][number];
type SoldierStateBool = (typeof playerStateAccessors[number] & { type: "SoldierStateBool" })["name"][number]
type SoldierStateNumber = (typeof playerStateAccessors[number] & { type: "SoldierStateNumber" })["name"][number]

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
		const filteredAccessors = playerStateAccessors.filter(accessors => accessors.name.findIndex(name => name == value) >= 0)
		if (filteredAccessors.length > 0) {
			const accessors = filteredAccessors[0];
			return {
				type: `${accessors.type}Item`,
				field: [
					{ name: "VALUE-0", inner: accessors.type },
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

function PlayerPosition(player: Players): Vectors { return { GetSoldierState: [player, "GetPosition"] } };

function ClosestPlayerDistance(player: Players): Numbers {
	return {
		DistanceBetween: [
			{ GetSoldierState: [{ ClosestPlayerTo: PlayerPosition(player) }, "GetPosition"] },
			PlayerPosition(player)
		]
	};
};

const exampleMod: PortalMod = {
	rules: [
		{
			name: "Hello World!",
			eventType: "Ongoing",
			objectType: "Global",
			conditions: [
				{ NotEqualTo: ["EventPlayer", "EventOtherPlayer"] },
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
				{ SetGameModeScore: ["EventPlayer", { Add: [{ GetGamemodeScore: "EventPlayer" }, 1] }] },
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
			name: "Proximity Tag",
			eventType: "Ongoing",
			objectType: "Player",
			conditions: [
				{ LessThan: [ClosestPlayerDistance("EventPlayer"), 1] }
			],
			actions: [
				{ EndRound: "EventPlayer" }
			],
		}
	],
};
console.log(JSON.stringify(modToBlockly(exampleMod), null, 4));
console.log("");
console.log(blocklyToXML("xml", modToBlockly(exampleMod)));
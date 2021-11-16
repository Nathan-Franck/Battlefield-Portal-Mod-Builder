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
        .filter(([key, value]) => key != "value" && typeof value != "object")
        .map(([key, value]) => ` ${key}="${value.toString()}"`).join("");
    const children = "value" in json
        ? json.value
        : entries
            .filter(([_, value]) => typeof value == "object")
            .map(([key, value]) => blocklyToXML(key, value))
            .join("");
    return `<${key}${properties}>${children}</${key}>`;
}

function toLinkedList(key: string, array: any[]) {
    return array
        .reverse()
        .reduce((result, current) => result == null ? current : ({ [key]: current, next: { [key]: result } }), null);
}

type Players =
    | "EventPlayer"
    | "EventOtherPlayer"
    | { readonly ClosestPlayerTo: Vectors }

type Numbers =
    | { readonly GetGameModeScore: Players }
    | "GetGameModeTargetScore"
    | { readonly DistanceBetween: readonly [Vectors, Vectors] }
    | number

type Booleans =
    | { readonly NotEqualTo: readonly [Players, Players] }
    | { readonly NotEqualTo: readonly [Numbers, Numbers] }
    | { readonly Equals: readonly [Players, Players] }
    | { readonly Equals: readonly [Numbers, Numbers] }
    | { readonly LessThan: readonly [Numbers, Numbers] }
    | { readonly GetPlayerState: readonly [Players, PlayerStateBool] }

type Voids =
    | { readonly SetGameModeScore: readonly [Players, Numbers] }
    | { readonly EndGameMode: Players }

type Vectors =
    { readonly GetPlayerState: readonly [Players, PlayerStateVector] }

type PlayerStateVector =
    | "Position"
    | "Linear Velocity";

type PlayerStateBool =
    | "Is AI Soldier"
    | "Is Alive"
    | "Is Being Revived"
    | "Is Crouching"
    | "Is Dead"
    | "Is Firing"
    | "Is In Air"
    | "Is Interacting"
    | "Is In Vehicle"
    | "Is In Water"
    | "Is Jumping"
    | "Is Mandown"
    | "Is On Ground"
    | "Is Parachuting"
    | "Is Prone"
    | "Is Reloading"
    | "Is Reviving"
    | "Is Sprinting"
    | "Is Standing"
    | "Is Vaulting"
    | "Is Zooming";

type PlayerStateNumber =
    | "Current Health"
    | "Current Inventory Ammo"
    | "Current Inventory Magazine Ammo"
    | "Max Health"
    | "Normalized Health"
    | "Speed"


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
                        { name: "NAME", value: rule.name },
                        { name: "EVENTTYPE", value: rule.eventType },
                        ...(rule.eventType != "Ongoing" ? [] : [{ name: "OBJECTTYPE", value: rule.objectType }]),
                    ],
                    statement: {
                        name: "CONDITIONS",
                        block: [],
                    }
                }))),
            },
        },
    };
}

function PlayerPosition(player: Players): Vectors { return { GetPlayerState: [player, "Position"] } };

function ClosestPlayerDistance(player: Players): Numbers {
    return {
        DistanceBetween: [
            { GetPlayerState: [{ ClosestPlayerTo: PlayerPosition(player) }, "Position"] },
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
            ],
        },
        {
            name: "Increment Score",
            eventType: "OnPlayerEarnedKill",
            conditions: [
                { Equals: [{ GetGameModeScore: "EventPlayer" }, "GetGameModeTargetScore"] },
            ],
            actions: [
                { EndGameMode: "EventPlayer" }
            ],
        },
        {
            name: "Proximity Tag",
            eventType: "OnPlayerEarnedKill",
            conditions: [
                { LessThan: [ClosestPlayerDistance("EventPlayer"), 1] }
            ],
            actions: [
                { EndGameMode: "EventPlayer" }
            ],
        }
    ],
};
console.log(blocklyToXML("xml", modToBlockly(exampleMod)));
type PortalMod = {
    rules: Array<{
        name: string,
        eventType: "Ongoing" | "OnGameModeEnding" | "OnGameModeStarted" | "OnMandown" | "OnPlayerDeployed" | "OnPlayerDied" | "OnPlayerEarnedKill" | "OnPlayerIrreversiblyDead" | "OnPlayerJoinGame" | "OnPlayerLeaveGame" | "OnRevived" | "OnTimeLimitReached",
        objectType: "Global" | "Player" | "Team",
        conditions: Array<{
        }>,
        actions: Array<{
        }>,
    }>,
};

const exampleMod: PortalMod = {
    rules: [
        {
            name: "Hello World!",
            eventType: "Ongoing",
            objectType: "Global",
            conditions: [
            ],
            actions: [
            ],
        }
    ]
}

const exampleJSON: any = {
    xmlns: "https://developers.google.com/blockly/xml",
    block: {
        type: "modBlock",
        deletable: false,
        x: 0,
        y: 0,
        statement: {
            name: "RULES",
            block: {
                type: "ruleBlock",
                mutation: {
                    isOnGoingEvent: true,
                },
                field: [
                    {
                        name: "NAME",
                        value: "Hello World!",
                    },
                    {
                        name: "EVENTTYPE",
                        value: "Ongoing",
                    },
                ]
            }
        }
    }
};

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
                block: rules.map(rule => ({
                    type: "ruleBlock",
                    mutation: {
                        isOnGoingEvent: rule.eventType == "Ongoing"
                    },
                    field: [
                        { name: "NAME", value: rule.name },
                        { name: "EVENTTYPE", value: rule.eventType },
                        { name: "OBJECTTYPE", value: rule.objectType },
                    ],
                    statement: {
                        name: "CONDITIONS",
                        block: [],
                    }
                })),
            },
        },
    };
}

console.log(blocklyToXML("xml", modToBlockly(exampleMod)));
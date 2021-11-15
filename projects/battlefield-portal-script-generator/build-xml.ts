type PortalMod = {
    xml: {
        mod: {
            rules: Array<{
                name: string,
                eventType: "Ongoing" | "OnGameModeEnding" | "OnGameModeStarted" | "OnMandown" | "OnPlayerDeployed" | "OnPlayerDied" | "OnPlayerEarnedKill" | "OnPlayerIrreversiblyDead" | "OnPlayerJoinGame" | "OnPlayerLeaveGame" | "OnRevived" | "OnTimeLimitReached",
                objectType: "Global" | "Player" | "Team",
                conditions: Array<{
                }>,
                actions: Array<{
                }>,
            }>,
        },
    },
};

const exampleMod: PortalMod = {
    xml: {
        mod: {
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
    },
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

function jsonToBlocklyXML(key: string, json: any): string {
    if (Array.isArray(json)) {
        return json.reduce((result, next) => {
            const contents = jsonToBlocklyXML(key, next);
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
            .map(([key, value]) => jsonToBlocklyXML(key, value))
            .join("");
    return `<${key}${properties}>${children}</${key}>`;
}

console.log(jsonToBlocklyXML("xml", exampleJSON));

function buildXML(mod: PortalMod): string {
    const { rules } = mod.xml.mod;
    const generatedRules = rules.map(rule => {
        return `<block type="ruleBlock">${`<mutation isOnGoingEvent="${rule.eventType == "Ongoing" ? "true" : "false"}"></mutation>`
            }${`<field name="NAME">${rule.name}</field>`
            }${`<field name="EVENTTYPE">${rule.eventType}</field>`
            }${`<field name="OBJECTTYPE">${rule.objectType}</field>`
            }${`<statement name="CONDITIONS"><block type="conditionBlock"></block></statement>`
            }</block>`;
    });
    return `<xml xmlns="https://developers.google.com/blockly/xml"><block type="modBlock" deletable="false" x="0" y="0"><statement name="RULES"><block type="ruleBlock">${generatedRules}</block></statement></block></xml>`
}
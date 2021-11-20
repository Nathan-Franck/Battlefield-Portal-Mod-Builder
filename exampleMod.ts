import { buildPortalMod, Portal } from "./buildPortalMod"

function IncrementPlayerScore(skip = 1): Portal.Actions {
    return { SetGamemodeScore: ["EventPlayer", { Add: [{ GetGamemodeScore: [ "EventPlayer"] }, skip ] } ] };
}

buildPortalMod({
    rules: [
        {
            name: "Game Start",
            eventType: "OnMandown",
            conditions: [
                { LessThan: [1, { DotProduct: [{ GetSoldierState: ["EventPlayer", "GetLinearVelocity"] }, "UpVector"] }] },
                { IsUsingKit: ["EventOtherPlayer", "USReconRUM"] }
            ],
            actions: [
                { AddSoldierWeapon: ["EventPlayer", "M240B"] },
                { EndRound: [{ GetTeamId: [0] }] },
                IncrementPlayerScore(2),
                {
                    While: { LessThan: ["GetMatchTimeElapsed", 1] }, Do: [{
                        SetTeam: [
                            "EventPlayer",
                            "EventTeam"
                        ]
                    }]
                },
                { ShowNotificationMessage: [{ Message: ["Hello"]}] },
                { If: true, Do: [] },
                { ForVariable: [{ type: "Global", variable: "Tester" }, 0, 10, 1], Do: [] },
            ],
        }
    ],
});
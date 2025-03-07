import { type Client, elizaLogger, IAgentRuntime } from "@elizaos/core";
import { ClaraClient } from "./ClaraClient.ts";
import {
    validateAoConfig,
    validateStoryConfig,
    ClaraConfig,
} from "./utils/environment.ts";
import { ClaraTaskClient } from "./tasks/ClaraTaskClient.ts";

class ClaraManager {
    client: ClaraClient;
    tasks: ClaraTaskClient;

    constructor(runtime: IAgentRuntime, claraConfig: ClaraConfig) {
        this.client = new ClaraClient(runtime, claraConfig);
        this.tasks = new ClaraTaskClient(this.client, runtime);
    }

    async stop() {
        elizaLogger.warn("Clara client does not support stopping yet");
    }
}

export const ClaraClientInterface: Client = {
    name: "clara",
    async start(runtime: IAgentRuntime) {
        let claraConfig: ClaraConfig;
        if (
            runtime.getSetting("CLARA_AO_WALLET") ||
            process.env.CLARA_AO_WALLET
        ) {
            claraConfig = await validateAoConfig(runtime);
        } else {
            claraConfig = await validateStoryConfig(runtime);
        }
        elizaLogger.log(
            `===== Clara client started: ${claraConfig.CLARA_IMPL}`
        );
        const manager = new ClaraManager(runtime, claraConfig);
        await manager.client.init();
        await manager.tasks.start();
        return manager;
    },
};

export default ClaraClientInterface;

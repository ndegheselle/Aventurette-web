/// <reference types="node" />
import { activityTools } from '@features/activities-authoring/mcp/activity.tools';
import { sessionProvider } from '@features/user/api/session';
import { hasRole, Role } from '@features/user/models/user';
import { translate } from '@/mcp/translate';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

export interface ServerSettings {
    email: string;
    password: string;
    /** The back office's address, to link the editor. Empty: the activity's id is given instead. */
    adminUrl: string;
}

/**
 * Sign in as an admin, then serve the authoring tools over stdio. Anyone else is turned away here
 * for a clear message; the collections' rules refuse their writes anyway.
 */
export async function startServer({ email, password, adminUrl }: ServerSettings) {
    const user = await sessionProvider().login(email, password, { remember: false });
    if (!hasRole(user, [Role.ADMIN])) {
        console.error(`aventurette MCP: ${email} is not an admin.`);
        process.exit(1);
    }

    const tools = activityTools({
        authorId: user.id,
        readFile: async path => new File([await readFile(path)], basename(path)),
        translate,
        // The editor's route, `activities-authoring/routes.ts`, which imports the screens and so
        // cannot be loaded here.
        editorUrl: id => adminUrl ? new URL(`/activities/authoring/${id}`, adminUrl).href : `activity ${id}`,
    });

    // The low-level server: the sheet's input schema is a JSON Schema file, which the high-level
    // one would need rewritten in zod.
    const server = new Server(
        { name: 'aventurette', version: '1.0.0' },
        { capabilities: { tools: {} } },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
    }));

    server.setRequestHandler(CallToolRequestSchema, async request => {
        const tool = tools.find(candidate => candidate.name === request.params.name);
        if (!tool) return { isError: true, content: [{ type: 'text', text: `No tool named ${request.params.name}.` }] };

        try {
            return await tool.call(request.params.arguments ?? {});
        } catch (error) {
            // Unexpected — a file that cannot be read, the backend down: said to the assistant
            // rather than dropping the connection.
            const message = error instanceof Error ? error.message : String(error);
            return { isError: true, content: [{ type: 'text', text: `Failed: ${message}` }] };
        }
    });

    await server.connect(new StdioServerTransport());
}

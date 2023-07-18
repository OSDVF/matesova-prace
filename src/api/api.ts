import CAPI from "renette-api";
import { receivedData } from "renette-api/dist/types"
import { ResendMailResponse, TeamUpdateResponse, TeamsData, application, futureEvent, futureEventInData } from "./api.types";
import * as Sentry from "@sentry/browser";

const API = new CAPI();
API.setConfig({
    apiUri: import.meta.env.VITE_API_BASE,
    cors: import.meta.env.VITE_CORS
})

export default class ApiLayer {
    static lastRequest: Promise<any> = Promise.resolve();
    static auth() {
        this.lastRequest = this.lastRequest.then(() => API.authenticateWithName('prihlaska').then(async () => {
            await API.__props.preparing;
            return API.authorizeWithKey('travna');
        }));
        return this.lastRequest;
    }

    static get isAuthorized() {
        return API.isAuthorized
    }

    static async getApplicationsTable(eventId: Number): Promise<receivedData<{ applications: application[] }>> {
        await this.lastRequest;
        const data = await (this.lastRequest = API.post({
            resource: 'get',
            action: 'getApps',
            data: {
                eventId
            }
        }));

        Sentry.addBreadcrumb({
            category: 'api',
            message: 'getApplicationsTable',
            data: {
                eventId,
                ...data
            }
        });
        return data;
    }
    static async getEvents(past = false): Promise<receivedData<futureEventInData>> {
        await this.lastRequest;
        const data = await (this.lastRequest = API.post(
            {
                resource: 'get',
                action: 'getEvents',
                data: {
                    past
                }
            }
        ));

        Sentry.addBreadcrumb({
            category: 'api',
            message: 'getEvents',
            data: {
                ...data
            }
        });
        return data;
    }

    static async resendEmail(appID: number): Promise<receivedData<any>> {
        await this.lastRequest;
        const data = await (this.lastRequest = API.post(
            {
                resource: 'manageApp',
                action: 'resendMail',
                data: {
                    appID
                }
            }
        ));

        Sentry.addBreadcrumb({
            category: 'api',
            message: 'resendEmail',
            data: {
                appID,
                ...data
            }
        });
        return data;
    }

    static async getTeams(eventID: number): Promise<receivedData<TeamsData>> {
        const data = await (this.lastRequest = API.post(
            {
                resource: 'get',
                action: 'getTeams',
                data: {
                    eventID
                }
            }
        ));

        Sentry.addBreadcrumb({
            category: 'api',
            message: 'getTeams',
            data: {
                eventID,
                ...data
            }
        });
        return data;
    }

    static async updateTeams(eventID: number, teamIDs: number[] | null, data: string[] | null, names: string[] | null): Promise<receivedData<TeamUpdateResponse>> {
        const result = await (this.lastRequest = API.post(
            {
                resource: 'manageApp',
                action: 'updateTeams',
                data: {
                    eventID,
                    teamIDs,
                    data,
                    names
                }
            }
        ));

        Sentry.addBreadcrumb({
            category: 'api',
            message: 'getApplicationsTable',
            data: {
                eventID,
                teamIDs,
                inputData: data,
                names,
                ...result
            }
        });
        return result;
    }

    static async resendMailIfNotSent(eventID: number): Promise<receivedData<ResendMailResponse>> {
        const result = await (this.lastRequest = API.post(
            {
                resource: 'manageApp',
                action: 'resendMailIfNotSent',
                data: {
                    eventID
                }
            }
        ));

        Sentry.addBreadcrumb({
            category: 'api',
            message: 'resendMailIfNotSent',
            data: {
                eventID,
                ...result
            }
        });
        return result;
    }
};
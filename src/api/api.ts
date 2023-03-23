import CAPI from "renette-api";
import { receivedData } from "renette-api/dist/types"
import { application, futureEvent, futureEventInData } from "./api.types";

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
    static async getApplicationsTable(eventId: Number): Promise<receivedData<{ applications: application[] }>> {
        await this.lastRequest;
        return (this.lastRequest = API.post({
            resource: 'get',
            action: 'getApps',
            data: {
                eventId
            }
        }));
    }
    static async getEvents(): Promise<receivedData<futureEventInData>> {
        await this.lastRequest;
        return (this.lastRequest = API.post(
            {
                resource: 'get',
                action: 'getEvents'
            }
        ));
    }

    static async resendEmail(appID: number) : Promise<receivedData<any>> {
        await this.lastRequest;
        return (this.lastRequest = API.post(
            {
                resource: 'manageApp',
                action: 'resendMail',
                data: {
                    appID
                }
            }
        ));
    }
};
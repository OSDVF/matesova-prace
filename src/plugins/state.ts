import { application, futureEvent } from "../api/api.types"
import { createContext } from "preact";
import ApiLayer from "../api/api";


export class AppState {
    public applications: application[] | null = null;
    public events: futureEvent[] = [];
    public selectedEventID: number | null = null;
    private subscribed: (() => void)[] = []
    public get onChange() {
        return (() => {
            for (const handler of this.subscribed) {
                handler();
            }
        })
    }
    public set onChange(handler) {
        this.subscribed.push(handler)
    }
    private initializing = false;
    private gettingEvents = false;

    async init() {
        if (!this.initializing) {
            this.initializing = true;
            ApiLayer.auth();
            this.events = (await ApiLayer.getEvents()).data.events;
            this.initializing = false;
        }
        else return Promise.reject();
    }
    async fetchApplications(eventId = this.selectedEventID) {
        if (!this.gettingEvents) {
            this.gettingEvents = true;
            if (!eventId) throw new Error('No event selected');
            const resp = await ApiLayer.getApplicationsTable(eventId);
            if (resp.data.applications) {
                this.applications = resp.data.applications
                for(const app of this.applications)
                {
                    app.departure = new Date(app.departure)
                    app.arrival = new Date(app.arrival)
                }
                this.onChange?.();
            }
            else {
                throw resp;
            }
            this.gettingEvents = false;
        }
    }
}

export const AppStateContext = createContext<AppState>(new AppState());
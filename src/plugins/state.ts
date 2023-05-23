import { application, futureEvent } from "../api/api.types"
import { createContext } from "preact";
import ApiLayer from "../api/api";


export class AppState {
    public applications: application[] | null = null;
    public events: futureEvent[] = [];
    public selectedEventID: number | null = null;
    private subscribedChange: (() => void)[] = []
    public get onChange() {
        return (() => {
            for (const handler of this.subscribedChange) {
                handler();
            }
        })
    }
    public set onChange(handler) {
        this.subscribedChange.push(handler)
    }
    private subscribedLoading: (() => void)[] = []
    public get onLoading() {
        return (() => {
            for (const handler of this.subscribedLoading) {
                handler();
            }
        })
    }
    public set onLoading(handler) {
        this.subscribedLoading.push(handler)
    }

    private initializing = false;
    private gettingEvents = false;
    private _loading = false;
    public get loading() {
        return this._loading;
    }
    public set loading(val) {
        this._loading = val;
        this.onLoading?.();
    }

    async init() {
        if (!this.initializing) {
            this.initializing = true;
            this.loading = true;
            ApiLayer.auth();
            this.events = (await ApiLayer.getEvents()).data.events;
            this.initializing = this.loading = false;
            this.onChange();
        }
        else return Promise.reject();
    }
    async fetchApplications(eventId = this.selectedEventID) {
        if (!this.gettingEvents) {
            this.gettingEvents = true;
            this.loading = true;
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
            this.loading = false;
        }
    }
}

export const AppStateContext = createContext<AppState>(new AppState());
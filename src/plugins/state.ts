import { application, futureEvent } from "../api/api.types"
import { createContext } from "preact";
import ApiLayer from "../api/api";


export class AppState {
    public applications: application[] | null = null;
    public events: futureEvent[] = [];
    public selectedEventID: number | null = null;
    public includePastEvents = false;
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

    async init(past = this.includePastEvents) {
        if (!this.initializing) {
            this.initializing = true;
            this.loading = true;
            if(!ApiLayer.isAuthorized) {
                ApiLayer.auth();
            }
            this.events = (await ApiLayer.getEvents(past)).data.events;
            this.initializing = this.loading = false;
            this.onChange();
        }
        else return Promise.reject();
    }
    async fetchApplications(eventId = this.selectedEventID) {
        if (!this.gettingEvents) {
            if (!eventId) throw new Error('No event selected');
            this.gettingEvents = true;
            this.loading = true;
            const resp = await ApiLayer.getApplicationsTable(eventId);
            if (resp.data.applications) {
                this.applications = resp.data.applications
                for (const app of this.applications) {
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
    async resendMailIfNotSent(eventId = this.selectedEventID) {
        if (!eventId) throw new Error('No event selected');
        this.loading = true;
        const resp = await ApiLayer.resendMailIfNotSent(eventId);
        if (resp.data.sent !== false) {
            alert(`Sent emails to ${resp.data.sent} people}`);
            this.fetchApplications(eventId);
        }
        else {
            throw resp;
        }
        this.loading = false;
    }
}

export const AppStateContext = createContext<AppState>(new AppState());
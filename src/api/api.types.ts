/**
 * Event from Fetch
 */
export type futureEvent = {
    eventID: number
    registration: number | boolean
    appBegin: string
    appEnd: string
    title: string
    slug: string
    desc: string
};

export type futureEventInData = {
    events: futureEvent[]
};

export type TSelectOption = {
    text: string
    key: number
    value: number
};

export type formConfig = {
    groups: TSelectOption[]
    items: TSelectOption[]
    departures: TSelectOption[]
    arrivals: TSelectOption[]
};
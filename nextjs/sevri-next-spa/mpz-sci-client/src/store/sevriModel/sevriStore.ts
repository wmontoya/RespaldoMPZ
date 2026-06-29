import { Activity, Event, EventType, ResponseAPI, SevriProcess, User } from "@/types/sevri";
import { fetchData } from "@/utils/fetchData";
import { create } from "zustand";
import { useGlobalState } from "../globalState";

interface SevriStore {
  activities: Activity[];
  actualActivity: Activity;
  eventTypes: EventType[];
  users: User[];
  actualSevriProcess: SevriProcess;
  historySevriProcesses: SevriProcess[];
  actualHistorySevriProcess: SevriProcess;
  getActualHistorySevriProcess: (id: number) => Promise<SevriProcess | null>;
  getHistorySevriProcesses: () => Promise<SevriProcess[] | null>;
  getActualSevriProcess: () => Promise<SevriProcess | null>;
  getUsers: () => Promise<User[] | null>;
  setActivities: (activities: Activity[]) => void;
  setActualActivity: (activity: Activity) => void;
  saveActivity: (activity: Activity) => Promise<Activity | null>;
  getActivity: (id: number) => Promise<Activity | null>;
  getActivities: () => Promise<Activity[] | null>;
  getEventTypes: () => Promise<EventType[] | null>;
  saveEvent: (event: Event) => Promise<Event | null>;
  deleteEvent: (id: number) => Promise<Event | null>;
  deleteActivity: (id: number) => Promise<Activity | null>;
}
export const useSevriStore = create<SevriStore>((set) => ({
  activities: [],
  eventTypes: [],
  actualActivity: {} as Activity,
  users: [],
  actualSevriProcess: {} as SevriProcess,
  historySevriProcesses: [],
  actualHistorySevriProcess: {} as SevriProcess,
  getActualHistorySevriProcess: async (id: number) => {
    const response = await fetchData<ResponseAPI<SevriProcess>>(`/api/v1/sevri/byId?id=${id}`);
    if (response.status !== 200) return null;
    set({ actualHistorySevriProcess: response.data });
    return response.data;
  },
  getHistorySevriProcesses: async () => {
    const department_id = useGlobalState.getState().department_id;
    const response = await fetchData<ResponseAPI<SevriProcess[]>>(`/api/v1/sevri?department_id=${department_id}`);
    if (response.status !== 200)
      return null;
    set({ historySevriProcesses: response.data });
    return response.data;
  },
  getActualSevriProcess: async () => {
    const { department_id } = useGlobalState.getState()
    const response = await fetchData<SevriProcess>("/api/v1/sevri/actual");
    if (!response.id) return null;
    set({
      actualSevriProcess: {
        ...response,
        activities: response.activities.filter((act) => act.department_id === department_id),
      }
    });
    return response;
  },
  getUsers: async () => {
    const response = await fetchData<User[]>("/api/v1/sevri/users");
    if (!response.length) return null;
    set({ users: response });
    return response;
  },
  deleteActivity: async (id: number) => {
    const response = await fetchData<Activity>(`/api/v1/sevri/activities/${id}`, "DELETE");
    if (!response) return null;
    set((state) => ({ activities: state.activities.filter((act) => act.id !== id) }));
    return response;
  },
  deleteEvent: async (id: number) => {
    const response = await fetchData<Event>(`/api/v1/sevri/events/${id}`, "DELETE");
    if (!response) return null;
    set((state) => ({ actualActivity: { ...state.actualActivity, events: state.actualActivity.events.filter((ev) => ev.id !== id) } }))
    set((state) => ({ activities: state.activities.map((act) => ({ ...act, events: act.events.filter((ev) => ev.id !== id) })) }));
    return response;
  },
  saveEvent: async (event: Event) => {
    if (event.id) {
      const response = await fetchData<Event>(`/api/v1/sevri/events/${event.id}`, "PUT", {
        body: JSON.stringify(event),
        method: "PUT",
      });
      if (!response) return null;
      set((state) => ({ actualActivity: { ...state.actualActivity, events: state.actualActivity.events.map((ev) => (ev.id === event.id ? event : ev)) } }))
      set((state) => ({ activities: state.activities.map((act) => (act.id === event.activity_id ? { ...act, events: act.events.map((ev) => (ev.id === event.id ? event : ev)) } : act)) }))
      return response
    }
    const response = await fetchData<Event>("/api/v1/sevri/events", "POST", {
      body: JSON.stringify(event),
      method: "POST",
    });
    if (!response) return null;
    set((state) => ({ actualActivity: { ...state.actualActivity, events: [...state.actualActivity.events, response] } }))
    set((state) => ({ activities: state.activities.map((act) => (act.id === event.activity_id ? { ...act, events: [...act.events, response] } : act)) }))
    return response;
  },
  getEventTypes: async () => {
    const response = await fetchData<EventType[]>("/api/v1/sevri/eventType");
    if (!response.length) return null;
    set({ eventTypes: response });
    return response;
  },
  setActivities: (activities: Activity[]) => set({ activities }),
  setActualActivity: (actualActivity: Activity) => {
    set({ actualActivity });
  },
  saveActivity: async (activity: Activity) => {
    if (activity.id) {
      const response = await fetchData<Activity>(`/api/v1/sevri/activities/${activity.id}`, "PUT", {
        body: JSON.stringify(activity),
        method: "PUT",
      });
      if (!response) return null;
      set({ actualActivity: response });
      set((state) => ({ actualSevriProcess: { ...state.actualSevriProcess, activities: state.actualSevriProcess.activities.map((act) => (act.id === response.id ? response : act)) } }))
      set((state) => ({ activities: state.activities.map((act) => (act.id === response.id ? response : act)) }))
      return response
    }
    const response = await fetchData<Activity>("/api/v1/sevri/activities", "POST", {
      body: JSON.stringify(activity),
      method: "POST",
    });
    if (!response) return null;
    set({ actualActivity: response });
    set((state) => ({ actualSevriProcess: { ...state.actualSevriProcess, activities: [...state.actualSevriProcess.activities, response] } }))
    set((state) => ({ activities: [...state.activities, response] }))
    return response;
  },

  getActivity: async (id: number) => {
    const activity = await fetchData<Activity>(`/api/v1/sevri/activities/${id}`)
    if (!activity.title) return null
    set({ actualActivity: activity });
    return activity;
  },
  getActivities: async () => {
    const response = await fetchData<Activity[]>("/api/v1/sevri/activities")
    if (!response.length) return null
    set({ activities: response });
    return response;
  },
}));
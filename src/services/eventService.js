import {api} from "./api";

export const getPublishedEvents = async (params) => {
  const response = await api.get('/public/events/search', {
    params
  })
  return response.data;
}

export const getPublishedEventById = async (id) => {
    const respons = await api.get(`/public/events/search/${id}`);
    return respons.data;
}

export const getAllEvents = async (page, size) => {
    const respons = await api.get("/admin/events", {
        params:{
            page,
            size
        }
    });
    return respons.data;
}

export const getAllPublishedEvents = async (page, size) => {
    const respons = await api.get("/public/events", {
        params:{
            page,
            size
        }
    });
    return respons.data;
}

export const getPublishedEventsForCategorie = async (page, size, categorieId) => {
    const respons = await api.get("/public/events/categorie", {
        params:{
            page,
            size,
            categorieId
        }
    });
    return respons.data;
}


export const getOrganiserEvents = async (id) => {
    const respons = await api.get(`/organiser/${id}/events`);
    return respons.data;
}

export const getEventById = async (id) => {
    const respons = await api.get(`/public/events/${id}`);
    return respons.data;
}

export const createEvent = async (eventData, document, images) => {
    const respons = await api.post("/organiser/events", eventData, document, images);
    return respons.data;
}

export const publishEvent = async (id) => {//changement de status
    const respons = await api.put(`/admin/events/${id}`, eventData);
    return respons.data;
}

export const editEvent = async (id, eventData, document, images) => {
    const respons = await api.put(`/organiser/events/${id}`, eventData, document, images);
    return respons.data;
}

export const deleteEvent = async (id) => await api.delete(`/organiser/events/${id}`);
import {api} from "./api";

export const getListAvisByEventId = async (id, page, size) => {
    const response = await api.get(`/public/events/${id}/avis`, {
        params:{ page, size }
    });
    return response.data; // PageResponse<AvisResponseDto>
}

export const getClientById = async (id) => {
  const response = await api.get(`/public/clients/${id}`)
  return response.data
}

export const getAvis = async () => {
    const respons = await api.get('/public/avis');
    return respons.data;
}


export const getAvisById = async (id) => {
    const respons = await api.get(`/public/avis/${id}`);
    return respons.data;
}

export const createAvis = async (avisData) => {
    const respons = await api.post("/admin/avis", avisData);
    return respons.data;
}

export const editAvis = async (id, avisData) => {
    const respons = await api.put(`/admin/avis/${id}`, avisData);
    return respons.data;
}

export const deleteAvis = async (id) => await api.delete(`/admin/avis/${id}`);
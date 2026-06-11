import {api} from "./api";

export const getClientById = async (id) => {
    const respons = await api.get(`/public/categories/${id}`);
    return respons.data;
}
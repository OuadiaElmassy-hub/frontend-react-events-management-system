import {api} from "./api";

export const getCategories = async () => {
    const respons = await api.get('/public/categories');
    return respons.data;
}


export const getCategorieById = async (id) => {
    const respons = await api.get(`/public/categories/${id}`);
    return respons.data;
}

export const createCategorie = async (categorieData, image) => {
    const respons = await api.post("/admin/categories", categorieData, image);
    return respons.data;
}

export const editCategorie = async (id, categorieData, image) => {
    const respons = await api.put(`/admin/categories/${id}`, categorieData, image);
    return respons.data;
}

export const deleteCategorie = async (id) => await api.delete(`/admin/categories/${id}`);
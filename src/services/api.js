import axios from "axios";
import { useNavigate } from "react-router-dom";

 export const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers:{
        "Content-Type":"application/json"
    }
});
export default api;

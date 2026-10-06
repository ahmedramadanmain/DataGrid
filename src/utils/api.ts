import axios from "axios";
import type { IUser } from "../types/IUser";

export const getUsers=async():Promise<IUser[]>=>{
 const response= await axios.get<IUser[]>("https://jsonplaceholder.typicode.com/users");

 return response.data;
}
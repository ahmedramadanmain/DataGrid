import type { IUser } from "../types/IUser";

export const getCities= (users:IUser[]):string[]=>{
    return users.map((user)=>user.address.city);
}
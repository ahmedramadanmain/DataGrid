import type { IUser } from "../types/IUser";

export const getCompanies= (users:IUser[]):string[]=>{
    return users.map((user)=>user.company.name);
}
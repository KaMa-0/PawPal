import UserType from "./enums/UserType";
interface User {
    userId: number;
    email: string;
    userType: UserType;
    registrationDate: Date;
}

export default User;

export class User{
    constructor(
        readonly id: string,
        readonly email: string,
        readonly username: string,
        readonly passwordHash: string,
        readonly createdAt: Date,
        readonly updatedAt: Date
    ){}
};
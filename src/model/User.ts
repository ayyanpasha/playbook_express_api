import { model, Schema, Document, Model } from "mongoose";

interface IUser extends Document {
    email: string;
    password: string;
    date: Date;
}

const UserSchema: Schema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User: Model<IUser> = model<IUser>('User', UserSchema);
User.createIndexes();
export default User;
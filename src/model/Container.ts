import { model, Schema, Document, Model, Types } from "mongoose";

interface IContainer extends Document {
    userId: Types.ObjectId;
    createdAt: Date;
}

const ContainerSchema: Schema = new Schema<IContainer>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' is the name of the User model
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Container: Model<IContainer> = model<IContainer>('Code', ContainerSchema);
Container.createIndexes();
export default Container;

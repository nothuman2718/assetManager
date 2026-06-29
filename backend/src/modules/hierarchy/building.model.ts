import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type BuildingStatus = 'active' | 'inactive' | 'deleted';

export type Building = {
  name: string;
  code: string;
  plantId: Types.ObjectId;
  status: BuildingStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type BuildingDocument = HydratedDocument<Building>;

const buildingSchema = new Schema<Building>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
    },
    plantId: {
      type: Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'deleted'],
      required: true,
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

buildingSchema.index({ plantId: 1, code: 1 }, { unique: true });
buildingSchema.index({ status: 1 });

export const BuildingModel = model<Building>('Building', buildingSchema);

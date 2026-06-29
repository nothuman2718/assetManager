import { Schema, model, type HydratedDocument } from 'mongoose';

export type PlantStatus = 'active' | 'inactive' | 'deleted';

export type Plant = {
  name: string;
  code: string;
  status: PlantStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PlantDocument = HydratedDocument<Plant>;

const plantSchema = new Schema<Plant>(
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
      transform: (_document, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

plantSchema.index({ code: 1 }, { unique: true });
plantSchema.index({ status: 1 });

export const PlantModel = model<Plant>('Plant', plantSchema);

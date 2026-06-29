import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type DepartmentStatus = 'active' | 'inactive' | 'deleted';

export type Department = {
  name: string;
  code: string;
  buildingId: Types.ObjectId;
  status: DepartmentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type DepartmentDocument = HydratedDocument<Department>;

const departmentSchema = new Schema<Department>(
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
    buildingId: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
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

departmentSchema.index({ buildingId: 1, code: 1 }, { unique: true });
departmentSchema.index({ status: 1 });

export const DepartmentModel = model<Department>('Department', departmentSchema);

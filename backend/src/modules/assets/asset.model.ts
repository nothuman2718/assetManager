import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'deleted';

export type Asset = {
  name: string;
  code: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  plantId?: Types.ObjectId | string | null;
  buildingId?: Types.ObjectId | string | null;
  departmentId?: Types.ObjectId | string | null;
  panelId?: Types.ObjectId | string | null;
  status: AssetStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AssetDocument = HydratedDocument<Asset>;

const assetSchema = new Schema<Asset>(
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
      minlength: 2,
      uppercase: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    serialNumber: {
      type: String,
      required: true,
      trim: true,
    },
    plantId: {
      type: Schema.Types.ObjectId,
      ref: 'Plant',
      default: null,
    },
    buildingId: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
      default: null,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    panelId: {
      type: Schema.Types.ObjectId,
      ref: 'Panel',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'deleted'],
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

assetSchema.index({ code: 1 }, { unique: true });
assetSchema.index({ status: 1 });
assetSchema.index({ category: 1 });

export const AssetModel = model<Asset>('Asset', assetSchema);

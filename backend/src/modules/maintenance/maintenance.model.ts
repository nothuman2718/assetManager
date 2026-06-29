import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type MaintenanceStatus = 'scheduled' | 'completed' | 'overdue' | 'cancelled';

export type MaintenanceRecord = {
  assetId: Types.ObjectId | string;
  lastInspectionDate?: Date | null;
  lastServiceDate?: Date | null;
  warrantyUntil?: Date | null;
  technician: string;
  nextMaintenanceDate: Date;
  status: MaintenanceStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MaintenanceRecordDocument = HydratedDocument<MaintenanceRecord>;

const maintenanceRecordSchema = new Schema<MaintenanceRecord>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    lastInspectionDate: {
      type: Date,
      default: null,
    },
    lastServiceDate: {
      type: Date,
      default: null,
    },
    warrantyUntil: {
      type: Date,
      default: null,
    },
    technician: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    nextMaintenanceDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'overdue', 'cancelled'],
      required: true,
      default: 'scheduled',
    },
    notes: {
      type: String,
      trim: true,
      default: null,
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

maintenanceRecordSchema.index({ assetId: 1 });
maintenanceRecordSchema.index({ nextMaintenanceDate: 1 });
maintenanceRecordSchema.index({ status: 1 });

export const MaintenanceRecordModel = model<MaintenanceRecord>('MaintenanceRecord', maintenanceRecordSchema);

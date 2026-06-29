import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type PanelStatus = 'active' | 'inactive' | 'deleted';

export type Panel = {
  name: string;
  code: string;
  departmentId: Types.ObjectId;
  status: PanelStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PanelDocument = HydratedDocument<Panel>;

const panelSchema = new Schema<Panel>(
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
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
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
      transform: (_document, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

panelSchema.index({ departmentId: 1, code: 1 }, { unique: true });
panelSchema.index({ status: 1 });

export const PanelModel = model<Panel>('Panel', panelSchema);

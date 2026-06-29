import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'disabled';
export type DeviceProtocol = 'ModbusTCP' | 'ModbusRTU' | 'EthernetIP' | 'OPC-UA';

export type Device = {
  assetId: Types.ObjectId | string;
  name: string;
  ipAddress?: string;
  protocol: DeviceProtocol;
  port: number;
  modbusAddress?: number;
  communicationType: string;
  pollingInterval: number;
  status: DeviceStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type DeviceDocument = HydratedDocument<Device>;

const deviceSchema = new Schema<Device>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },
    protocol: {
      type: String,
      enum: ['ModbusTCP', 'ModbusRTU', 'EthernetIP', 'OPC-UA'],
      required: true,
    },
    port: {
      type: Number,
      required: true,
      min: 1,
      max: 65535,
    },
    modbusAddress: {
      type: Number,
      min: 1,
      max: 247,
    },
    communicationType: {
      type: String,
      required: true,
      trim: true,
    },
    pollingInterval: {
      type: Number,
      required: true,
      min: 5,
      max: 3600,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance', 'disabled'],
      required: true,
      default: 'online',
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

deviceSchema.index({ assetId: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ protocol: 1 });

export const DeviceModel = model<Device>('Device', deviceSchema);

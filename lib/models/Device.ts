import mongoose, { Schema, type Document } from "mongoose"

export interface IDevice extends Document {
  deviceKey: string
  playlists: mongoose.Types.ObjectId[]
  settings: {
    language: string
    layout: "grid" | "list"
    parentalPin?: string
    autoplay: boolean
    defaultQuality: string
  }
  createdAt: Date
  updatedAt: Date
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    playlists: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
    settings: {
      language: { type: String, default: "en" },
      layout: { type: String, enum: ["grid", "list"], default: "grid" },
      parentalPin: { type: String },
      autoplay: { type: Boolean, default: true },
      defaultQuality: { type: String, default: "auto" },
    },
  },
  { timestamps: true },
)

export default mongoose.models.Device || mongoose.model<IDevice>("Device", DeviceSchema)

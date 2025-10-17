import mongoose, { Schema, type Document } from "mongoose"

export interface IPlaylist extends Document {
  name: string
  url?: string
  content?: string
  deviceKey: string
  userId?: string
  channels: mongoose.Types.ObjectId[]
  isActive: boolean
  lastParsed?: Date
  parseErrors?: string[]
  createdAt: Date
  updatedAt: Date
}

const PlaylistSchema = new Schema<IPlaylist>(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    content: {
      type: String,
    },
    deviceKey: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    channels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastParsed: {
      type: Date,
    },
    parseErrors: [String],
  },
  { timestamps: true },
)

export default mongoose.models.Playlist || mongoose.model<IPlaylist>("Playlist", PlaylistSchema)

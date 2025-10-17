import mongoose, { Schema, type Document } from "mongoose"

export interface IChannel extends Document {
  name: string
  tvgId?: string
  tvgLogo?: string
  groupTitle?: string
  streamUrl: string
  type: "live" | "movie" | "series"
  playlistId: mongoose.Types.ObjectId
  metadata?: {
    duration?: string
    rating?: string
    description?: string
    year?: string
    genre?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

const ChannelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: true,
    },
    tvgId: String,
    tvgLogo: String,
    groupTitle: String,
    streamUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["live", "movie", "series"],
      default: "live",
    },
    playlistId: {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
      required: true,
      index: true,
    },
    metadata: {
      duration: String,
      rating: String,
      description: String,
      year: String,
      genre: [String],
    },
  },
  { timestamps: true },
)

export default mongoose.models.Channel || mongoose.model<IChannel>("Channel", ChannelSchema)

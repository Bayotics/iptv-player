import mongoose, { Schema, type Document } from "mongoose"

export interface IWatchHistory extends Document {
  deviceKey: string
  userId?: string
  channelId: mongoose.Types.ObjectId
  watchedAt: Date
  duration: number
  position: number
}

const WatchHistorySchema = new Schema<IWatchHistory>(
  {
    deviceKey: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
    duration: Number,
    position: Number,
  },
  { timestamps: true },
)

export default mongoose.models.WatchHistory || mongoose.model<IWatchHistory>("WatchHistory", WatchHistorySchema)

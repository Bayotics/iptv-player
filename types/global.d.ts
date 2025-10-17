import type mongoose from "mongoose"

declare global {
  var globalMongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

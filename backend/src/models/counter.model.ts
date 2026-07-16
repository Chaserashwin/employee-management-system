import { model, models, Schema, type Model } from "mongoose";

export type CounterDocument = {
  _id: string;
  seq: number;
};

const counterSchema = new Schema<CounterDocument>({
  _id: {
    required: true,
    type: String,
  },
  seq: {
    default: 0,
    required: true,
    type: Number,
  },
});

export const CounterModel =
  (models.Counter as Model<CounterDocument> | undefined) ||
  model<CounterDocument>("Counter", counterSchema);

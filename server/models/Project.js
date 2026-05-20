import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number },
  price: { type: Number },
  total: { type: Number },
  type: { type: String },
  amount: { type: Number }
}, { _id: false });

const MaterialSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  name: { type: String, required: true },
  percentage: { type: Number },
  amount: { type: Number },
  type: { type: String }
}, { _id: false });

const EstimationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number },
  price: { type: Number },
  unit: { type: String },
  total: { type: Number },
  type: { type: String }
}, { _id: false });

const ActualSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number },
  price: { type: Number },
  unit: { type: String },
  total: { type: Number }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  budget: { type: Number, default: 0 },
  createdAt: { type: String, required: true },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: null },
  expenses: [ExpenseSchema],
  materials: [MaterialSchema],
  estimations: [EstimationSchema],
  actuals: [ActualSchema]
}, { timestamps: true });

// Convert _id to id when returning JSON (if needed, but we already have a custom 'id' field)
ProjectSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Project = mongoose.model('Project', ProjectSchema);

export default Project;

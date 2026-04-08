const mongoose = require('mongoose');

const resolutionSchema = new mongoose.Schema(
  {
    resolutionId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    pdfLink: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    dateDocketed: {
      type: Date,
      required: true,
    },
    datePublished: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['approved', 'pending'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.resolutionId;
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;
        delete ret._id;
        delete ret.resolutionId;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Resolution', resolutionSchema);

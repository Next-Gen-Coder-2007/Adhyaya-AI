import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    moduleId: {
      type: String,
      default: '',
    },
    sectionId: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      courseTitle: { type: String, default: '' },
      moduleTitle: { type: String, default: '' },
      sectionTitle: { type: String, default: '' },
      sectionType: { type: String, default: 'video' },
      startTime: { type: Number, default: 0 },
      endTime: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const Chunk = mongoose.model('Chunk', chunkSchema);

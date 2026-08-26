import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['video', 'quiz', 'assignment', 'summary'],
      default: 'video',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Number,
      default: 0,
    },
    endTime: {
      type: Number,
      default: 0,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    quizScore: {
      type: Number,
      default: null,
    },
    quizAnswers: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.start_time = ret.startTime;
        ret.end_time = ret.endTime;
        ret.quiz_score = ret.quizScore;
        ret.quiz_answers = ret.quizAnswers;
        ret.completed_at = ret.completedAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.start_time = ret.startTime;
        ret.end_time = ret.endTime;
        ret.quiz_score = ret.quizScore;
        ret.quiz_answers = ret.quizAnswers;
        ret.completed_at = ret.completedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Number,
      default: 0,
    },
    endTime: {
      type: Number,
      default: 0,
    },
    videoUrl: {
      type: String,
      default: '',
    },
    sections: [sectionSchema],
  },
  {
    _id: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.start_time = ret.startTime;
        ret.end_time = ret.endTime;
        ret.video_url = ret.videoUrl;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.start_time = ret.startTime;
        ret.end_time = ret.endTime;
        ret.video_url = ret.videoUrl;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
      index: true,
    },
    progress: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    progressStep: {
      type: String,
      default: 'Initializing AI course synthesis...',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    isPlaylist: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
    modules: [moduleSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.user_id = ret.userId ? ret.userId.toString() : '';
        ret.image_url = ret.imageUrl || '';
        ret.imageUrl = ret.imageUrl || '';
        ret.video_url = ret.videoUrl || '';
        ret.youtube_url = ret.videoUrl || '';
        ret.videoUrl = ret.videoUrl || '';
        ret.is_playlist = ret.isPlaylist;
        ret.error_message = ret.errorMessage;
        ret.progress_step = ret.progressStep;
        ret.created_at = ret.createdAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : '';
        ret.user_id = ret.userId ? ret.userId.toString() : '';
        ret.image_url = ret.imageUrl || '';
        ret.imageUrl = ret.imageUrl || '';
        ret.video_url = ret.videoUrl || '';
        ret.youtube_url = ret.videoUrl || '';
        ret.videoUrl = ret.videoUrl || '';
        ret.is_playlist = ret.isPlaylist;
        ret.error_message = ret.errorMessage;
        ret.progress_step = ret.progressStep;
        ret.created_at = ret.createdAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Course = mongoose.model('Course', courseSchema);

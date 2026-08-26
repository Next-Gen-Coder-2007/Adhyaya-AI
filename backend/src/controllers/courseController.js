import crypto from 'crypto';
import { Course } from '../models/Course.js';
import { generateCourseData } from '../agents/curriculumAgent.js';
import { embedCourse, deleteCourseEmbeddings } from '../services/embeddingService.js';
import { chatWithRAG } from '../agents/chatAgent.js';
import { exportCourseToMarkdown } from '../services/markdownService.js';

// Asynchronous background synthesis worker (Zero intermediate DB spam)
async function generateCourseModulesTask(courseId, youtubeUrl, isPlaylist = false) {
  try {
    const course = await Course.findById(courseId);
    if (!course) return;

    const result = await generateCourseData(
      course.title,
      course.description,
      youtubeUrl,
      isPlaylist
    );

    if (!result || !result.modules || result.modules.length === 0) {
      course.status = 'failed';
      course.progress = 0;
      course.errorMessage =
        'Could not extract video content or transcripts. Ensure the video has public captions or try another link.';
      await course.save();
      return;
    }

    if (result.title) course.title = result.title;
    if (result.description) course.description = result.description;

    course.modules = result.modules;
    course.status = 'completed';
    course.progress = 100;
    course.progressStep = 'Course curriculum ready!';
    course.errorMessage = null;

    // Single atomic database save on completion
    await course.save();

    // Asynchronously embed course into vector store
    try {
      await embedCourse(course._id, course.title, course.modules);
    } catch {
      // ignore
    }
  } catch (err) {
    try {
      const course = await Course.findById(courseId);
      if (course) {
        course.status = 'failed';
        course.progress = 0;
        course.errorMessage = err.message || 'Generation failed. Please try again.';
        await course.save();
      }
    } catch {
      // ignore
    }
  }
}

export async function createCourse(req, res) {
  try {
    const { title, description, imageUrl, image_url, videoUrl, video_url, youtube_url, isPlaylist, is_playlist } = req.body;
    const targetUrl = videoUrl || video_url || youtube_url || '';
    const playlistFlag = isPlaylist !== undefined ? isPlaylist : Boolean(is_playlist);

    if (!targetUrl) {
      return res.status(400).json({
        detail: 'A valid YouTube video or playlist URL is required.',
      });
    }

    let finalImageUrl = imageUrl || image_url || null;
    if (!finalImageUrl || finalImageUrl.includes('/vi/default/')) {
      const match = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        finalImageUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }

    const course = new Course({
      title: title || 'Interactive Course Track',
      description: description || 'AI synthesized interactive course modules.',
      imageUrl: finalImageUrl,
      videoUrl: targetUrl,
      isPlaylist: playlistFlag,
      status: 'generating',
      progress: 5,
      progressStep: 'Initializing AI course synthesis...',
      userId: req.user._id,
    });

    await course.save();

    // Fire and forget background worker
    setImmediate(() => {
      generateCourseModulesTask(course._id, targetUrl, playlistFlag);
    });

    return res.status(200).json(course.toJSON());
  } catch (err) {
    console.error('[CREATE COURSE ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to create course' });
  }
}

export async function retryCourse(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ _id: courseId, userId: req.user._id });

    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    course.status = 'generating';
    course.progress = 5;
    course.progressStep = 'Restarting AI course synthesis...';
    course.errorMessage = null;
    await course.save();

    const targetUrl = course.videoUrl || '';
    const playlistFlag = course.isPlaylist || false;

    setImmediate(() => {
      generateCourseModulesTask(course._id, targetUrl, playlistFlag);
    });

    return res.status(200).json(course.toJSON());
  } catch (err) {
    console.error('[RETRY COURSE ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to retry course generation' });
  }
}

export async function getUserCourses(req, res) {
  try {
    const courses = await Course.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(courses.map((c) => c.toJSON()));
  } catch (err) {
    console.error('[GET COURSES ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to fetch courses' });
  }
}

export async function getCourseDetail(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ _id: courseId, userId: req.user._id });

    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    return res.status(200).json(course.toJSON());
  } catch (err) {
    console.error('[GET COURSE DETAIL ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to fetch course details' });
  }
}

export async function updateCourse(req, res) {
  try {
    const courseId = req.params.id;
    const updates = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: courseId, userId: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    return res.status(200).json(course.toJSON());
  } catch (err) {
    console.error('[UPDATE COURSE ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to update course' });
  }
}

export async function deleteCourse(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOneAndDelete({ _id: courseId, userId: req.user._id });

    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    await deleteCourseEmbeddings(course._id);

    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('[DELETE COURSE ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to delete course' });
  }
}

export async function chatWithCourseTutor(req, res) {
  try {
    const courseId = req.params.id;
    const { question, history } = req.body;

    if (!question) {
      return res.status(400).json({ detail: 'Question parameter is required.' });
    }

    const course = await Course.findOne({ _id: courseId, userId: req.user._id });
    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    const moduleTitles = (course.modules || []).map((m) => m.title);

    const result = await chatWithRAG({
      courseId: course._id.toString(),
      question,
      history: history || [],
      courseTitle: course.title,
      moduleTitles,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[CHAT ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to generate tutor response' });
  }
}

export async function exportCourseMarkdown(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ _id: courseId, userId: req.user._id });

    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    const markdown = exportCourseToMarkdown(course.toJSON());
    const safeTitle = (course.title || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_syllabus.md"`);
    return res.send(markdown);
  } catch (err) {
    console.error('[EXPORT ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to export course' });
  }
}

export async function getCourseCertificate(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ _id: courseId, userId: req.user._id });

    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }

    const allSections = (course.modules || []).flatMap((m) => m.sections || []);
    const totalSections = allSections.length;
    const completedSections = allSections.filter((s) => s.completed).length;

    if (totalSections === 0 || completedSections < totalSections) {
      return res.status(400).json({
        detail: `Course not completed yet (${completedSections}/${totalSections} lessons completed).`,
      });
    }

    const rawSignature = `${req.user._id}-${course._id}-${course.createdAt}`;
    const certHash = crypto.createHash('sha256').update(rawSignature).digest('hex').slice(0, 16).toUpperCase();

    return res.status(200).json({
      course_id: course._id.toString(),
      course_title: course.title,
      student_name: req.user.name,
      student_email: req.user.email,
      completion_date: new Date().toISOString(),
      certificate_id: `ADY-${certHash}`,
      total_modules: course.modules.length,
      total_lessons: totalSections,
    });
  } catch (err) {
    console.error('[CERTIFICATE ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to issue certificate' });
  }
}

export async function toggleSectionCompleted(req, res) {
  try {
    const sectionId = req.params.sectionId;

    const course = await Course.findOne({
      userId: req.user._id,
      'modules.sections._id': sectionId,
    });

    if (!course) {
      return res.status(404).json({ detail: 'Section not found' });
    }

    let targetSection = null;
    for (const mod of course.modules) {
      const sec = mod.sections.id(sectionId);
      if (sec) {
        sec.completed = !sec.completed;
        sec.completedAt = sec.completed ? new Date() : null;
        targetSection = sec;
        break;
      }
    }

    await course.save();

    return res.status(200).json({
      id: targetSection._id.toString(),
      completed: targetSection.completed,
    });
  } catch (err) {
    console.error('[TOGGLE SECTION ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to toggle section' });
  }
}

export async function submitQuizScore(req, res) {
  try {
    const sectionId = req.params.sectionId;
    const { score, answers } = req.body;

    const course = await Course.findOne({
      userId: req.user._id,
      'modules.sections._id': sectionId,
    });

    if (!course) {
      return res.status(404).json({ detail: 'Section not found' });
    }

    let targetSection = null;
    for (const mod of course.modules) {
      const sec = mod.sections.id(sectionId);
      if (sec) {
        sec.quizScore = score;
        sec.quizAnswers = answers;
        if (score >= 60) {
          sec.completed = true;
          sec.completedAt = new Date();
        }
        targetSection = sec;
        break;
      }
    }

    await course.save();

    return res.status(200).json({
      id: targetSection._id.toString(),
      score: targetSection.quizScore,
      completed: targetSection.completed,
    });
  } catch (err) {
    console.error('[SUBMIT QUIZ ERROR]', err);
    return res.status(500).json({ detail: err.message || 'Failed to submit quiz' });
  }
}

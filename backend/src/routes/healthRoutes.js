import { Router } from 'express';
import { getDBStatus } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'online',
    name: env.PROJECT_NAME,
    version: env.VERSION,
    environment: env.NODE_ENV,
    features: [
      'curriculum_generation',
      'rag_tutor',
      'quizzes',
      'assignments',
      'notes',
      'markdown_export',
      'certificates',
      'telemetry',
      '10hr_video_token_optimizer',
    ],
  });
});

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    database: dbStatus,
    service: 'adhyaya-ai-backend',
  });
});

router.get('/health/stats', async (req, res) => {
  try {
    if (getDBStatus() !== 'connected') {
      return res.json({
        status: 'degraded',
        database: 'disconnected',
        metrics: {
          total_users: 0,
          total_courses: 0,
          total_modules: 0,
          total_sections: 0,
          completed_sections: 0,
          completion_rate: '0.0%',
        },
      });
    }

    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();

    // Aggregate modules and sections across courses
    const courseData = await Course.find({}, { 'modules.sections': 1 }).lean();
    let totalModules = 0;
    let totalSections = 0;
    let completedSections = 0;

    for (const c of courseData) {
      const mods = c.modules || [];
      totalModules += mods.length;
      for (const m of mods) {
        const secs = m.sections || [];
        totalSections += secs.length;
        for (const s of secs) {
          if (s.completed) completedSections++;
        }
      }
    }

    const completionRate =
      totalSections > 0
        ? `${((completedSections / totalSections) * 100).toFixed(1)}%`
        : '0.0%';

    return res.json({
      status: 'healthy',
      metrics: {
        total_users: totalUsers,
        total_courses: totalCourses,
        total_modules: totalModules,
        total_sections: totalSections,
        completed_sections: completedSections,
        completion_rate: completionRate,
      },
    });
  } catch (err) {
    return res.json({
      status: 'degraded',
      error: err.message,
    });
  }
});

export default router;

import { Router } from 'express';
import {
  createCourse,
  retryCourse,
  getUserCourses,
  getCourseDetail,
  updateCourse,
  deleteCourse,
  exportCourseMarkdown,
  getCourseCertificate,
  chatWithCourseTutor,
  toggleSectionCompleted,
  submitQuizScore,
} from '../controllers/courseController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Course CRUD, Listing & Retry
router.post('', requireAuth, createCourse);
router.post('/:id/retry', requireAuth, retryCourse);
router.get('', requireAuth, getUserCourses);
router.get('/:id', requireAuth, getCourseDetail);
router.patch('/:id', requireAuth, updateCourse);
router.delete('/:id', requireAuth, deleteCourse);

// Export & Certificates
router.get('/:id/export', requireAuth, exportCourseMarkdown);
router.get('/:id/certificate', requireAuth, getCourseCertificate);

// AI RAG Tutor Chat
router.post('/:id/chat', requireAuth, chatWithCourseTutor);

// Section Interactions (toggle completion & submit quiz)
router.patch('/sections/:sectionId/toggle', requireAuth, toggleSectionCompleted);
router.post('/sections/:sectionId/quiz-submit', requireAuth, submitQuizScore);

export default router;

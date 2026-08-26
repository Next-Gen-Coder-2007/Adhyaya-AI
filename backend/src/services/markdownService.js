export function exportCourseToMarkdown(course) {
  const mdLines = [
    `# ${course.title}`,
    `\n**Course Overview:** ${course.description || 'N/A'}`,
    `**Video Reference:** ${course.videoUrl || course.video_url || 'N/A'}`,
    `**Generated via:** Adhyaya AI Learning Platform`,
    `\n---\n`,
    `## Curriculum Outline & Learning Modules\n`,
  ];

  const modules = course.modules || [];
  modules.forEach((mod, idx) => {
    mdLines.push(`### Module ${idx + 1}: ${mod.title}`);
    const sections = mod.sections || [];

    sections.forEach((sec) => {
      const status = sec.completed ? '[x]' : '[ ]';
      const scoreBadge =
        sec.quizScore !== null && sec.quizScore !== undefined
          ? ` (Quiz Score: ${sec.quizScore}%)`
          : sec.quiz_score !== null && sec.quiz_score !== undefined
          ? ` (Quiz Score: ${sec.quiz_score}%)`
          : '';
      mdLines.push(`- ${status} **${sec.title}** (${sec.type})${scoreBadge}`);

      if (sec.content && typeof sec.content === 'object') {
        const synopsis = sec.content.synopsis || sec.content.description || sec.content.summary;
        if (synopsis) {
          mdLines.push(`  - *Synopsis:* ${synopsis}`);
        }
      }
    });
    mdLines.push('');
  });

  if (course.notes) {
    mdLines.push('\n---\n## Student Study Notes & Scratchpad\n');
    mdLines.push(course.notes);
  }

  return mdLines.join('\n');
}

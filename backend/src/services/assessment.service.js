// src/services/assessment.service.js
import * as assessmentRepo from "../repositories/assessment.repository.js";
import * as jobseekerRepo from "../repositories/jobseeker.repository.js";

/**
 * Assessment Service
 * - Handles personality assessment logic
 * - Job seekers must complete assessment before applying for jobs
 */

// Predefined personality assessment questions
const PERSONALITY_QUESTIONS = [
  {
    id: "q1",
    questionText: "How do you prefer to work on projects?",
    options: [
      "Independently with minimal supervision",
      "In a collaborative team environment",
      "A mix of both independent and team work",
      "I prefer clear direction and guidance",
    ],
    category: "work_style",
  },
  {
    id: "q2",
    questionText: "When faced with a challenging problem, you typically:",
    options: [
      "Analyze it thoroughly before taking action",
      "Jump in and start solving immediately",
      "Seek input from others first",
      "Break it down into smaller manageable tasks",
    ],
    category: "problem_solving",
  },
  {
    id: "q3",
    questionText: "In team meetings, you usually:",
    options: [
      "Lead the discussion and drive decisions",
      "Listen carefully and contribute when needed",
      "Share ideas and facilitate collaboration",
      "Focus on taking notes and action items",
    ],
    category: "leadership",
  },
  {
    id: "q4",
    questionText: "Your ideal work environment is:",
    options: [
      "Fast-paced with frequent changes",
      "Structured with clear processes",
      "Creative and innovative",
      "Balanced and predictable",
    ],
    category: "environment",
  },
  {
    id: "q5",
    questionText: "When receiving feedback, you:",
    options: [
      "Appreciate direct and honest criticism",
      "Prefer constructive suggestions with examples",
      "Like to discuss and understand the reasoning",
      "Value positive reinforcement alongside improvements",
    ],
    category: "communication",
  },
  {
    id: "q6",
    questionText: "How do you handle tight deadlines?",
    options: [
      "Thrive under pressure and deliver quality work",
      "Plan meticulously to avoid last-minute rush",
      "Stay calm and prioritize tasks effectively",
      "Work best with buffer time and flexibility",
    ],
    category: "stress_management",
  },
  {
    id: "q7",
    questionText: "Your approach to learning new skills is:",
    options: [
      "Self-taught through research and practice",
      "Formal training and structured courses",
      "Learning from experienced mentors",
      "Hands-on experimentation and trial",
    ],
    category: "learning_style",
  },
  {
    id: "q8",
    questionText: "When working on long-term projects, you:",
    options: [
      "Focus on the big picture and end goal",
      "Pay attention to details at every stage",
      "Balance both strategic vision and execution",
      "Adapt your approach as the project evolves",
    ],
    category: "project_approach",
  },
  {
    id: "q9",
    questionText: "In a conflict situation at work, you typically:",
    options: [
      "Address it directly and seek resolution",
      "Mediate and find common ground",
      "Give time for emotions to settle first",
      "Involve a neutral third party if needed",
    ],
    category: "conflict_resolution",
  },
  {
    id: "q10",
    questionText: "What motivates you most in your work?",
    options: [
      "Recognition and career advancement",
      "Making meaningful impact",
      "Continuous learning and growth",
      "Work-life balance and stability",
    ],
    category: "motivation",
  },
];

export const getAssessmentQuestions = () => {
  return PERSONALITY_QUESTIONS;
};

export const startAssessment = async (userId) => {
  // Check if user is a job seeker
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Only job seekers can take personality assessment");
    error.code = "NOT_JOBSEEKER";
    throw error;
  }

  // Check if assessment already exists
  const existing = await assessmentRepo.findAssessmentByUserId(userId);
  if (existing && existing.score !== undefined) {
    const error = new Error("Assessment already completed");
    error.code = "ASSESSMENT_COMPLETED";
    throw error;
  }

  // Create new assessment with questions
  const assessment = await assessmentRepo.createAssessment({
    userId,
    questions: PERSONALITY_QUESTIONS,
    answers: [],
  });

  return assessment;
};

export const submitAssessment = async (userId, answers) => {
  // Validate user is job seeker
  const profile = await jobseekerRepo.findJobSeekerProfileByUserId(userId);
  if (!profile) {
    const error = new Error("Profile not found");
    error.code = "PROFILE_NOT_FOUND";
    throw error;
  }

  // Get assessment
  const assessment = await assessmentRepo.findAssessmentByUserId(userId);
  if (!assessment) {
    const error = new Error("Assessment not found. Please start assessment first.");
    error.code = "ASSESSMENT_NOT_FOUND";
    throw error;
  }

  if (assessment.score !== undefined) {
    const error = new Error("Assessment already submitted");
    error.code = "ALREADY_SUBMITTED";
    throw error;
  }

  // Validate answers
  if (!answers || answers.length !== PERSONALITY_QUESTIONS.length) {
    const error = new Error(
      `All ${PERSONALITY_QUESTIONS.length} questions must be answered`
    );
    error.code = "INCOMPLETE_ANSWERS";
    throw error;
  }

  // Validate answer format
  const validQuestionIds = PERSONALITY_QUESTIONS.map((q) => q.id);
  for (const answer of answers) {
    if (!validQuestionIds.includes(answer.questionId)) {
      const error = new Error(`Invalid question ID: ${answer.questionId}`);
      error.code = "INVALID_QUESTION";
      throw error;
    }
    if (!answer.selectedOption) {
      const error = new Error("Each answer must have a selected option");
      error.code = "MISSING_OPTION";
      throw error;
    }
  }

  // Calculate score based on answers
  const score = calculateAssessmentScore(answers);

  // Generate personality report
  const report = generatePersonalityReport(answers, score);

  // Update assessment with answers and score
  const updatedAssessment = await assessmentRepo.submitAssessmentAnswers(
    assessment._id,
    answers,
    score,
    null // reportFileId can be added later if generating PDF
  );

  // Link assessment to job seeker profile
  await jobseekerRepo.updateFileReference(
    userId,
    "personalityReport",
    updatedAssessment._id
  );

  return {
    assessment: updatedAssessment,
    report,
  };
};

export const getAssessmentResult = async (userId) => {
  const assessment = await assessmentRepo.findAssessmentByUserId(userId);
  if (!assessment) {
    const error = new Error("Assessment not found");
    error.code = "ASSESSMENT_NOT_FOUND";
    throw error;
  }

  if (!assessment.score && assessment.score !== 0) {
    const error = new Error("Assessment not yet completed");
    error.code = "ASSESSMENT_INCOMPLETE";
    throw error;
  }

  // Generate report
  const report = generatePersonalityReport(assessment.answers, assessment.score);

  return {
    assessment,
    report,
  };
};

export const checkAssessmentStatus = async (userId) => {
  const assessment = await assessmentRepo.findAssessmentByUserId(userId);

  if (!assessment) {
    return {
      completed: false,
      started: false,
      message: "Assessment not started",
    };
  }

  if (!assessment.score && assessment.score !== 0) {
    return {
      completed: false,
      started: true,
      message: "Assessment started but not submitted",
    };
  }

  return {
    completed: true,
    started: true,
    score: assessment.score,
    message: "Assessment completed",
  };
};

export const retakeAssessment = async (userId) => {
  // Delete existing assessment
  const existing = await assessmentRepo.findAssessmentByUserId(userId);
  if (existing) {
    await assessmentRepo.deleteAssessment(existing._id);
  }

  // Unlink from profile
  await jobseekerRepo.updateFileReference(userId, "personalityReport", null);

  // Create new assessment
  return startAssessment(userId);
};

// Helper function to calculate score
const calculateAssessmentScore = (answers) => {
  // Simple scoring algorithm (0-100 scale)
  // Each answer contributes to different personality traits

  const traits = {
    leadership: 0,
    teamwork: 0,
    adaptability: 0,
    problemSolving: 0,
    communication: 0,
  };

  answers.forEach((answer) => {
    const question = PERSONALITY_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) return;

    const optionIndex = question.options.indexOf(answer.selectedOption);

    // Score based on category and option
    switch (question.category) {
      case "work_style":
        if (optionIndex === 0) traits.leadership += 10;
        if (optionIndex === 1) traits.teamwork += 10;
        if (optionIndex === 2) traits.adaptability += 10;
        break;
      case "problem_solving":
        traits.problemSolving += (optionIndex + 1) * 2.5;
        break;
      case "leadership":
        if (optionIndex === 0) traits.leadership += 10;
        if (optionIndex === 1 || optionIndex === 2) traits.teamwork += 10;
        break;
      case "environment":
        if (optionIndex === 0 || optionIndex === 2) traits.adaptability += 10;
        break;
      case "communication":
        traits.communication += (optionIndex + 1) * 2.5;
        break;
      case "stress_management":
        traits.adaptability += (optionIndex + 1) * 2.5;
        break;
      case "learning_style":
        traits.problemSolving += (optionIndex + 1) * 2.5;
        break;
      case "project_approach":
        if (optionIndex === 2 || optionIndex === 3) traits.adaptability += 10;
        break;
      case "conflict_resolution":
        traits.communication += (optionIndex + 1) * 2.5;
        break;
      case "motivation":
        traits.leadership += (optionIndex + 1) * 2.5;
        break;
    }
  });

  // Calculate overall score (average of all traits)
  const overallScore = Object.values(traits).reduce((a, b) => a + b, 0) / 5;

  return Math.round(overallScore);
};

// Helper function to generate personality report
const generatePersonalityReport = (answers, score) => {
  const traits = {
    leadership: 0,
    teamwork: 0,
    adaptability: 0,
    problemSolving: 0,
    communication: 0,
  };

  // Recalculate individual trait scores
  answers.forEach((answer) => {
    const question = PERSONALITY_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) return;

    const optionIndex = question.options.indexOf(answer.selectedOption);

    switch (question.category) {
      case "work_style":
        if (optionIndex === 0) traits.leadership += 10;
        if (optionIndex === 1) traits.teamwork += 10;
        if (optionIndex === 2) traits.adaptability += 10;
        break;
      case "problem_solving":
        traits.problemSolving += (optionIndex + 1) * 2.5;
        break;
      case "leadership":
        if (optionIndex === 0) traits.leadership += 10;
        if (optionIndex === 1 || optionIndex === 2) traits.teamwork += 10;
        break;
      case "environment":
        if (optionIndex === 0 || optionIndex === 2) traits.adaptability += 10;
        break;
      case "communication":
        traits.communication += (optionIndex + 1) * 2.5;
        break;
      case "stress_management":
        traits.adaptability += (optionIndex + 1) * 2.5;
        break;
      case "learning_style":
        traits.problemSolving += (optionIndex + 1) * 2.5;
        break;
      case "project_approach":
        if (optionIndex === 2 || optionIndex === 3) traits.adaptability += 10;
        break;
      case "conflict_resolution":
        traits.communication += (optionIndex + 1) * 2.5;
        break;
      case "motivation":
        traits.leadership += (optionIndex + 1) * 2.5;
        break;
    }
  });

  // Determine dominant trait
  const dominantTrait = Object.entries(traits).sort((a, b) => b[1] - a[1])[0][0];

  const personalityTypes = {
    leadership:
      "Natural Leader - You demonstrate strong leadership qualities and excel at driving initiatives forward.",
    teamwork:
      "Collaborative Team Player - You thrive in team environments and excel at building consensus.",
    adaptability:
      "Highly Adaptable - You excel in dynamic environments and handle change effectively.",
    problemSolving:
      "Strategic Problem Solver - You approach challenges methodically and find innovative solutions.",
    communication:
      "Effective Communicator - You excel at conveying ideas and building relationships through communication.",
  };

  return {
    overallScore: score,
    traits: {
      leadership: Math.round(traits.leadership),
      teamwork: Math.round(traits.teamwork),
      adaptability: Math.round(traits.adaptability),
      problemSolving: Math.round(traits.problemSolving),
      communication: Math.round(traits.communication),
    },
    dominantTrait,
    personalityType: personalityTypes[dominantTrait],
    workStylePreferences: determineWorkStyle(answers),
    culturalFit: determineCulturalFit(answers),
  };
};

const determineWorkStyle = (answers) => {
  const workStyleAnswer = answers.find((a) => a.questionId === "q1");
  const environmentAnswer = answers.find((a) => a.questionId === "q4");

  return {
    collaboration: workStyleAnswer?.selectedOption || "Not specified",
    environment: environmentAnswer?.selectedOption || "Not specified",
  };
};

const determineCulturalFit = (answers) => {
  const motivationAnswer = answers.find((a) => a.questionId === "q10");

  const fitTypes = {
    "Recognition and career advancement": "Achievement-oriented culture",
    "Making meaningful impact": "Purpose-driven culture",
    "Continuous learning and growth": "Learning-focused culture",
    "Work-life balance and stability": "Balanced and supportive culture",
  };

  return fitTypes[motivationAnswer?.selectedOption] || "Varied culture fit";
};

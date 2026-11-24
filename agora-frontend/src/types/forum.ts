export interface ThreadResponse {
  id: number;
  title: string;
  body: string;
  courseTag: string | null;
  isResolved: boolean;
  voteScore: number;
  viewCount: number;
  replyCount: number;
  authorName: string;
  authorId: number;
  createdAt: string;
  /** The logged-in user's vote: 1, -1 or 0. Null/absent when unknown. */
  userVote?: number | null;
}

export interface ReplyResponse {
  id: number;
  body: string;
  isAccepted: boolean;
  voteScore: number;
  threadId: number;
  authorName: string;
  authorId: number;
  createdAt: string;
  userVote?: number | null;
}

export type VoteTargetType = "THREAD" | "REPLY";

export interface VoteResponse {
  targetType: VoteTargetType;
  targetId: number;
  voteScore: number;
  userVote: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "MODERATOR" | "ADMIN";
  reputationScore: number;
  courseOfStudy: string | null;
  academicYear: number | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export type ResourceType =
  | "LECTURE_NOTES"
  | "PERSONAL_NOTES"
  | "PAST_QUESTION"
  | "QUIZ"
  | "TEXTBOOK_CHAPTER"
  | "OTHER";

export interface ResourceResponse {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  resourceType: ResourceType;
  courseCode: string;
  courseName: string | null;
  year: number | null;
  semester: string | null;
  averageRating: number;
  downloadCount: number;
  viewCount: number;
  uploaderName: string;
  uploaderId: number;
  createdAt: string;
}

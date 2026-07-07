export interface ThreadResponse {
  id: number;
  title: string;
  body: string;
  courseTag: string;
  isResolved: boolean;
  voteScore: number;
  viewCount: number;
  replyCount: number;
  authorName: string;
  authorId: number;
  createdAt: string;
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
}
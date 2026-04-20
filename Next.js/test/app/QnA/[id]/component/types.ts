export interface QnAType {
  id: number;
  title: string;
  content: string;
  image?: string;
  createdat: string;
  qnaview: number;
  isend: number;  // 0 = 답변대기, 1 = 답변완료
}

export interface AnswerType {
  id: number;
  title: string;
  content: string;
  image?: string;
  createdat: string;
  QuestionId: number;
}

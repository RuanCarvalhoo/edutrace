export interface CommentEditData {
    id: number;
    comment: string;
    created_at: Date;
}

export interface CommentData {
    id: number;
    comment: string;
    id_user: number;
    id_author: number;
    author_name: string;
    author_level?: number | null;
    created_at: Date;
    updated_at?: Date | null;
    edits?: CommentEditData[];
}

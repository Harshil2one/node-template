export interface INotification {
    readonly id: number;
    message: string;
    receiver: number;
    sender: number;
    link: string;
    mark_as_read: number;
    created_at: number;
}
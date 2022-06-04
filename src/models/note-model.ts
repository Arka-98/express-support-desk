export default interface Note {
    id: number,
    user_id: number,
    ticket_id: number,
    user_name: string,
    is_staff: boolean,
    is_admin: boolean,
    text: string,
    createdat: string,
    updatedat: string
}
interface User {
    id: number,
    name: string,
    email: string,
    password: string,
    is_staff: boolean,
    is_admin: boolean,
    is_staff_approved: boolean,
    createdat: string,
    updatedat: string
}

export default User
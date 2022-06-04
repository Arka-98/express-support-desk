export enum PRODUCT {
    iPhone = 'iPhone',
    Macbook_Pro = 'Macbook Pro',
    iMac = 'iMac',
    iPad = 'iPad',
    Watch = 'Watch'
}

export enum STATUS {
    new = 'new',
    open = 'open',
    closed = 'closed'
}

interface Ticket {
    id: number,
    user_id: number,
    product: PRODUCT,
    description: string,
    status: STATUS,
    createdat: string,
    updatedat: string
}

export default Ticket
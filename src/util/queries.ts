const getUsers = 'SELECT u.id, u.name, u.email, u.createdat, u.is_staff, count(t.staff_id) as ticket_count FROM users u LEFT JOIN tickets t ON u.id = t.staff_id WHERE u.is_staff = $1 AND u.is_admin = $2 AND u.is_staff_approved = TRUE GROUP BY u.id, u.name, u.email, u.is_staff, u.createdat, t.staff_id ORDER BY u.createdat DESC'
const insertUser = 'INSERT INTO users(name, email, password, is_staff) VALUES($1, $2, $3, $4)'
const insertAdmin = 'INSERT INTO users(name, email, password, is_admin) VALUES($1, $2, $3, TRUE)'
const getUserById = 'SELECT * FROM users WHERE id = $1'
const getUserByIdWithoutPassword = 'SELECT id, name, email, password, is_staff, is_admin, is_staff_approved FROM users WHERE id = $1'
const getUserByEmail = 'SELECT id, name, email, password, is_staff, is_admin, is_staff_approved FROM users WHERE email = $1 AND is_staff = $2 AND is_admin = $3'
const getUserByEmailAndPassword = 'SELECT * FROM users WHERE email = $1 and password = $2'
const updateUser = 'UPDATE users SET name = $1 WHERE id = $2'
const getTicketsByUserId = 'SELECT * FROM tickets WHERE user_id = $1'
const getTicketById = 'SELECT * FROM tickets WHERE id = $1'
const getTicketWithStaffNameById = 'SELECT t.*, u.name AS staff_name FROM tickets t JOIN users u ON t.staff_id = u.id WHERE t.id = $1'
const getTicketWithUserNameById = 'SELECT t.*, u.name AS user_name FROM tickets t JOIN users u ON t.user_id = u.id WHERE t.id = $1'
const getTicketsWithUserAndStaffName = 'SELECT t.id, t.createdat, t.updatedat, t.product, t.status, u.name as user_name, s.name as staff_name FROM users u INNER JOIN tickets t ON u.id = t.user_id INNER JOIN users s ON t.staff_id = s.id ORDER BY t.createdat DESC'
const getTicketByIdAndUserId = 'SELECT * FROM tickets WHERE id = $1 AND user_id = $2'
const getTicketByIdAndStaffId = 'SELECT * FROM tickets WHERE id = $1 AND staff_id = $2'
const insertTicket = 'INSERT INTO tickets(user_id, product, description, staff_id) VALUES($1, $2, $3, $4)'
const updateTicket = 'UPDATE tickets SET product = $1, description = $2, status = $3 WHERE id = $4'
const getNotesByTicketId = 'SELECT n.id, n.user_id, n.ticket_id, u.name as user_name, u.is_staff, u.is_admin, n.text, n.createdat, n.updatedat FROM notes n JOIN users u ON n.user_id = u.id WHERE n.ticket_id = $1 ORDER BY n.createdat ASC'
const getNotesByUserIdAndTicketId = 'SELECT * FROM notes WHERE user_id = $1 AND ticket_id = $2'
const insertNote = 'INSERT INTO notes (user_id, ticket_id, text) values ($1, $2, $3)'
const countTickets = 'SELECT count(*) FROM tickets WHERE staff_id = $1 AND status = $2'
const getTicketsByStaffId = 'SELECT * FROM tickets WHERE staff_id = $1 AND status = ANY($2::status_enum[]) ORDER BY createdat DESC'
const getStaffIdWithLowestTickets = 'SELECT staff_id FROM tickets GROUP BY staff_id ORDER BY COUNT(staff_id) LIMIT 1'
const getStaffPendingApproval = 'SELECT id, name, email, is_staff, is_admin, createdat FROM users WHERE is_staff = TRUE AND is_staff_approved = FALSE ORDER BY createdat DESC'
const countStaffPendingApproval = 'SELECT COUNT(*) FROM users WHERE is_staff = TRUE AND is_staff_approved = FALSE'
const changeApprovalStatus = 'UPDATE users SET is_staff_approved = $1 WHERE id = $2'
const deleteUser = 'DELETE FROM users WHERE id = $1'

export { getUsers, getUserById, insertUser, insertAdmin, updateUser, getUserByEmail, getUserByEmailAndPassword, getUserByIdWithoutPassword, getTicketsByUserId, getTicketByIdAndUserId, insertTicket, updateTicket, getTicketWithStaffNameById, getTicketWithUserNameById, getNotesByTicketId, getNotesByUserIdAndTicketId, insertNote, countTickets, getTicketsByStaffId, getTicketByIdAndStaffId, getStaffIdWithLowestTickets, getStaffPendingApproval, countStaffPendingApproval, changeApprovalStatus, getTicketsWithUserAndStaffName, deleteUser, getTicketById }
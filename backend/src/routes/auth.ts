import { Router } from 'express'
import { register, login, refresh, logout, me, forgotPassword, resetPassword } from '../controllers/authController'
import { authenticate } from '../middlewares/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/me', authenticate, me)

export default router

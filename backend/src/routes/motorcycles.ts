import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import {
  getMotorcycles,
  getMotorcycle,
  createMotorcycle,
  updateMotorcycle,
  deleteMotorcycle,
} from '../controllers/motorcycleController'

const router = Router()

router.use(authenticate)

router.get('/', getMotorcycles)
router.get('/:id', getMotorcycle)
router.post('/', createMotorcycle)
router.put('/:id', updateMotorcycle)
router.delete('/:id', deleteMotorcycle)

export default router

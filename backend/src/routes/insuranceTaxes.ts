import { Router } from 'express'
import { authenticate } from '../middlewares/auth'
import {
  createInsuranceTax,
  getInsuranceTaxes,
  getExpiringInsuranceTaxes,
  updateInsuranceTax,
  deleteInsuranceTax,
} from '../controllers/insuranceTaxController'

const router = Router()

router.use(authenticate)

// /expiring must be declared before /:id
router.get('/expiring', getExpiringInsuranceTaxes)

router.post('/', createInsuranceTax)
router.get('/', getInsuranceTaxes)
router.put('/:id', updateInsuranceTax)
router.delete('/:id', deleteInsuranceTax)

export default router

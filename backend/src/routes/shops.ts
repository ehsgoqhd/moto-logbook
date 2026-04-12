import { Router } from 'express'
import { getShops, getShop } from '../controllers/shopController'

const router = Router()

router.get('/', getShops)
router.get('/:id', getShop)

export default router

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { shopsApi } from '../../api/shops'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import type { RepairShop } from '../../types'
import { MAINTENANCE_CATEGORY_LABELS } from '../../types'

export function ShopsPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['shops', selectedBrand],
    queryFn: () => shopsApi.list(selectedBrand || undefined),
    select: (d) => d.data.data,
  })

  const shops = data ?? []

  // 전체 브랜드 목록 (필터용)
  const allBrands = useQuery({
    queryKey: ['shops'],
    queryFn: () => shopsApi.list(),
    select: (d) => {
      const brands = new Set<string>()
      d.data.data.forEach((shop) => shop.specialties.forEach((s) => brands.add(s.brand)))
      return Array.from(brands).sort()
    },
  })

  return (
    <Layout title="정비샵">
      {/* 브랜드 필터 */}
      {(allBrands.data?.length ?? 0) > 0 && (
        <div className="flex gap-2 pt-2 pb-1 overflow-x-auto">
          <button
            onClick={() => setSelectedBrand('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedBrand === '' ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            전체
          </button>
          {allBrands.data?.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand === selectedBrand ? '' : brand)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedBrand === brand ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : shops.length === 0 ? (
        <EmptyState icon="🔧" title="등록된 정비샵이 없습니다" />
      ) : (
        <div className="flex flex-col gap-2 pt-2">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </Layout>
  )
}

function ShopCard({ shop }: { shop: RepairShop }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-100 truncate">{shop.name}</p>
            {shop.isRecommended && (
              <Badge variant="orange">추천</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{shop.address}</p>

          {/* 취급 브랜드 */}
          {shop.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {[...new Set(shop.specialties.map((s) => s.brand))].map((brand) => (
                <Badge key={brand} variant="blue">{brand}</Badge>
              ))}
            </div>
          )}

          {/* 전문 정비 항목 */}
          {shop.specialties.some((s) => s.category) && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">전문 정비</p>
              <div className="flex flex-wrap gap-1">
                {[...new Set(shop.specialties.map((s) => s.category).filter(Boolean))].map((cat) => (
                  <Badge key={cat} variant="green">
                    {MAINTENANCE_CATEGORY_LABELS[cat as keyof typeof MAINTENANCE_CATEGORY_LABELS] ?? cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {shop.businessHours && (
            <p className="text-xs text-gray-500 mt-1.5">🕐 {shop.businessHours}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {shop.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-xs text-gray-300">{shop.avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-600">({shop.reviewCount})</span>
            </div>
          )}
          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              className="text-xs text-brand-400 px-2 py-1 bg-gray-800 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              전화
            </a>
          )}
          {shop.kakaoMapUrl && (
            <a
              href={shop.kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-yellow-400 px-2 py-1 bg-gray-800 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              지도
            </a>
          )}
        </div>
      </div>

      {shop.description && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{shop.description}</p>
      )}
    </Card>
  )
}

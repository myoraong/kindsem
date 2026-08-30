"use client"

import { useMemo, useState } from "react"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { formatPercent, formatWon, manwonToWon } from "@/lib/format"
import { LAW_SOURCES } from "@/lib/law-sources"
import { calcVehicleAcquisition, type VehicleKind } from "@/lib/vehicle"
import type { CalcItem } from "@/lib/catalog"

const FAQ = [
  {
    q: "과세표준은 출고가인가요?",
    a: "신차는 부가세 뺀 공급가액입니다. 중고차는 신고가액과 시가표준액 중 큰 쪽을 쓰는 경우가 있어, 시가표준은 위택스에서 확인하세요. 이 화면은 적어 주신 과세표준에 법정 세율만 곱습니다.",
  },
  {
    q: "공채·번호판은요?",
    a: "시·도 조례와 매입 할인율이라 넣지 않았습니다. 전기·수소·다자녀·장애인 감면도 요건이 각각 달라 계산에 넣지 않았습니다. 경형만 지방세특례제한법 제67조 75만 원(2027.12.31.까지)을 뺍니다.",
  },
]

export function VehicleTax({ item }: { item: CalcItem }) {
  const [base, setBase] = useState("3000")
  const [kind, setKind] = useState<VehicleKind>("passenger")

  const result = useMemo(() => {
    return calcVehicleAcquisition({
      base: manwonToWon(Number(base) || 0),
      kind,
    })
  }, [base, kind])

  return (
    <CalcShell
      item={item}
      faq={<FaqList items={FAQ} />}
      result={
        <ResultReceipt
          title="취득세 · 지방교육세"
          amount={result?.total ?? null}
          caption={result ? `취득세 ${formatPercent(result.rate * 100, 0)}` : undefined}
          rows={
            result
              ? [
                  { label: "산출 취득세", value: formatWon(result.rawAcq) },
                  { label: "경형 감면", value: formatWon(result.relief) },
                  { label: "납부 취득세", value: formatWon(result.acquisition) },
                  { label: "지방교육세", value: formatWon(result.education) },
                ]
              : []
          }
          empty="과세표준만 넣으면 차종별 취득세가 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <MoneyField
          id="base"
          label="과세표준"
          hint="신차는 부가세 제외 공급가"
          value={base}
          onChange={setBase}
        />
        <ChoiceGroup
          label="차종"
          value={kind}
          onChange={setKind}
          options={[
            { value: "passenger", label: "비영업 승용" },
            { value: "compact", label: "경형" },
            { value: "otherPrivate", label: "비영업 승합·화물" },
            { value: "commercial", label: "영업용" },
          ]}
        />
        <Hint>
          비영업 승용 7%, 경형 4%, 그 밖의 비영업 5%, 영업용 4%입니다. 지방교육세는 세율에서 2%를 뺀 뒤
          20%입니다. 공채는 조례라 빠집니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.vehicle, LAW_SOURCES.compactCar]} />
      </div>
    </CalcShell>
  )
}

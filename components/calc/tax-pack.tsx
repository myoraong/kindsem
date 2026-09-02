"use client"

import { useMemo, useState } from "react"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { LAW_SOURCES } from "@/lib/law-sources"
import { formatKoreanUnit, formatPercent, formatWon, manwonToWon } from "@/lib/format"
import { GIFT_DEDUCTIONS, INHERITANCE } from "@/lib/policy.generated"
import type { CalcItem } from "@/lib/catalog"
import {
  calcCapitalGains,
  calcCorporateGains,
  calcEncumberedGift,
  calcGiftTax,
  calcHoldingTax,
  calcInheritance,
  calcLicenseTax,
  type GiftRelation,
  type Homes,
} from "@/lib/realty-tax"

export function CapitalGainsCalc({ item }: { item: CalcItem }) {
  const [buy, setBuy] = useState("40000")
  const [sell, setSell] = useState("80000")
  const [costs, setCosts] = useState("500")
  const [years, setYears] = useState("8")
  const [homes, setHomes] = useState<Homes>("1")
  const [adjusted, setAdjusted] = useState(false)
  const [lived2y, setLived2y] = useState(true)

  const result = useMemo(() => {
    return calcCapitalGains({
      buy: manwonToWon(Number(buy) || 0),
      sell: manwonToWon(Number(sell) || 0),
      costs: manwonToWon(Number(costs) || 0),
      years: Number(years) || 0,
      homes,
      adjusted,
      lived2y,
    })
  }, [buy, sell, costs, years, homes, adjusted, lived2y])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="예상 양도세"
          amount={result?.total ?? null}
          caption={result?.label}
          rows={
            result
              ? [
                  { label: "양도차익", value: formatWon(result.profit) },
                  { label: "장특공제", value: formatPercent(result.specialRate * 100, 0) },
                  { label: "과세표준", value: formatWon(result.taxable) },
                  { label: "양도소득세", value: formatWon(result.national) },
                  { label: "지방소득세", value: formatWon(result.local) },
                ]
              : []
          }
          empty="취득가와 양도가액만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="주택 수"
          value={homes}
          onChange={setHomes}
          options={[
            { value: "1", label: "1주택" },
            { value: "2", label: "2주택" },
            { value: "3+", label: "3주택 이상" },
          ]}
        />
        <MoneyField id="buy" label="취득가액" value={buy} onChange={setBuy} />
        <MoneyField id="sell" label="양도가액" value={sell} onChange={setSell} />
        <MoneyField id="cost" label="필요경비" value={costs} onChange={setCosts} />
        <MoneyField id="yr" label="보유기간" unit="년" value={years} onChange={setYears} />
        <CheckRow id="live" checked={lived2y} onChange={setLived2y}>
          2년 이상 거주
        </CheckRow>
        <CheckRow id="adj" checked={adjusted} onChange={setAdjusted}>
          조정대상지역
        </CheckRow>
        <p className="text-sm leading-6 text-muted-foreground">
          1주택·2년 보유·12억 이하는 비과세입니다. 조정대상지역은 2년 거주도 필요합니다. 다주택
          중과는 2026년 5월 10일 이후 양도분이며, 중과 때는 장기보유특별공제를 적용하지 않습니다.
        </p>
        <LawNote lines={[LAW_SOURCES.income]} />
      </div>
    </CalcShell>
  )
}

export function CorporateGainsCalc({ item }: { item: CalcItem }) {
  const [buy, setBuy] = useState("40000")
  const [sell, setSell] = useState("80000")
  const [costs, setCosts] = useState("500")
  const [land, setLand] = useState(false)

  const result = useMemo(() => {
    return calcCorporateGains({
      buy: manwonToWon(Number(buy) || 0),
      sell: manwonToWon(Number(sell) || 0),
      costs: manwonToWon(Number(costs) || 0),
      unbusinessLand: land,
    })
  }, [buy, sell, costs, land])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="예상 법인세"
          amount={result?.total ?? null}
          caption={result?.label}
          rows={
            result
              ? [
                  { label: "양도차익", value: formatWon(result.profit) },
                  { label: "법인세", value: formatWon(result.corp) },
                  { label: "추가과세", value: formatWon(result.extra) },
                ]
              : []
          }
          empty="취득가와 양도가액만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <MoneyField id="cbuy" label="취득가액" value={buy} onChange={setBuy} />
        <MoneyField id="csell" label="양도가액" value={sell} onChange={setSell} />
        <MoneyField id="ccost" label="소요경비" value={costs} onChange={setCosts} />
        <CheckRow id="land" checked={land} onChange={setLand}>
          비사업용토지
        </CheckRow>
        <LawNote lines={[LAW_SOURCES.corp]} />
      </div>
    </CalcShell>
  )
}

export function HoldingTaxCalc({ item }: { item: CalcItem }) {
  const [price, setPrice] = useState("90000")
  const [homes, setHomes] = useState<Homes>("1")

  const result = useMemo(() => {
    return calcHoldingTax({
      price: manwonToWon(Number(price) || 0),
      homes,
    })
  }, [price, homes])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="예상 보유세"
          amount={result?.total ?? null}
          caption="재산세 + 종부세"
          rows={
            result
              ? [
                  { label: "과세표준", value: formatWon(result.standard) },
                  { label: "재산세", value: formatWon(result.property) },
                  { label: "도시지역분", value: formatWon(result.city) },
                  { label: "지방교육세", value: formatWon(result.education) },
                  { label: "종부세", value: formatWon(result.jongbu) },
                  { label: "농특세", value: formatWon(result.rural) },
                ]
              : []
          }
          empty="공시가격만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="주택 수"
          value={homes}
          onChange={setHomes}
          options={[
            { value: "1", label: "1세대1주택" },
            { value: "2", label: "2주택" },
            { value: "3+", label: "3주택 이상" },
          ]}
        />
        <MoneyField id="pub" label="공시가격" value={price} onChange={setPrice} />
        <p className="text-sm leading-6 text-muted-foreground">
          공정시장가액비율 60%로 봅니다. 세부담상한과 특례주택은 넣지 않았습니다.
        </p>
        <LawNote lines={[LAW_SOURCES.holding]} />
      </div>
    </CalcShell>
  )
}

export function GiftTaxCalc({ item }: { item: CalcItem }) {
  const [amount, setAmount] = useState("20000")
  const [relation, setRelation] = useState<GiftRelation>("descendant")

  const result = useMemo(() => {
    return calcGiftTax({
      amount: manwonToWon(Number(amount) || 0),
      relation,
    })
  }, [amount, relation])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="예상 증여세"
          amount={result?.tax ?? null}
          caption={result ? `세율 ${formatPercent(result.rate * 100, 0)}` : undefined}
          rows={
            result
              ? [
                  { label: "공제", value: formatWon(result.deduction) },
                  { label: "과세표준", value: formatWon(result.taxable) },
                ]
              : []
          }
          empty="증여재산만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="수증자"
          value={relation}
          onChange={setRelation}
          options={[
            { value: "spouse", label: "배우자" },
            { value: "ascendant", label: "직계존속" },
            { value: "descendant", label: "직계비속" },
            { value: "other", label: "그 외" },
          ]}
        />
        <MoneyField id="gift" label="증여재산" value={amount} onChange={setAmount} />
        <p className="text-sm leading-6 text-muted-foreground">
          배우자 {formatKoreanUnit(GIFT_DEDUCTIONS.spouse)}, 직계 {formatKoreanUnit(GIFT_DEDUCTIONS.descendant)}, 그 외 친족 {formatKoreanUnit(GIFT_DEDUCTIONS.other)} 공제입니다. 10년 합산은 넣지 않았습니다.
        </p>
        <LawNote lines={[LAW_SOURCES.gift]} />
      </div>
    </CalcShell>
  )
}

export function InheritanceCalc({ item }: { item: CalcItem }) {
  const [estate, setEstate] = useState("80000")
  const [spouse, setSpouse] = useState<"yes" | "no">("yes")

  const result = useMemo(() => {
    return calcInheritance({
      estate: manwonToWon(Number(estate) || 0),
      spouse: spouse === "yes",
    })
  }, [estate, spouse])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="적용 공제"
          amount={result?.deduction ?? null}
          caption={
            result
              ? result.spouseDeduction
                ? "일괄공제 + 배우자공제 최소"
                : "일괄공제"
              : undefined
          }
          rows={
            result
              ? [
                  { label: "일괄공제", value: formatWon(result.lump) },
                  ...(result.spouseDeduction
                    ? [{ label: "배우자공제(최소)", value: formatWon(result.spouseDeduction) }]
                    : []),
                  { label: "공제 후 과세표준", value: formatWon(result.taxable) },
                  { label: "위 공제만 적용한 산출세액", value: formatWon(result.tax) },
                ]
              : []
          }
          empty="상속재산만 넣으면 법정 공제 한도가 나옵니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="배우자"
          value={spouse}
          onChange={setSpouse}
          options={[
            { value: "yes", label: "있음" },
            { value: "no", label: "없음" },
          ]}
        />
        <MoneyField id="est" label="상속재산" value={estate} onChange={setEstate} />
        <p className="text-sm leading-6 text-muted-foreground">
          상증세법 일괄공제 {formatKoreanUnit(INHERITANCE.lump)}, 배우자 있으면 배우자공제 최소{" "}
          {formatKoreanUnit(INHERITANCE.spouseMin)}입니다. 채무·감정가·그 외 공제는 넣지 않았습니다.
          위 산출세액은 신고세액이 아닙니다.
        </p>
        <LawNote lines={[LAW_SOURCES.gift]} />
      </div>
    </CalcShell>
  )
}

export function LicenseTaxCalc({ item }: { item: CalcItem }) {
  const [value, setValue] = useState("40000")
  const [kind, setKind] = useState<"inherit" | "gift">("gift")

  const result = useMemo(() => {
    return calcLicenseTax({
      value: manwonToWon(Number(value) || 0),
      kind,
    })
  }, [value, kind])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="예상 등록면허세"
          amount={result?.total ?? null}
          caption={result ? formatPercent(result.rate * 100, 1) : undefined}
          rows={
            result
              ? [
                  { label: "등록면허세", value: formatWon(result.tax) },
                  { label: "지방교육세", value: formatWon(result.education) },
                ]
              : []
          }
          empty="과세표준만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="등기 원인"
          value={kind}
          onChange={setKind}
          options={[
            { value: "inherit", label: "상속" },
            { value: "gift", label: "증여" },
          ]}
        />
        <MoneyField id="lic" label="시가표준액" value={value} onChange={setValue} />
        <LawNote lines={[LAW_SOURCES.license]} />
      </div>
    </CalcShell>
  )
}

export function EncumberedGiftCalc({ item }: { item: CalcItem }) {
  const [property, setProperty] = useState("80000")
  const [debt, setDebt] = useState("20000")
  const [buy, setBuy] = useState("30000")
  const [years, setYears] = useState("8")
  const [relation, setRelation] = useState<GiftRelation>("descendant")

  const result = useMemo(() => {
    return calcEncumberedGift({
      property: manwonToWon(Number(property) || 0),
      debt: manwonToWon(Number(debt) || 0),
      buy: manwonToWon(Number(buy) || 0),
      years: Number(years) || 0,
      relation,
    })
  }, [property, debt, buy, years, relation])

  return (
    <CalcShell
      item={item}
      result={
        <ResultReceipt
          title="예상 세금 합계"
          amount={result?.total ?? null}
          caption="수증자 증여세 + 증여자 양도세"
          rows={
            result
              ? [
                  { label: "순증여", value: formatWon(result.giftAmount) },
                  { label: "승계 채무", value: formatWon(result.debt) },
                  { label: "증여세", value: formatWon(result.giftTax) },
                  { label: "양도세", value: formatWon(result.gainsTax) },
                ]
              : []
          }
          empty="증여재산과 채무만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="수증자"
          value={relation}
          onChange={setRelation}
          options={[
            { value: "spouse", label: "배우자" },
            { value: "descendant", label: "직계비속" },
            { value: "other", label: "그 외" },
          ]}
        />
        <MoneyField id="prop" label="증여재산가액" value={property} onChange={setProperty} />
        <MoneyField id="debt" label="승계 채무" value={debt} onChange={setDebt} />
        <MoneyField id="orig" label="원 취득가액" value={buy} onChange={setBuy} />
        <MoneyField id="ey" label="보유기간" unit="년" value={years} onChange={setYears} />
        <p className="text-sm leading-6 text-muted-foreground">
          채무 부분은 증여자 양도, 나머지가 수증자 증여입니다. 1주택 비과세는 넣지 않았습니다.
        </p>
        <LawNote lines={[LAW_SOURCES.gift, LAW_SOURCES.income]} />
      </div>
    </CalcShell>
  )
}

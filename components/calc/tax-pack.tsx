"use client"

import { useMemo, useState } from "react"
import { AmountChips } from "@/components/calc/amount-chips"
import { CheckRow } from "@/components/calc/check-row"
import { ChoiceGroup } from "@/components/calc/choice-group"
import { CalcShell } from "@/components/calc/calc-shell"
import { FaqList } from "@/components/calc/faq-list"
import { Hint } from "@/components/calc/hint"
import { LawNote } from "@/components/calc/law-note"
import { MoneyField } from "@/components/calc/money-field"
import { ResultReceipt } from "@/components/calc/result-receipt"
import { LAW_SOURCES } from "@/lib/law-sources"
import { formatKoreanUnit, formatPercent, formatWon, kakaoCopyLine, manwonToWon } from "@/lib/format"
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
  type InheritanceHeirs,
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
      faq={
        <FaqList
          items={[
            {
              q: "1주택이면 비과세인가요?",
              a: "2년 이상 보유하고 양도가액 12억 이하면 비과세입니다. 조정대상지역은 2년 거주도 필요합니다. 12억을 넘으면 넘는 분에만 과세합니다.",
            },
            {
              q: "다주택 중과는요?",
              a: "2026년 5월 10일 이후 양도분부터 다시 적용합니다. 중과 때는 장기보유특별공제를 적용하지 않습니다. 일시적 2주택 특례는 요건이 달라 넣지 않았습니다.",
            },
          ]}
        />
      }
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
        <AmountChips
          options={[
            { label: "3억", value: "30000" },
            { label: "5억", value: "50000" },
            { label: "8억", value: "80000" },
            { label: "12억", value: "120000" },
          ]}
          onPick={setBuy}
        />
        <div className="space-y-2">
          <MoneyField id="sell" label="양도가액" value={sell} onChange={setSell} />
          <AmountChips
            options={[
              { label: "6억", value: "60000" },
              { label: "8억", value: "80000" },
              { label: "12억", value: "120000" },
              { label: "15억", value: "150000" },
            ]}
            onPick={setSell}
          />
        </div>
        <MoneyField id="cost" label="필요경비" value={costs} onChange={setCosts} />
        <MoneyField id="yr" label="보유기간" unit="년" value={years} onChange={setYears} />
        <CheckRow id="live" checked={lived2y} onChange={setLived2y}>
          2년 이상 거주
        </CheckRow>
        <CheckRow id="adj" checked={adjusted} onChange={setAdjusted}>
          조정대상지역
        </CheckRow>
        <Hint>
          1주택·2년 보유·12억 이하는 비과세입니다. 조정대상지역은 2년 거주도 필요합니다. 다주택
          중과는 2026년 5월 10일 이후 양도분이며, 중과 때는 장기보유특별공제를 적용하지 않습니다.
        </Hint>
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
      faq={
        <FaqList
          items={[
            {
              q: "개인 양도세와 같나요?",
              a: "아닙니다. 법인이 부동산을 팔면 법인세에 토지 등 양도소득 추가과세가 붙을 수 있습니다. 1주택 비과세는 없습니다.",
            },
          ]}
        />
      }
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
        <div className="space-y-2">
          <MoneyField id="cbuy" label="취득가액" value={buy} onChange={setBuy} />
          <AmountChips
            options={[
              { label: "3억", value: "30000" },
              { label: "5억", value: "50000" },
              { label: "8억", value: "80000" },
              { label: "12억", value: "120000" },
            ]}
            onPick={setBuy}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="csell" label="양도가액" value={sell} onChange={setSell} />
          <AmountChips
            options={[
              { label: "6억", value: "60000" },
              { label: "8억", value: "80000" },
              { label: "12억", value: "120000" },
              { label: "15억", value: "150000" },
            ]}
            onPick={setSell}
          />
        </div>
        <MoneyField id="ccost" label="소요경비" value={costs} onChange={setCosts} />
        <CheckRow id="land" checked={land} onChange={setLand}>
          비사업용토지
        </CheckRow>
        <Hint>1주택 비과세는 없습니다. 비사업용토지면 추가과세가 붙습니다.</Hint>
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
      faq={
        <FaqList
          items={[
            {
              q: "재산세와 종부세를 같이 보나요?",
              a: "공시가격에 공정시장가액비율 60%를 곱한 뒤 재산세·도시지역분·지방교육세와 종부세·농특세를 한 장으로 보여 줍니다. 세부담상한과 특례주택은 넣지 않았습니다.",
            },
          ]}
        />
      }
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
        <AmountChips
          options={[
            { label: "6억", value: "60000" },
            { label: "9억", value: "90000" },
            { label: "12억", value: "120000" },
            { label: "18억", value: "180000" },
          ]}
          onPick={setPrice}
        />
        <Hint>
          공정시장가액비율 60%로 봅니다. 세부담상한과 특례주택은 넣지 않았습니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.holding]} />
      </div>
    </CalcShell>
  )
}

export function GiftTaxCalc({ item }: { item: CalcItem }) {
  const [amount, setAmount] = useState("20000")
  const [prior, setPrior] = useState("")
  const [relation, setRelation] = useState<GiftRelation>("descendant")

  const result = useMemo(() => {
    return calcGiftTax({
      amount: manwonToWon(Number(amount) || 0),
      prior: manwonToWon(Number(prior) || 0),
      relation,
    })
  }, [amount, prior, relation])

  const deductionLabel =
    relation === "spouse"
      ? formatKoreanUnit(GIFT_DEDUCTIONS.spouse)
      : relation === "other"
        ? formatKoreanUnit(GIFT_DEDUCTIONS.other)
        : formatKoreanUnit(GIFT_DEDUCTIONS.descendant)

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "누구에게 주는 건가요?",
              a: `공제는 받는 사람 기준입니다. 배우자 ${formatKoreanUnit(GIFT_DEDUCTIONS.spouse)}, 자녀·손주·부모는 ${formatKoreanUnit(GIFT_DEDUCTIONS.descendant)}, 그 외 친족은 ${formatKoreanUnit(GIFT_DEDUCTIONS.other)}입니다.`,
            },
            {
              q: "예전에 준 돈이 있으면요?",
              a: "같은 사람(직계존속이면 그 배우자 포함)에게 10년 안에 준 증여를 합칩니다. 합친 금액이 1천만 원 이상이면 이번 세금에서 이미 낸 세액을 뺍니다.",
            },
          ]}
        />
      }
      result={
        <ResultReceipt
          title="예상 증여세"
          amount={result?.tax ?? null}
          headline={result && result.tax === 0 ? "세금 없음" : undefined}
          caption={
            result
              ? result.tax === 0
                ? result.remaining > 0
                  ? `공제 ${formatKoreanUnit(result.remaining)} 남음`
                  : `공제 한도 ${deductionLabel}`
                : `세율 ${formatPercent(result.rate * 100, 0)}`
              : undefined
          }
          copyLine={
            result
              ? kakaoCopyLine("증여세", result.tax === 0 ? "세금 없음" : formatWon(result.tax), deductionLabel)
              : undefined
          }
          rows={
            result
              ? [
                  { label: "공제 한도", value: formatWon(result.deduction) },
                  ...(result.prior ? [{ label: "10년 합산", value: formatWon(result.prior) }] : []),
                  { label: "과세표준", value: formatWon(result.taxable) },
                  { label: "산출세액", value: formatWon(result.tax) },
                ]
              : []
          }
          empty="누구에게 주는지와 금액만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="누구에게 주나요?"
          value={relation}
          onChange={setRelation}
          options={[
            { value: "descendant", label: "자녀·손주" },
            { value: "spouse", label: "배우자" },
            { value: "ascendant", label: "부모·조부모" },
            { value: "other", label: "그 외" },
          ]}
        />
        <div className="space-y-2">
          <MoneyField id="gift" label="이번 증여" value={amount} onChange={setAmount} />
          <AmountChips
            options={[
              { label: "5천만", value: "5000" },
              { label: "1억", value: "10000" },
              { label: "3억", value: "30000" },
              { label: "6억", value: "60000" },
            ]}
            onPick={setAmount}
          />
        </div>
        <MoneyField
          id="prior"
          label="10년 내 같은 사람 증여"
          hint="없으면 비워 두세요"
          value={prior}
          onChange={setPrior}
        />
        <Hint>
          공제 한도는 {deductionLabel}입니다. 미성년 직계존속 2천만 원, 세대생략 할증은 넣지 않았습니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.gift]} />
      </div>
    </CalcShell>
  )
}

const CHILD_COUNTS = ["0", "1", "2", "3", "4", "5", "6", "7", "8"] as const

export function InheritanceCalc({ item }: { item: CalcItem }) {
  const [estate, setEstate] = useState("150000")
  const [debts, setDebts] = useState("")
  const [heirs, setHeirs] = useState<InheritanceHeirs>("spouse-children")
  const [children, setChildren] = useState<(typeof CHILD_COUNTS)[number]>("2")
  const [minorCount, setMinorCount] = useState("0")
  const [minorAge, setMinorAge] = useState("10")
  const [elderlyCount, setElderlyCount] = useState("0")
  const [finance, setFinance] = useState("")

  const result = useMemo(() => {
    return calcInheritance({
      estate: manwonToWon(Number(estate) || 0),
      debts: manwonToWon(Number(debts) || 0),
      heirs,
      children: heirs === "spouse-only" ? 0 : Number(children) || 0,
      minorCount: Number(minorCount) || 0,
      minorAge: Number(minorAge) || 0,
      elderlyCount: Number(elderlyCount) || 0,
      finance: manwonToWon(Number(finance) || 0),
    })
  }, [estate, debts, heirs, children, minorCount, minorAge, elderlyCount, finance])

  return (
    <CalcShell
      item={item}
      faq={
        <FaqList
          items={[
            {
              q: "자녀가 결혼하면 공제가 늘어나나요?",
              a: `아닙니다. 상속세 자녀 공제는 혼인 여부와 관계없이 1인 ${formatKoreanUnit(INHERITANCE.child)}입니다. 며느리·사위는 자녀 공제 대상이 아니고, 동거가족(직계존비속·형제자매)에도 들어가지 않습니다. 연말정산 부양가족 공제와는 다릅니다. 자녀가 먼저 돌아가셔 그 배우자가 대습상속하면 상속인이 되므로, 65세 이상이면 경로공제만 넣을 수 있습니다.`,
            },
            {
              q: "얼마까지 세금이 없나요?",
              a: `배우자·자녀가 함께 받으면 일괄공제 ${formatKoreanUnit(INHERITANCE.lump)}과 배우자공제 최소 ${formatKoreanUnit(INHERITANCE.spouseMin)}을 더해 보통 ${formatKoreanUnit(INHERITANCE.lump + INHERITANCE.spouseMin)}까지는 없습니다. 자녀가 많거나 미성년·65세 공제가 크면 일괄 대신 인적공제 합계를 씁니다. 자녀만이면 일괄 ${formatKoreanUnit(INHERITANCE.lump)}과 인적공제 중 큰 금액입니다. 배우자만 받으면 일괄을 쓰지 못하고 기초 ${formatKoreanUnit(INHERITANCE.basic)}과 배우자공제 최소를 더합니다.`,
            },
            {
              q: "금융재산공제는요?",
              a: `예금·보험 등에서 금융빚을 뺀 순금융재산입니다. ${formatKoreanUnit(INHERITANCE.financeFull)} 이하면 전액, 넘으면 20%와 ${formatKoreanUnit(INHERITANCE.financeFloor)} 중 큰 금액이며 한도는 ${formatKoreanUnit(INHERITANCE.financeCap)}입니다. 일괄공제와는 별도로 더합니다.`,
            },
            {
              q: "집값만 넣으면 되나요?",
              a: "상속재산은 부동산·예금·보험 등을 더한 가액입니다. 대출 등 빚이 있으면 빼는 칸에 넣습니다. 감정가·사전증여 합산·동거주택 공제는 넣지 않았습니다.",
            },
            {
              q: "배우자가 더 받으면요?",
              a: `여기서는 배우자공제 최소 ${formatKoreanUnit(INHERITANCE.spouseMin)}만 넣습니다. 실제로 더 받으면 한도 ${formatKoreanUnit(INHERITANCE.spouseMax)}까지 세금이 더 줄어들 수 있습니다. 신고세액이 아닙니다.`,
            },
          ]}
        />
      }
      result={
        <ResultReceipt
          title="예상 상속세"
          amount={result?.tax ?? null}
          headline={result && result.tax === 0 ? "세금 없음" : undefined}
          caption={
            result
              ? result.tax === 0
                ? `${formatKoreanUnit(result.deduction)}까지는 공제`
                : `세율 ${formatPercent(result.rate * 100, 0)}`
              : undefined
          }
          copyLine={
            result
              ? kakaoCopyLine(
                  "상속세",
                  result.tax === 0 ? "세금 없음" : formatWon(result.tax),
                  `${formatKoreanUnit(result.deduction)} 공제`,
                )
              : undefined
          }
          rows={
            result
              ? [
                  { label: "순상속재산", value: formatWon(result.net) },
                  ...(result.usedLump
                    ? [
                        { label: "일괄공제", value: formatWon(result.lump) },
                        {
                          label: "인적공제 합계(비교)",
                          value: formatWon(result.itemized),
                          mute: true,
                        },
                      ]
                    : [
                        ...(result.basic
                          ? [{ label: "기초공제", value: formatWon(result.basic) }]
                          : []),
                        ...(result.childDeduction
                          ? [{ label: "자녀공제", value: formatWon(result.childDeduction) }]
                          : []),
                        ...(result.minorDeduction
                          ? [{ label: "미성년공제", value: formatWon(result.minorDeduction) }]
                          : []),
                        ...(result.elderlyDeduction
                          ? [{ label: "65세 이상 공제", value: formatWon(result.elderlyDeduction) }]
                          : []),
                      ]),
                  ...(result.spouseDeduction
                    ? [{ label: "배우자공제(최소)", value: formatWon(result.spouseDeduction) }]
                    : []),
                  ...(result.financeDeduction
                    ? [{ label: "금융재산공제", value: formatWon(result.financeDeduction) }]
                    : []),
                  { label: "이 금액까지 0원", value: formatWon(result.deduction) },
                  { label: "과세표준", value: formatWon(result.taxable) },
                  { label: "산출세액", value: formatWon(result.tax) },
                ]
              : []
          }
          empty="누가 받는지와 재산만 넣으면 됩니다."
        />
      }
    >
      <div className="space-y-5">
        <ChoiceGroup
          label="누가 받나요?"
          value={heirs}
          onChange={setHeirs}
          options={[
            { value: "spouse-children", label: "배우자·자녀" },
            { value: "children", label: "자녀만" },
            { value: "spouse-only", label: "배우자만" },
          ]}
        />
        {heirs !== "spouse-only" ? (
          <div className="space-y-2">
            <ChoiceGroup
              label="자녀 수"
              value={children}
              onChange={setChildren}
              options={CHILD_COUNTS.map((value) => ({
                value,
                label: value === "0" ? "없음" : `${value}명`,
              }))}
            />
            <Hint>
              피상속인의 자녀만 넣습니다. 결혼 여부와 관계없이 1인{" "}
              {formatKoreanUnit(INHERITANCE.child)}이고, 며느리·사위는 넣지 않습니다.
            </Hint>
          </div>
        ) : null}
        <div className="space-y-2">
          <MoneyField id="est" label="상속재산" value={estate} onChange={setEstate} />
          <AmountChips
            options={[
              { label: "5억", value: "50000" },
              { label: "10억", value: "100000" },
              { label: "15억", value: "150000" },
              { label: "20억", value: "200000" },
              { label: "30억", value: "300000" },
            ]}
            onPick={setEstate}
          />
        </div>
        <MoneyField
          id="debt"
          label="빚·대출"
          hint="없으면 비워 두세요"
          value={debts}
          onChange={setDebts}
        />
        <details className="rounded-xl bg-secondary/60 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">
            미성년·65세 이상·금융재산
          </summary>
          <div className="mt-3 space-y-4">
            <MoneyField
              id="minors"
              label="미성년 상속인·동거가족"
              hint="배우자 제외"
              unit="명"
              value={minorCount}
              onChange={setMinorCount}
            />
            {Number(minorCount) > 0 ? (
              <MoneyField
                id="minor-age"
                label="그 사람 만나이"
                hint={`19세까지 ${formatKoreanUnit(INHERITANCE.minorPerYear)}×연수`}
                unit="세"
                value={minorAge}
                onChange={setMinorAge}
              />
            ) : null}
            <MoneyField
              id="elderly"
              label="65세 이상 상속인·동거가족"
              hint="배우자 제외. 대습한 며느리·사위면 여기"
              unit="명"
              value={elderlyCount}
              onChange={setElderlyCount}
            />
            <MoneyField
              id="finance"
              label="순금융재산"
              hint="예금·보험 − 금융빚"
              value={finance}
              onChange={setFinance}
            />
            <Hint>
              미성년·65세 이상은 자녀 공제와 겹쳐도 됩니다. 동거가족은 피상속인이 부양한
              직계존비속(배우자의 부모 포함)과 형제자매입니다.
            </Hint>
          </div>
        </details>
        <Hint>
          집·예금·보험을 더한 가액을 넣으면 됩니다. 배우자·자녀면 보통{" "}
          {formatKoreanUnit(INHERITANCE.lump + INHERITANCE.spouseMin)}까지, 자녀만이면{" "}
          {formatKoreanUnit(INHERITANCE.lump)}까지는 세금이 없습니다. 위 산출세액은 신고세액이
          아닙니다.
        </Hint>
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
      faq={
        <FaqList
          items={[
            {
              q: "상속과 증여 세율이 다른가요?",
              a: "등록면허세는 상속 0.8%, 증여 1.5%입니다. 지방교육세가 붙습니다. 취득세 중과와는 별개입니다.",
            },
          ]}
        />
      }
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
        <AmountChips
          options={[
            { label: "2억", value: "20000" },
            { label: "4억", value: "40000" },
            { label: "8억", value: "80000" },
            { label: "12억", value: "120000" },
          ]}
          onPick={setValue}
        />
        <Hint>상속 0.8%, 증여 1.5%입니다. 취득세 중과는 여기 없습니다.</Hint>
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
      faq={
        <FaqList
          items={[
            {
              q: "왜 세금이 두 개인가요?",
              a: "채무를 넘기면 그 부분은 증여자 양도, 나머지가 수증자 증여입니다. 1주택 비과세는 넣지 않았습니다.",
            },
          ]}
        />
      }
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
            { value: "descendant", label: "자녀·손주" },
            { value: "spouse", label: "배우자" },
            { value: "other", label: "그 외" },
          ]}
        />
        <div className="space-y-2">
          <MoneyField id="prop" label="증여재산가액" value={property} onChange={setProperty} />
          <AmountChips
            options={[
              { label: "5억", value: "50000" },
              { label: "8억", value: "80000" },
              { label: "12억", value: "120000" },
              { label: "15억", value: "150000" },
            ]}
            onPick={setProperty}
          />
        </div>
        <div className="space-y-2">
          <MoneyField id="debt" label="승계 채무" value={debt} onChange={setDebt} />
          <AmountChips
            options={[
              { label: "1억", value: "10000" },
              { label: "2억", value: "20000" },
              { label: "3억", value: "30000" },
              { label: "5억", value: "50000" },
            ]}
            onPick={setDebt}
          />
        </div>
        <MoneyField id="orig" label="원 취득가액" value={buy} onChange={setBuy} />
        <MoneyField id="ey" label="보유기간" unit="년" value={years} onChange={setYears} />
        <Hint>
          채무 부분은 증여자 양도, 나머지가 수증자 증여입니다. 1주택 비과세는 넣지 않았습니다.
        </Hint>
        <LawNote lines={[LAW_SOURCES.gift, LAW_SOURCES.income]} />
      </div>
    </CalcShell>
  )
}

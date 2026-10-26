import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { estimatesApi, objectsApi, objectStatusesApi, contractsApi, actsApi, materialsApi, addendaApi, Estimate, ObjectItem, ObjectStatus, Contract, Act, MaterialEstimate, ContractAddendum, MaterialItem } from "@/lib/api"
import { printMaterials, downloadMaterialsPdf } from "@/lib/printMaterials"
import { printEstimate, downloadEstimatePdf } from "@/lib/printEstimate"
import { downloadContractPdf } from "@/lib/downloadContractPdf"
import { printAct, printAddendum, darkenActHtml } from "@/lib/printAct"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import { printHtml } from "@/lib/printHtml"
import { useAuth } from "@/contexts/AuthContext"
import { TabKey, isPurchaseList } from "@/components/crm/documents/constants"
import { printPurchaseList, downloadPurchaseListPdf } from "@/lib/printPurchaseList"

async function safeDelete(fn: () => Promise<unknown>) {
  try {
    await fn()
  } catch (e) {
    window.alert((e as Error)?.message || "Не удалось удалить документ")
  }
}

export function useDocumentsData() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [acts, setActs] = useState<Act[]>([])
  const [addenda, setAddenda] = useState<ContractAddendum[]>([])
  const [addBusyId, setAddBusyId] = useState<number | null>(null)
  const [matEstimates, setMatEstimates] = useState<MaterialEstimate[]>([])
  const [catalog, setCatalog] = useState<MaterialItem[]>([])
  const [matBusyId, setMatBusyId] = useState<number | null>(null)
  const [matSendFor, setMatSendFor] = useState<MaterialEstimate | null>(null)
  const [objectsMap, setObjectsMap] = useState<Record<number, ObjectItem>>({})
  const [objectStatuses, setObjectStatuses] = useState<ObjectStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>("all")
  const [search, setSearch] = useState("")
  const [printingId, setPrintingId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [downloadingContractId, setDownloadingContractId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    addendaApi
      .list({})
      .then((d) => setAddenda(d.addenda || []))
      .catch(() => setAddenda([]))
    Promise.all([estimatesApi.listAll(), contractsApi.listAll(), actsApi.listAll(), objectsApi.list(), objectStatusesApi.list(), materialsApi.list()])
      .then(([estData, contractsData, actsData, objData, statusData, matData]) => {
        setEstimates(estData.estimates)
        setContracts(contractsData.contracts)
        setActs(actsData.acts)
        setMatEstimates(matData.estimates || [])
        setCatalog(matData.materials || [])
        const map: Record<number, ObjectItem> = {}
        objData.objects.forEach((o) => { map[o.id] = o })
        setObjectsMap(map)
        setObjectStatuses(statusData.statuses)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: number) => {
    await safeDelete(() => estimatesApi.remove(id))
    load()
  }

  const handleDeleteContract = async (id: number) => {
    await safeDelete(() => contractsApi.remove(id))
    load()
  }

  const handleDeleteAct = async (id: number) => {
    await safeDelete(() => actsApi.remove(id))
    load()
  }

  const handleDeleteAddendum = async (id: number) => {
    await safeDelete(() => addendaApi.remove(id))
    load()
  }

  const handleAddendum = async (d: ContractAddendum, mode: "print" | "pdf") => {
    setAddBusyId(mode === "print" ? d.id : -d.id)
    try {
      const full = await addendaApi.get(d.id)
      if (mode === "print") printAddendum({ addendum_number: full.addendum_number, content_html: full.content_html || "" })
      else await downloadContractPdf(darkenActHtml(full.content_html || ""), `ДС ${full.addendum_number} к договору ${full.contract_number || ""}`.trim())
    } finally {
      setAddBusyId(null)
    }
  }

  const handleDownloadActPdf = async (act: Act) => {
    setDownloadingContractId(-act.id)
    try {
      await downloadContractPdf(darkenActHtml(act.content_html), `Акт ${act.act_number}`)
    } finally {
      setDownloadingContractId(null)
    }
  }

  const handlePrintAct = (act: Act) => {
    printAct(act)
  }

  const handlePrint = async (est: Estimate) => {
    const obj = objectsMap[est.object_id]
    if (!obj) return
    setPrintingId(est.id)
    try {
      const full = await estimatesApi.get(est.id)
      printEstimate(full, obj, user?.company_name || "")
    } finally {
      setPrintingId(null)
    }
  }

  const handlePrintContract = (contract: Contract) => {
    printHtml(`Договор № ${contract.contract_number}`, `${docBrandHeader("")}${contract.content_html}`, docBrandStyles)
  }

  const handleDownloadContractPdf = async (contract: Contract) => {
    setDownloadingContractId(contract.id)
    try {
      await downloadContractPdf(contract.content_html, contract.contract_number)
    } finally {
      setDownloadingContractId(null)
    }
  }

  const handleDownloadPdf = async (est: Estimate) => {
    const obj = objectsMap[est.object_id]
    if (!obj) return
    setDownloadingId(est.id)
    try {
      const full = await estimatesApi.get(est.id)
      await downloadEstimatePdf(full, obj, user?.company_name || "")
    } finally {
      setDownloadingId(null)
    }
  }

  const isExecTab = tab === "executors"
  const hireContracts = useMemo(() => contracts.filter((c) => c.options?.our_role === "customer"), [contracts])
  const hireContractIds = useMemo(() => new Set(hireContracts.map((c) => c.id)), [hireContracts])
  const hireEstimateIds = useMemo(
    () => new Set(hireContracts.map((c) => c.estimate_id).filter((x): x is number => Boolean(x))),
    [hireContracts]
  )

  const filteredEstimates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return estimates.filter((e) => {
      if (tab === "executors" && !hireEstimateIds.has(e.id)) return false
      if (!q) return true
      return (
        String(e.id).includes(q) ||
        (e.object_code || "").toLowerCase().includes(q) ||
        (e.client_name || "").toLowerCase().includes(q)
      )
    })
  }, [estimates, search, tab, hireEstimateIds])

  const matchMat = (m: MaterialEstimate, q: string) =>
    !q ||
    String(m.id).includes(q) ||
    (m.object_code || "").toLowerCase().includes(q) ||
    (m.client_name || "").toLowerCase().includes(q)

  const filteredPurchaseLists = useMemo(() => {
    const q = search.trim().toLowerCase()
    return matEstimates.filter((m) => isPurchaseList(m.title) && matchMat(m, q))
  }, [matEstimates, search])

  const filteredMatEstimates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return matEstimates.filter((m) => {
      if (isPurchaseList(m.title)) return false
      if (!q) return true
      return (
        String(m.id).includes(q) ||
        (m.object_code || "").toLowerCase().includes(q) ||
        (m.client_name || "").toLowerCase().includes(q)
      )
    })
  }, [matEstimates, search])

  const handleDeleteMatEstimate = async (id: number) => {
    await safeDelete(() => materialsApi.removeEstimate(id))
    load()
  }

  const loadMatDoc = async (id: number) => {
    const { estimate } = await materialsApi.getEstimate(id)
    const obj = {
      id: estimate.object_id,
      object_code: estimate.object_code,
      client_name: estimate.client_name,
      address: estimate.address || "",
    }
    return { obj, items: estimate.items || [] }
  }

  const openPurchaseList = async (m: MaterialEstimate, mode: "view" | "print" | "pdf") => {
    if (mode === "view") {
      navigate(`/cabinet/purchase-lists/${m.id}`)
      return
    }
    setMatBusyId(mode === "pdf" ? -m.id : m.id)
    try {
      const { obj, items } = await loadMatDoc(m.id)
      const company = user?.company_name || ""
      if (mode === "pdf") await downloadPurchaseListPdf(obj, items, catalog, company)
      else printPurchaseList(obj, items, catalog, company, mode === "print")
    } catch (e) {
      window.alert((e as Error)?.message || "Не удалось открыть список")
    } finally {
      setMatBusyId(null)
    }
  }

  const openMatEstimate = async (m: MaterialEstimate, mode: "print" | "pdf" | "email") => {
    if (mode === "email") {
      setMatSendFor(m)
      return
    }
    setMatBusyId(m.id)
    try {
      const { estimate } = await materialsApi.getEstimate(m.id)
      const obj = {
        id: estimate.object_id,
        object_code: estimate.object_code,
        client_name: estimate.client_name,
        address: estimate.address || "",
      }
      const items = estimate.items || []
      if (mode === "print") printMaterials(obj, items, [], user?.company_name || "", false, m.title)
      else await downloadMaterialsPdf(obj, items, [], user?.company_name || "", m.title)
    } finally {
      setMatBusyId(null)
    }
  }

  const filteredContracts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contracts.filter((c) => {
      if (isExecTab && c.options?.our_role !== "customer") return false
      if (!q) return true
      return (
        (c.options?.contractor_name || "").toLowerCase().includes(q) ||
        (c.options?.contractor_org_name || "").toLowerCase().includes(q) ||
        c.contract_number.toLowerCase().includes(q) ||
        (c.object_code || "").toLowerCase().includes(q) ||
        (c.client_name || "").toLowerCase().includes(q)
      )
    })
  }, [contracts, search, isExecTab])

  const filteredActs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return acts.filter((a) => {
      if (isExecTab && !(a.contract_id && hireContractIds.has(a.contract_id))) return false
      if (!q) return true
      return (
        a.act_number.toLowerCase().includes(q) ||
        (a.object_code || "").toLowerCase().includes(q) ||
        (a.client_name || "").toLowerCase().includes(q)
      )
    })
  }, [acts, search, isExecTab, hireContractIds])

  const filteredAddenda = useMemo(() => {
    const q = search.trim().toLowerCase()
    return addenda.filter((d) => {
      if (!q) return true
      return (
        String(d.addendum_number || "").toLowerCase().includes(q) ||
        String(d.contract_number || "").toLowerCase().includes(q) ||
        (d.object_code || "").toLowerCase().includes(q) ||
        (d.client_name || "").toLowerCase().includes(q)
      )
    })
  }, [addenda, search])

  const showAddenda = tab === "all" || tab === "addenda"
  const showEstimates = tab === "all" || tab === "estimates" || tab === "executors"
  const showMatEstimates = tab === "all" || tab === "material_estimates"
  const showPurchaseLists = tab === "all" || tab === "purchase_lists"
  const showContracts = tab === "all" || tab === "contracts" || tab === "executors"
  const showActs = tab === "all" || tab === "acts" || tab === "executors"
  const hasAnyRows =
    (showEstimates && filteredEstimates.length > 0) ||
    (showMatEstimates && filteredMatEstimates.length > 0) ||
    (showPurchaseLists && filteredPurchaseLists.length > 0) ||
    (showContracts && filteredContracts.length > 0) ||
    (showActs && filteredActs.length > 0) ||
    (showAddenda && filteredAddenda.length > 0)

  return {
    user,
    addBusyId,
    matBusyId,
    matSendFor,
    setMatSendFor,
    objectsMap,
    objectStatuses,
    loading,
    tab,
    setTab,
    search,
    setSearch,
    printingId,
    downloadingId,
    downloadingContractId,
    handleDelete,
    handleDeleteContract,
    handleDeleteAct,
    handleDeleteAddendum,
    handleAddendum,
    handleDownloadActPdf,
    handlePrintAct,
    handlePrint,
    handlePrintContract,
    handleDownloadContractPdf,
    handleDownloadPdf,
    filteredEstimates,
    filteredMatEstimates,
    handleDeleteMatEstimate,
    loadMatDoc,
    openMatEstimate,
    openPurchaseList,
    filteredPurchaseLists,
    showPurchaseLists,
    filteredContracts,
    filteredActs,
    filteredAddenda,
    showAddenda,
    showEstimates,
    showMatEstimates,
    showContracts,
    showActs,
    hasAnyRows,
  }
}

export type DocumentsData = ReturnType<typeof useDocumentsData>

export default useDocumentsData

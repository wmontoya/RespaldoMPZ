"use client"
import { useEffect, useState } from "react"
import { useSurveyState } from "@/store/matureModel/surveyStore"
import Loader from "@/components/globals/loader/Loader"
import { BiArrowBack, BiCalendar, BiChevronRight, BiFilter } from "react-icons/bi"
import { FaClipboardList } from "react-icons/fa"
import Link from "next/link"
import { useShared } from "@/hooks/useShared"
import { useSevriStore } from "@/store/sevriModel/sevriStore"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@nextui-org/button"
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover"
import DateRangePicker from "@/components/globals/DateRangePicker"

export default function MatureModel() {
  useShared()
  const { getHistorySevriProcesses, historySevriProcesses } = useSevriStore()
  const { isLoading, setIsLoading } = useSurveyState()
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const fetchEvaluation = async () => {
    setIsLoading(true)
    await getHistorySevriProcesses()
    setIsLoading(false)
  }

  useEffect(() => {
    fetchEvaluation()
  }, [])


  const filteredEvaluations = historySevriProcesses.filter((evaluation) => {
    if (dateRange.from || dateRange.to) {
      const initialDate = new Date(evaluation.initial_date);
      const finalDate = new Date(evaluation.final_date);
      const isInitialDateInRange =
        (!dateRange.from || initialDate >= dateRange.from) &&
        (!dateRange.to || initialDate <= dateRange.to);
      const isFinalDateInRange =
        (!dateRange.from || finalDate >= dateRange.from) &&
        (!dateRange.to || finalDate <= dateRange.to);
      if (!isInitialDateInRange && !isFinalDateInRange) {
        return false;
      }
    }

    return true;
  });
  const clearFilters = () => {
    setSearchTerm("")
    setDateRange({ from: undefined, to: undefined })
  }

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range)
    setIsDatePickerOpen(false)
  }

  if (isLoading)
    return (
      <section className="min-h-screen bg-[#001440] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-orange-500 mb-4">Cargando...</h1>
          <Loader />
        </div>
      </section>
    )

  if (!isLoading && !historySevriProcesses.length) {
    return (
      <section className="min-h-screen bg-[#001440] flex items-center justify-center text-white p-6">
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
            <p className="text-orange-400 text-xl font-medium">No hay datos por mostrar</p>
            <p className="text-orange-300/70 mt-2">El departamento aún no cuenta con un historial</p>
            <div className="flex justify-center mt-4">
              <Link href="/menu-Evaluations/history" className="flex items-center gap-2 px-6 py-3 bg-blue-600/70 hover:bg-blue-500/70 rounded-md transition duration-300"
              >
                <BiArrowBack className="mr-2" /> Volver
              </Link>
            </div>
          </div>
        </div>
        {/* <div className="text-center bg-white rounded-lg p-8 shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No hay datos por mostrar</h2>
          <div className="flex justify-center mt-4">
            <Button
              as={Link}
              href="/menu-Evaluations/history"
              color="warning"
              className="px-6 py-3 flex items-center gap-2"
            >
              <BiArrowBack />
              <span>Volver</span>
            </Button>
          </div>
        </div> */}
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-[#001440] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="w-full flex justify-between items-center mb-6">
          <Link href="/menu-Evaluations/history" className="flex items-center gap-2 px-6 py-3 bg-blue-600/70 hover:bg-blue-500/70 rounded-md transition duration-300"
          >
            <BiArrowBack className="mr-2" /> Volver
          </Link>
        </div>

        <div className="flex items-center justify-center mb-2">
          <FaClipboardList className="text-orange-500 text-3xl mr-3" />
          <h1 className="text-3xl font-bold text-white">Actividades</h1>
        </div>


        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex gap-2 items-center">
                <Popover isOpen={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger>
                    <Button
                      variant="bordered"
                      className={`justify-start text-left font-normal ${dateRange.from || dateRange.to
                        ? "text-orange-600 border-orange-500 bg-orange-50"
                        : "border-gray-300 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      startContent={<BiCalendar className="text-current" />}
                    >
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd MMM yyyy", { locale: es })} -{" "}
                            {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                          </>
                        ) : (
                          format(dateRange.from, "dd MMM yyyy", { locale: es })
                        )
                      ) : (
                        "Filtrar por fecha"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto">
                    <DateRangePicker
                      initialRange={dateRange}
                      onRangeChange={handleDateRangeChange}
                      onCancel={() => setIsDatePickerOpen(false)}
                    />
                  </PopoverContent>
                </Popover>

                {(searchTerm || dateRange.from || dateRange.to) && (
                  <Button variant="light" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredEvaluations.length > 0 ? (
              filteredEvaluations.map((evaluation, index) => (
                <Link
                  key={index}
                  href={`history/${evaluation.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-md transition-all duration-200 text-gray-800 border-l-4 border-orange-500"
                >
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-full mr-4">
                      <FaClipboardList className="text-orange-500" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{"Encuesta SEVRI"}</h3>
                      <div className="text-sm text-gray-600">
                        <p>Inicial: {format(new Date(evaluation.initial_date), "dd MMM yyyy", { locale: es })}</p>
                        <p>Final: {format(new Date(evaluation.final_date), "dd MMM yyyy", { locale: es })}</p>
                      </div>
                    </div>
                  </div>
                  <BiChevronRight size={24} className="text-gray-400" />
                </Link>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <BiFilter size={40} className="mx-auto text-gray-400 mb-2" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">No hay resultados</h2>
                <p className="text-gray-600">No se encontraron evaluaciones que coincidan con los filtros aplicados</p>
                <Button color="warning" onClick={clearFilters} className="mt-4">
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

